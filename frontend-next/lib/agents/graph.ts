/**
 * Travel Agent — LangGraph.js Multi-Agent Implementation
 *
 * Graph topology (explicit DAG):
 *
 *   START → parse_intent → router ──── "trip_plan"       → get_profile → fetch_flights ──┐
 *                                  ├── "travel_interest" → nudge_booking → END            ├→ build_itinerary → create_summary → END
 *                                  └── "simple_query"    → direct_answer → END            │  fetch_hotels  ──┤
 *                                                                                          │  fetch_weather ──┤
 *                                                                                          │  fetch_dest    ──┘
 *
 * Key LangGraph concepts demonstrated:
 *   1. Typed state via Annotation.Root with custom reducers
 *   2. Conditional routing via addConditionalEdges (router node)
 *   3. Fan-out: get_profile → [fetch_flights, fetch_hotels, fetch_weather, fetch_dest] in parallel
 *   4. Fan-in: all 4 results merge into build_itinerary automatically
 *   5. Explicit DAG — topology is code, not hidden in a while-loop
 */

import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { AzureChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import {
    searchFlights,
    searchHotels,
    getDestinationInfo,
    SearchFlightsInput,
    SearchHotelsInput,
    GetDestinationInput,
    WeatherForecast,
    TripSummary,
} from './tools';
import type { ConversationMessage } from './orchestrator';

// ─── LangChain model factory ──────────────────────────────────────────────────
// Using AzureChatOpenAI (not raw openai SDK) so LangSmith automatically traces
// every LLM call — prompt, completion, token counts, latency — inside each node.

const ORCHESTRATOR_DEPLOYMENT = process.env.AZURE_ORCHESTRATOR_DEPLOYMENT || 'gpt-4.1';
const SUBAGENT_DEPLOYMENT = process.env.AZURE_SUBAGENT_DEPLOYMENT || 'gpt-5.4-mini';

function createModel(deployment: string, maxTokens: number): AzureChatOpenAI {
    return new AzureChatOpenAI({
        azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT!,
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY!,
        azureOpenAIApiVersion: '2025-01-01-preview',
        azureOpenAIApiDeploymentName: deployment,
        modelKwargs: { max_completion_tokens: maxTokens },
    });
}

type SSEWriter = (event: Record<string, any>) => void;

// ─── Structured trip parameters extracted by parse_intent node ────────────────

interface TripParams {
    userName: string;
    origin: string;
    destination: string;
    destinationCity: string;
    destinationCode: string;
    departureDate: string;
    returnDate: string | null;
    passengers: number;
    cabinClass: string;
    travelPurpose: string;
    tripContext: string;
    durationDays: number;
}

// ─── LangGraph typed state ────────────────────────────────────────────────────
//
// Annotation.Root gives each field a typed reducer. The `reducer` determines
// how concurrent updates from parallel nodes are merged into the shared state.
// `(a, b) => b ?? a` means "take the new value if provided, else keep old" —
// suitable for fields written by exactly one node. The `usage` field uses
// additive reduction to accumulate token counts across all nodes.

const TravelState = Annotation.Root({
    messages:    Annotation<ConversationMessage[]>({ reducer: (_, b) => b, default: () => [] }),
    writeSSE:    Annotation<SSEWriter>({ reducer: (_a, b) => b, default: () => (_: any) => {} }),
    intentType:  Annotation<'trip_plan' | 'travel_interest' | 'simple_query'>({ reducer: (a, b) => b ?? a, default: () => 'trip_plan' }),
    tripParams:  Annotation<TripParams | null>({ reducer: (a, b) => b ?? a, default: () => null }),
    profile:     Annotation<any>({ reducer: (a, b) => b ?? a, default: () => null }),
    flights:     Annotation<any>({ reducer: (a, b) => b ?? a, default: () => null }),
    hotels:      Annotation<any>({ reducer: (a, b) => b ?? a, default: () => null }),
    weather:     Annotation<any>({ reducer: (a, b) => b ?? a, default: () => null }),
    destination: Annotation<any>({ reducer: (a, b) => b ?? a, default: () => null }),
    itinerary:   Annotation<any>({ reducer: (a, b) => b ?? a, default: () => null }),
    summary:     Annotation<any>({ reducer: (a, b) => b ?? a, default: () => null }),
    usage:       Annotation<{ input: number; output: number }>({
        reducer: (a, b) => ({ input: a.input + b.input, output: a.output + b.output }),
        default: () => ({ input: 0, output: 0 }),
    }),
});

type GraphState = typeof TravelState.State;

// ─── Shared sub-agent helper ──────────────────────────────────────────────────
// callLLM uses AzureChatOpenAI so every invocation is automatically traced
// in LangSmith with full prompt/response/token details, nested under the
// parent node's span in the graph execution timeline.

function stripFences(raw: string): string {
    return raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

async function callLLM(
    deployment: string,
    systemPrompt: string,
    userMessage: string,
    maxTokens = 2000,
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
    const model = createModel(deployment, maxTokens);
    const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userMessage),
    ]);
    const text = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    const usage = response.usage_metadata;
    return {
        text,
        inputTokens: usage?.input_tokens ?? 0,
        outputTokens: usage?.output_tokens ?? 0,
    };
}

// ─── Node: parse_intent ───────────────────────────────────────────────────────
// Extracts structured trip parameters from the conversation so all downstream
// nodes share a single source of truth — no LLM re-parsing needed per node.

const PARSE_INTENT_PROMPT = `Extract trip parameters from the conversation below. The latest user message may reference a destination discussed earlier — use the full conversation to resolve it. Respond ONLY with valid JSON, no markdown:
{
  "userName": "string (infer from message or use 'Guest')",
  "origin": "string (IATA city code: BOM|DEL|BLR|MAA|HYD|CCU)",
  "destination": "string (IATA city code: DPS|SIN|DXB|LHR|SYD|BKK|NRT|CDG|JFK|MLE|KUL|HKG)",
  "destinationCity": "string (human-readable city name)",
  "destinationCode": "string (same as destination IATA code)",
  "departureDate": "string (YYYY-MM-DD)",
  "returnDate": "string|null (YYYY-MM-DD if round trip)",
  "passengers": number,
  "cabinClass": "Economy|Premium Economy|Business",
  "travelPurpose": "leisure|business|honeymoon|family|adventure|solo",
  "tripContext": "string (1 sentence summarising trip for profile agent)",
  "durationDays": number
}
If a field cannot be determined, use sensible defaults (e.g. passengers=1, cabinClass=Economy).`;

function buildConversationContext(messages: ConversationMessage[]): string {
    return messages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');
}

async function parseIntentNode(state: GraphState): Promise<Partial<GraphState>> {
    const userMessage = state.messages.filter(m => m.role === 'user').at(-1)?.content ?? '';
    // Use full conversation so destination from a prior turn (e.g. "Dubai weather" → "build itinerary")
    // is visible to the LLM when the latest message doesn't repeat it.
    const context = buildConversationContext(state.messages);

    state.writeSSE({ type: 'agent_start', agent: 'parse-intent', toolName: 'parse_intent', query: { message: userMessage.slice(0, 80) } });

    const { text, inputTokens, outputTokens } = await callLLM(
        ORCHESTRATOR_DEPLOYMENT, PARSE_INTENT_PROMPT, context, 400,
    );

    let tripParams: TripParams;
    try {
        tripParams = JSON.parse(stripFences(text));
    } catch {
        tripParams = {
            userName: 'Guest', origin: 'BOM', destination: 'SIN',
            destinationCity: 'Singapore', destinationCode: 'SIN',
            departureDate: new Date().toISOString().slice(0, 10), returnDate: null,
            passengers: 1, cabinClass: 'Economy', travelPurpose: 'leisure',
            tripContext: 'international leisure travel', durationDays: 7,
        };
    }

    state.writeSSE({ type: 'agent_result', agent: 'parse-intent', toolName: 'parse_intent', data: tripParams });
    return { tripParams, usage: { input: inputTokens, output: outputTokens } };
}

// ─── Node: router ────────────────────────────────────────────────────────────
// Three-way classifier: trip_plan | travel_interest | simple_query
// addConditionalEdges reads intentType from state to pick the next node.

const ROUTER_PROMPT = `You are a travel assistant intent classifier. Classify the LATEST user message as exactly one of three intents.

"trip_plan"       — the user is EXPLICITLY asking to plan, book, build, or search for a trip RIGHT NOW. Must contain an action verb like: plan, book, build, find, search, create, take me, I want to go. Merely mentioning a destination, number of people, or duration does NOT make it a trip_plan.
"travel_interest" — the user is asking an informational or exploratory question about travel. Includes: cost/budget questions, weather, best time, what to do, visa info, is it worth it, how much, comparisons. Contains trip parameters (people, days) but is phrased as a QUESTION, not a booking request.
"simple_query"    — a purely factual lookup, greeting, or off-topic message with no travel planning angle.

CRITICAL RULE: Any message ending with "?" that asks about cost, budget, weather, duration, or general travel info is travel_interest or simple_query — NEVER trip_plan. The user must explicitly say they want to plan/book/build before trip_plan fires.

Examples:
- "Plan a 7-day trip from Mumbai to Bali next June"                    → trip_plan
- "Find me business class flights to London in December"               → trip_plan
- "I want to book a trip to Sydney for 5 days"                        → trip_plan
- "build an itinerary"                                                 → trip_plan
- "How much will it cost for a 4 member, 5 day bleisure trip?"        → travel_interest
- "What is the approximate budget for a Dubai trip for 4 people?"     → travel_interest
- "What is the best time to visit Maldives?"                          → travel_interest
- "Is Bali good for a honeymoon?"                                     → travel_interest
- "What's the weather like in Tokyo in April?"                        → travel_interest
- "What activities can I do in Singapore for 3 days?"                 → travel_interest
- "Is Dubai expensive for a family of 5?"                             → travel_interest
- "How many days is enough for Bangkok?"                              → travel_interest
- "Do I need a visa for Japan?"                                        → simple_query
- "What currency does Singapore use?"                                  → simple_query
- "How long is the flight from Mumbai to London?"                      → simple_query
- "Hello" / "Thanks"                                                   → simple_query
- "Hello" / "Thanks" / "What can you do?"                  → simple_query

Respond ONLY with one of: trip_plan   travel_interest   simple_query`;

async function routerNode(state: GraphState): Promise<Partial<GraphState>> {
    const userMessage = state.messages.filter(m => m.role === 'user').at(-1)?.content ?? '';
    // Pass full context so "build itinerary" after a destination question routes correctly
    const context = buildConversationContext(state.messages);

    const { text, inputTokens, outputTokens } = await callLLM(
        ORCHESTRATOR_DEPLOYMENT, ROUTER_PROMPT, context, 10,
    );

    const raw = text.trim().toLowerCase();
    const intentType: GraphState['intentType'] =
        raw.includes('trip_plan')       ? 'trip_plan'       :
        raw.includes('travel_interest') ? 'travel_interest' : 'simple_query';

    state.writeSSE({ type: 'agent_start', agent: 'router', toolName: 'classify_intent', query: { intent: intentType } });

    return { intentType, usage: { input: inputTokens, output: outputTokens } };
}

// ─── Node: direct_answer ──────────────────────────────────────────────────────
// For simple_query: answers the question factually, no booking nudge.

const DIRECT_ANSWER_PROMPT = `You are a knowledgeable travel concierge for TLP Airways. Answer the user's travel question directly and helpfully in 2-4 sentences. Be specific and practical. Do not offer to plan a full trip.`;

async function directAnswerNode(state: GraphState): Promise<Partial<GraphState>> {
    const userMessage = state.messages.filter(m => m.role === 'user').at(-1)?.content ?? '';

    const { text, inputTokens, outputTokens } = await callLLM(
        SUBAGENT_DEPLOYMENT, DIRECT_ANSWER_PROMPT, userMessage, 300,
    );

    state.writeSSE({ type: 'text', agent: 'orchestrator', content: text });
    return { usage: { input: inputTokens, output: outputTokens } };
}

// ─── Node: nudge_booking ──────────────────────────────────────────────────────
// For travel_interest: answers the question, then ends with a natural invite
// to plan the trip — turning curiosity into a booking conversation.

const NUDGE_BOOKING_PROMPT = `You are an enthusiastic travel concierge for TLP Airways. The user has asked something that suggests they are considering a trip.

Do two things:
1. Answer their question helpfully and specifically in 2-3 sentences.
2. End with a single warm, natural sentence that invites them to plan the trip — mention the destination by name and offer to search flights, hotels, and build an itinerary. Make it feel like a genuine suggestion, not a sales pitch.

Keep the total response under 5 sentences.`;

async function nudgeBookingNode(state: GraphState): Promise<Partial<GraphState>> {
    const userMessage = state.messages.filter(m => m.role === 'user').at(-1)?.content ?? '';
    const context = buildConversationContext(state.messages);

    const { text, inputTokens, outputTokens } = await callLLM(
        SUBAGENT_DEPLOYMENT, NUDGE_BOOKING_PROMPT, context, 350,
    );

    state.writeSSE({ type: 'text', agent: 'orchestrator', content: text });
    state.writeSSE({
        type: 'action_buttons',
        buttons: [
            { label: 'Build Itinerary', action: 'build_itinerary', prompt: 'build an itinerary' },
            { label: 'Ask Me More',     action: 'ask_more',        prompt: '' },
        ],
        tripParams: state.tripParams,
    });
    return { usage: { input: inputTokens, output: outputTokens } };
}

// ─── Node: profile ────────────────────────────────────────────────────────────

const PROFILE_PROMPT = `You are a CRM analyst for TLP Airways. Generate a realistic loyalty member profile.
Respond ONLY with valid JSON, no markdown:
{
  "name": "string", "loyaltyId": "TLP-XXXXXX", "loyaltyTier": "Bronze|Silver|Gold|Platinum",
  "segment": "string", "travelPersona": "string (2 sentences)",
  "preferredCabinClass": "Economy|Premium Economy|Business",
  "preferredDestinations": ["string"],
  "dietaryPreference": "Veg|Non-Veg|Vegan|Jain", "seatPreference": "Window|Aisle|No Preference",
  "loyaltyPoints": number, "totalFlights": number, "memberSince": "YYYY",
  "recentTrips": ["string"], "specialInterests": ["string"], "travelStyle": "Budget|Mid-Range|Luxury"
}`;

async function profileNode(state: GraphState): Promise<Partial<GraphState>> {
    const p = state.tripParams!;

    state.writeSSE({ type: 'agent_start', agent: 'profile-agent', toolName: 'get_user_profile', query: { userName: p.userName } });

    const { text, inputTokens, outputTokens } = await callLLM(
        SUBAGENT_DEPLOYMENT, PROFILE_PROMPT,
        `Traveller: ${p.userName}. Trip context: ${p.tripContext}.`, 600,
    );

    let profile: any;
    try {
        profile = JSON.parse(stripFences(text));
    } catch {
        profile = { name: p.userName, loyaltyTier: 'Gold', segment: 'Leisure Traveler', travelPersona: 'An avid traveller.', preferredCabinClass: 'Economy', travelStyle: 'Mid-Range', specialInterests: [] };
    }

    state.writeSSE({ type: 'agent_result', agent: 'profile-agent', toolName: 'get_user_profile', data: profile });
    return { profile, usage: { input: inputTokens, output: outputTokens } };
}

// ─── Node: flights ────────────────────────────────────────────────────────────
// Fetch-then-enrich: deterministic data lookup first, LLM adds ranking only.

const FLIGHT_ENRICH_PROMPT = `You are a senior flight consultant. Given flights and trip context, return ONLY enrichment fields — no flight data.
Respond ONLY with this JSON, no markdown:
{
  "agent_commentary": "2 sentences on the options for this traveller",
  "rankings": [{ "id": "flight-id", "recommendation_reason": "one sentence", "top_pick": true }]
}
Set top_pick: true on exactly ONE flight.`;

async function flightsNode(state: GraphState): Promise<Partial<GraphState>> {
    const p = state.tripParams!;

    const input: SearchFlightsInput = {
        origin: p.origin, destination: p.destinationCode,
        departure_date: p.departureDate, return_date: p.returnDate ?? undefined,
        passengers: p.passengers, cabin_class: p.cabinClass,
    };

    state.writeSSE({ type: 'agent_start', agent: 'flight-agent', toolName: 'search_flights', query: input });

    const rawData = searchFlights(input);
    const allFlights = [...(rawData.outbound || []), ...(rawData.return_flights || [])];
    const summaries = allFlights.map(f => ({
        id: f.id, flight: f.flightNumber, dep: f.departureTime, arr: f.arrivalTime,
        dur: f.duration, price: f.price, stops: f.stops?.length ?? 0,
    }));

    const { text, inputTokens, outputTokens } = await callLLM(
        SUBAGENT_DEPLOYMENT, FLIGHT_ENRICH_PROMPT,
        `Purpose: ${p.travelPurpose}. Passengers: ${p.passengers}. Profile: ${state.profile?.travelPersona ?? ''}.\nFlights: ${JSON.stringify(summaries)}`,
        600,
    );

    let enrichment: any = {};
    try { enrichment = JSON.parse(stripFences(text)); } catch { /* use raw */ }

    const enrichMap = new Map((enrichment.rankings || []).map((r: any) => [r.id, r]));
    const enrich = (list: any[]) => list.map(f => ({
        ...f,
        recommendation_reason: (enrichMap.get(f.id) as any)?.recommendation_reason,
        top_pick: (enrichMap.get(f.id) as any)?.top_pick ?? false,
        agent_commentary: enrichment.agent_commentary,
    }));

    const flights = { ...rawData, outbound: enrich(rawData.outbound || []), return_flights: enrich(rawData.return_flights || []) };
    state.writeSSE({ type: 'agent_result', agent: 'flight-agent', toolName: 'search_flights', data: flights });
    return { flights, usage: { input: inputTokens, output: outputTokens } };
}

// ─── Node: hotels ─────────────────────────────────────────────────────────────

const HOTEL_ENRICH_PROMPT = `You are a luxury travel consultant. Given hotels and trip context, return ONLY enrichment fields.
Respond ONLY with this JSON, no markdown:
{
  "agent_commentary": "2 sentences on the hotel options",
  "rankings": [{ "id": "hotel-id", "match_reason": "one sentence", "top_pick": true }]
}
Set top_pick: true on exactly ONE hotel.`;

async function hotelsNode(state: GraphState): Promise<Partial<GraphState>> {
    const p = state.tripParams!;

    const input: SearchHotelsInput = {
        destination_code: p.destinationCode,
        check_in_date: p.departureDate,
        check_out_date: p.returnDate ?? undefined,
        guests: p.passengers,
    };

    state.writeSSE({ type: 'agent_start', agent: 'hotel-agent', toolName: 'search_hotels', query: input });

    const rawData = searchHotels(input as any);
    const hotelSummaries = (rawData.hotels || []).map((h: any) => ({
        id: h.id, name: h.name, category: h.category, rating: h.rating,
        price: h.pricePerNight, amenities: h.amenities?.slice(0, 4),
    }));

    const profileSummary = state.profile ? `${state.profile.loyaltyTier} tier ${state.profile.travelStyle} traveller. ${state.profile.travelPersona}` : '';

    const { text, inputTokens, outputTokens } = await callLLM(
        SUBAGENT_DEPLOYMENT, HOTEL_ENRICH_PROMPT,
        `Purpose: ${p.travelPurpose}. Traveller: ${profileSummary}.\nHotels: ${JSON.stringify(hotelSummaries)}`,
        600,
    );

    let enrichment: any = {};
    try { enrichment = JSON.parse(stripFences(text)); } catch { /* use raw */ }

    const enrichMap = new Map((enrichment.rankings || []).map((r: any) => [r.id, r]));
    const enrichedHotels = (rawData.hotels || []).map((h: any) => ({
        ...h,
        match_reason: (enrichMap.get(h.id) as any)?.match_reason,
        top_pick: (enrichMap.get(h.id) as any)?.top_pick ?? false,
        agent_commentary: enrichment.agent_commentary,
    }));

    const hotels = { ...rawData, hotels: enrichedHotels };
    state.writeSSE({ type: 'agent_result', agent: 'hotel-agent', toolName: 'search_hotels', data: hotels });
    return { hotels, usage: { input: inputTokens, output: outputTokens } };
}

// ─── Node: weather ────────────────────────────────────────────────────────────

const WEATHER_PROMPT = `You are an expert travel meteorologist. Generate a realistic weather forecast.
Respond ONLY with valid JSON, no markdown:
{
  "destination": "string", "travel_period": "string", "season": "string",
  "overview": "string (2 sentences)", "avg_high": number, "avg_low": number,
  "humidity_level": "Low|Moderate|High|Very High", "uv_index": "Low|Moderate|High|Very High|Extreme",
  "rainfall_chance": "< 10%|10–30%|30–60%|> 60%",
  "daily": [{ "label": "string", "date": "YYYY-MM-DD", "icon": "emoji", "condition": "string", "high": number, "low": number, "humidity": number, "note": "string" }],
  "packing_tips": ["string"], "best_time_of_day": "string"
}
Generate up to 7 daily entries.`;

async function weatherNode(state: GraphState): Promise<Partial<GraphState>> {
    const p = state.tripParams!;

    state.writeSSE({ type: 'agent_start', agent: 'weather-agent', toolName: 'get_weather', query: { destination: p.destinationCity, departure_date: p.departureDate } });

    const { text, inputTokens, outputTokens } = await callLLM(
        SUBAGENT_DEPLOYMENT, WEATHER_PROMPT,
        `Destination: ${p.destinationCity} (${p.destinationCode}). Travel dates: ${p.departureDate}${p.returnDate ? ` to ${p.returnDate}` : ''}. Duration: ${p.durationDays} days.`,
        1500,
    );

    let weather: WeatherForecast;
    try {
        weather = JSON.parse(stripFences(text));
    } catch {
        weather = {
            destination: p.destinationCity, travel_period: p.departureDate,
            season: 'Seasonal', overview: 'Weather forecast unavailable.',
            avg_high: 28, avg_low: 22, humidity_level: 'Moderate', uv_index: 'High',
            rainfall_chance: '10–30%', daily: [],
            packing_tips: ['Check local weather before departure'],
            best_time_of_day: 'Morning hours are typically cooler',
        };
    }

    state.writeSSE({ type: 'agent_result', agent: 'weather-agent', toolName: 'get_weather', data: weather });
    return { weather, usage: { input: inputTokens, output: outputTokens } };
}

// ─── Node: destination ────────────────────────────────────────────────────────

const DESTINATION_ENRICH_PROMPT = `You are a destination expert. Return ONLY personalised enrichment fields.
Respond ONLY with this JSON, no markdown:
{
  "personalized_intro": "2-3 sentences written directly to the traveller",
  "recommended_for": "short label e.g. Honeymooners & Romance Seekers"
}`;

async function destinationNode(state: GraphState): Promise<Partial<GraphState>> {
    const p = state.tripParams!;

    state.writeSSE({ type: 'agent_start', agent: 'destination-agent', toolName: 'get_destination_info', query: { destination_code: p.destinationCode } });

    const rawData = getDestinationInfo({ destination_code: p.destinationCode } as GetDestinationInput);
    const destName = rawData.destination?.name ?? p.destinationCity;
    const profileSummary = state.profile ? `${state.profile.loyaltyTier} tier ${state.profile.travelStyle} traveller` : 'leisure traveller';

    const { text, inputTokens, outputTokens } = await callLLM(
        SUBAGENT_DEPLOYMENT, DESTINATION_ENRICH_PROMPT,
        `Destination: ${destName}. Purpose: ${p.travelPurpose}. Traveller: ${profileSummary}.`,
        300,
    );

    let enrichment: any = {};
    try { enrichment = JSON.parse(stripFences(text)); } catch { /* use raw */ }

    const destination = rawData.destination
        ? { ...rawData, destination: { ...rawData.destination, ...enrichment } }
        : rawData;

    state.writeSSE({ type: 'agent_result', agent: 'destination-agent', toolName: 'get_destination_info', data: destination });
    return { destination, usage: { input: inputTokens, output: outputTokens } };
}

// ─── Node: itinerary ──────────────────────────────────────────────────────────
// Fan-in: this node runs AFTER flights, hotels, weather, and destination all
// complete. LangGraph guarantees all 4 state fields are populated before calling.

const ITINERARY_PROMPT = `You are an expert travel itinerary architect. Craft a day-by-day personalised itinerary.
Respond ONLY with valid JSON, no markdown:
{
  "destination": "string", "duration_days": number, "travel_purpose": "string",
  "personalized_for": "string",
  "itinerary": [{
    "day": number, "title": "string",
    "image_query": "string (2-4 word search query)",
    "activities": [{ "time": "HH:MM", "activity": "string (under 20 words)", "type": "dining|exploration|culture|adventure|relaxation|transport", "tip": "string (under 10 words)" }]
  }],
  "packing_tips": ["string"], "budget_estimate": "string"
}
Include EXACTLY 4 activities per day.`;

async function itineraryNode(state: GraphState): Promise<Partial<GraphState>> {
    const p = state.tripParams!;

    state.writeSSE({ type: 'agent_start', agent: 'itinerary-agent', toolName: 'create_itinerary', query: { destination: p.destinationCity, duration_days: p.durationDays } });

    const profile = state.profile ?? {};
    const weatherOverview = state.weather?.overview ?? '';
    const topHotel = (state.hotels?.hotels ?? []).find((h: any) => h.top_pick)?.name ?? '';
    const profileSummary = `${profile.loyaltyTier ?? 'Gold'} tier ${profile.travelStyle ?? 'Mid-Range'} traveller. ${profile.travelPersona ?? ''} Interests: ${(profile.specialInterests ?? []).join(', ')}.`;

    const { text, inputTokens, outputTokens } = await callLLM(
        SUBAGENT_DEPLOYMENT, ITINERARY_PROMPT,
        `${p.durationDays}-day ${p.travelPurpose} trip to ${p.destinationCity} (${p.destinationCode}).\nWeather: ${weatherOverview}\nStaying at: ${topHotel}\nProfile: ${profileSummary}`,
        4000,
    );

    let itinerary: any;
    try {
        itinerary = JSON.parse(stripFences(text));
    } catch {
        itinerary = { destination: p.destinationCity, duration_days: p.durationDays, travel_purpose: p.travelPurpose, itinerary: [], packing_tips: [], budget_estimate: 'Contact us for a quote' };
    }

    state.writeSSE({ type: 'agent_result', agent: 'itinerary-agent', toolName: 'create_itinerary', data: itinerary });
    return { itinerary, usage: { input: inputTokens, output: outputTokens } };
}

// ─── Node: summary ────────────────────────────────────────────────────────────

const SUMMARY_PROMPT = `You are a senior travel consultant delivering a final executive briefing.
Respond ONLY with valid JSON, no markdown:
{
  "executive_summary": "string (3-4 sentences, warm concierge tone)",
  "destination": "string", "traveler_name": "string", "duration_days": number, "travel_purpose": "string",
  "trip_highlights": [
    { "icon": "✈️", "label": "Best Flight", "value": "string", "detail": "string" },
    { "icon": "🏨", "label": "Top Hotel", "value": "string", "detail": "string" },
    { "icon": "🌤️", "label": "Weather", "value": "string", "detail": "string" },
    { "icon": "📅", "label": "Itinerary", "value": "string", "detail": "string" }
  ],
  "personalized_for": "string", "total_estimate": "string",
  "top_recommendations": ["string (4 specific actionable tips)"],
  "next_steps": ["string (3 ordered actions)"],
  "readiness_score": number
}`;

async function summaryNode(state: GraphState): Promise<Partial<GraphState>> {
    const p = state.tripParams!;

    state.writeSSE({ type: 'summarising', usage: state.usage });

    const topFlight = (state.flights?.outbound ?? []).find((f: any) => f.top_pick);
    const topHotel  = (state.hotels?.hotels ?? []).find((h: any) => h.top_pick);
    const bestFlight = topFlight ? `${topFlight.flightNumber} · ${topFlight.duration} · ₹${topFlight.price?.toLocaleString('en-IN')}` : 'See Flights tab';
    const bestHotel  = topHotel  ? `${topHotel.name} · ${topHotel.category} · ₹${topHotel.pricePerNight?.toLocaleString('en-IN')}/night` : 'See Hotels tab';
    const weatherSummary = state.weather ? `${state.weather.season}, ${state.weather.avg_low}–${state.weather.avg_high}°C` : 'See Weather tab';
    const itineraryHighlight = (state.itinerary?.itinerary?.[0] as any)?.title ?? `${p.durationDays}-day plan`;

    state.writeSSE({ type: 'agent_start', agent: 'summary-agent', toolName: 'summarize_trip', query: { destination: p.destinationCity } });

    const userMsg = [
        `Trip: ${p.durationDays}-day ${p.travelPurpose} trip to ${p.destinationCity} for ${p.userName}.`,
        `Best flight: ${bestFlight}.`,
        `Best hotel: ${bestHotel}.`,
        `Weather: ${weatherSummary}.`,
        `Itinerary highlight: ${itineraryHighlight}.`,
        `Budget: ${state.itinerary?.budget_estimate ?? 'TBD'}.`,
    ].join('\n');

    const { text, inputTokens, outputTokens } = await callLLM(
        SUBAGENT_DEPLOYMENT, SUMMARY_PROMPT, userMsg, 1500,
    );

    let summary: TripSummary;
    try {
        summary = JSON.parse(stripFences(text));
    } catch {
        summary = {
            executive_summary: `Your ${p.durationDays}-day ${p.travelPurpose} trip to ${p.destinationCity} is ready. All tabs are populated with personalised recommendations.`,
            destination: p.destinationCity, traveler_name: p.userName,
            duration_days: p.durationDays, travel_purpose: p.travelPurpose,
            trip_highlights: [
                { icon: '✈️', label: 'Best Flight', value: bestFlight, detail: 'Top-picked by Flight Agent' },
                { icon: '🏨', label: 'Top Hotel', value: bestHotel, detail: 'Matched to your profile' },
                { icon: '🌤️', label: 'Weather', value: weatherSummary, detail: 'Seasonal forecast ready' },
                { icon: '📅', label: 'Itinerary', value: `${p.durationDays}-day plan`, detail: itineraryHighlight },
            ],
            personalized_for: `${state.profile?.loyaltyTier ?? 'Gold'} tier ${state.profile?.travelStyle ?? 'Mid-Range'} traveller`,
            total_estimate: state.itinerary?.budget_estimate ?? 'Contact us',
            top_recommendations: ['Review the Itinerary tab', 'Compare flight options', 'Check hotel amenities', 'Review weather packing tips'],
            next_steps: ['Select and book your flight', 'Reserve your hotel', 'Download the itinerary'],
            readiness_score: 85,
        };
    }

    state.writeSSE({ type: 'agent_result', agent: 'summary-agent', toolName: 'summarize_trip', data: summary });

    // Emit final orchestrator text (mirrors runOrchestrator's text event)
    const closing = `Your personalised ${p.durationDays}-day ${p.travelPurpose} trip to ${p.destinationCity} is ready, ${p.userName}. Explore the tabs to review your flights, hotel, itinerary, and destination guide.`;
    state.writeSSE({ type: 'text', agent: 'orchestrator', content: closing });

    return { summary, usage: { input: inputTokens, output: outputTokens } };
}

// ─── Graph assembly ───────────────────────────────────────────────────────────
//
// The topology is explicit: every edge is visible here.
// Fan-out: get_profile → [fetch_flights, fetch_hotels, fetch_weather, fetch_dest] run concurrently.
// Fan-in:  all 4 edges into build_itinerary — LangGraph waits for ALL to finish
//          before executing itinerary, automatically merging their state contributions.

// Node names must not collide with state field names (LangGraph channel constraint).
// Convention: prefix with verb — get_, fetch_, build_, create_.
const travelGraph = new StateGraph(TravelState)
    // Nodes
    .addNode('parse_intent',    parseIntentNode)
    .addNode('router',          routerNode)
    .addNode('direct_answer',   directAnswerNode)
    .addNode('nudge_booking',   nudgeBookingNode)
    .addNode('get_profile',     profileNode)
    .addNode('fetch_flights',   flightsNode)
    .addNode('fetch_hotels',    hotelsNode)
    .addNode('fetch_weather',   weatherNode)
    .addNode('fetch_dest',      destinationNode)
    .addNode('build_itinerary', itineraryNode)
    .addNode('create_summary',  summaryNode)

    // Sequential entry: START → parse_intent → router
    .addEdge(START, 'parse_intent')
    .addEdge('parse_intent', 'router')

    // Conditional branch: router reads intentType from state
    .addConditionalEdges('router', (state: GraphState) => state.intentType, {
        simple_query:    'direct_answer',
        travel_interest: 'nudge_booking',
        trip_plan:       'get_profile',
    })

    // short-circuit exits
    .addEdge('direct_answer', END)
    .addEdge('nudge_booking', END)

    // Fan-out: get_profile → 4 parallel data-gathering nodes
    .addEdge('get_profile', 'fetch_flights')
    .addEdge('get_profile', 'fetch_hotels')
    .addEdge('get_profile', 'fetch_weather')
    .addEdge('get_profile', 'fetch_dest')

    // Fan-in: all 4 → build_itinerary (LangGraph waits for all 4 to complete)
    .addEdge('fetch_flights',   'build_itinerary')
    .addEdge('fetch_hotels',    'build_itinerary')
    .addEdge('fetch_weather',   'build_itinerary')
    .addEdge('fetch_dest',      'build_itinerary')

    // Sequential exit: build_itinerary → create_summary → END
    .addEdge('build_itinerary', 'create_summary')
    .addEdge('create_summary', END)
    .compile();

// ─── Public entry point ───────────────────────────────────────────────────────

export async function runGraphOrchestrator(
    messages: ConversationMessage[],
    writeSSE: SSEWriter,
): Promise<{ input: number; output: number }> {
    const result = await travelGraph.invoke({ messages, writeSSE });
    return result.usage;
}
