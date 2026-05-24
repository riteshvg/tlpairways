/**
 * Travel Agent Orchestrator — Azure OpenAI
 *
 * All 6 sub-agents are real LLM calls:
 *   Profile    — generates a dynamic traveller profile
 *   Flight     — fetches routes then LLM ranks + adds recommendation reasoning
 *   Hotel      — fetches hotels then LLM matches to profile + adds reasoning
 *   Destination — fetches data then LLM personalises for the traveller
 *   Weather    — pure LLM meteorologist forecast
 *   Itinerary  — pure LLM day-by-day plan, uses profile context
 *
 * SSE events:
 *   { type: "text",         agent: "orchestrator", content: "..." }
 *   { type: "agent_start",  agent: "flight-agent",  toolName: "...", query: {...} }
 *   { type: "agent_result", agent: "flight-agent",  toolName: "...", data: {...} }
 *   { type: "summarising" }
 *   { type: "done", usage: { input, output } }
 */

import { AzureOpenAI } from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import {
    searchFlights,
    searchHotels,
    getDestinationInfo,
    SearchFlightsInput,
    SearchHotelsInput,
    GetDestinationInput,
    GetWeatherInput,
    WeatherForecast,
    CreateItineraryInput,
    TripSummary,
} from './tools';

// ─── Client ─────────────────────────────────────────────────────────────────

function createClient(): AzureOpenAI {
    return new AzureOpenAI({
        endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
        apiKey: process.env.AZURE_OPENAI_API_KEY!,
        apiVersion: '2025-01-01-preview',
    });
}

const ORCHESTRATOR_DEPLOYMENT = process.env.AZURE_ORCHESTRATOR_DEPLOYMENT || 'gpt-4.1';
const SUBAGENT_DEPLOYMENT = process.env.AZURE_SUBAGENT_DEPLOYMENT || 'gpt-5.4-mini';

// ─── Agent meta ─────────────────────────────────────────────────────────────

const AGENT_META: Record<string, { displayName: string; agentId: string }> = {
    get_user_profile:     { displayName: 'Profile Agent',     agentId: 'profile-agent' },
    search_flights:       { displayName: 'Flight Agent',      agentId: 'flight-agent' },
    search_hotels:        { displayName: 'Hotel Agent',       agentId: 'hotel-agent' },
    get_destination_info: { displayName: 'Destination Agent', agentId: 'destination-agent' },
    get_weather:          { displayName: 'Weather Agent',     agentId: 'weather-agent' },
    create_itinerary:     { displayName: 'Itinerary Agent',   agentId: 'itinerary-agent' },
    summarize_trip:       { displayName: 'Summary Agent',     agentId: 'summary-agent' },
};

const ALL_TOOLS = new Set(Object.keys(AGENT_META));

// ─── Tool definitions (OpenAI function-calling format) ──────────────────────

const OPENAI_TOOLS: ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'get_user_profile',
            description: 'Generate a realistic TLP Airways loyalty member profile for the traveller based on their name and trip context',
            parameters: {
                type: 'object',
                properties: {
                    userName: { type: 'string', description: 'The traveller\'s name' },
                    tripContext: { type: 'string', description: 'Brief context — destination, trip purpose, group composition' },
                },
                required: ['userName', 'tripContext'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'search_flights',
            description: 'Search for available flights and get intelligent recommendations ranked by best fit',
            parameters: {
                type: 'object',
                properties: {
                    origin: { type: 'string', description: 'Origin IATA code (BOM, DEL, BLR, MAA, HYD, CCU)' },
                    destination: { type: 'string', description: 'Destination IATA code (DPS, SIN, DXB, LHR, SYD, BKK, NRT, CDG, JFK, MLE, KUL, HKG)' },
                    date: { type: 'string', description: 'Departure date YYYY-MM-DD' },
                    returnDate: { type: 'string', description: 'Return date YYYY-MM-DD for round trips' },
                    passengers: { type: 'number', description: 'Number of passengers' },
                    cabinClass: { type: 'string', description: 'Cabin class (Economy, Premium Economy, Business)' },
                    travelPurpose: { type: 'string', description: 'Trip purpose for recommendation logic' },
                },
                required: ['origin', 'destination', 'date'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'search_hotels',
            description: 'Find hotels at the destination and match them to the traveller profile and trip purpose',
            parameters: {
                type: 'object',
                properties: {
                    destination_code: { type: 'string', description: 'Destination IATA city code (e.g. DPS, SYD, SIN)' },
                    checkIn: { type: 'string', description: 'Check-in date YYYY-MM-DD' },
                    checkOut: { type: 'string', description: 'Check-out date YYYY-MM-DD' },
                    guests: { type: 'number', description: 'Number of guests' },
                    travelPurpose: { type: 'string', description: 'Trip purpose for hotel matching' },
                    travelerProfile: { type: 'string', description: 'Brief traveller profile summary for personalisation' },
                },
                required: ['destination_code'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_destination_info',
            description: 'Get a personalised destination guide — highlights, tips, visa info, cuisine — curated for this specific traveller',
            parameters: {
                type: 'object',
                properties: {
                    destination_code: { type: 'string', description: 'Destination IATA code (e.g. DPS, SYD, SIN)' },
                    travelPurpose: { type: 'string', description: 'Trip purpose for personalised curation' },
                    travelerProfile: { type: 'string', description: 'Brief traveller profile for personalisation' },
                },
                required: ['destination_code'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_weather',
            description: 'Generate a detailed weather forecast for the destination during the travel period',
            parameters: {
                type: 'object',
                properties: {
                    destination: { type: 'string', description: 'Destination city name' },
                    destination_code: { type: 'string', description: 'Destination IATA code' },
                    departure_date: { type: 'string', description: 'Departure date YYYY-MM-DD' },
                    return_date: { type: 'string', description: 'Return date YYYY-MM-DD' },
                    duration_days: { type: 'number', description: 'Trip duration in days' },
                },
                required: ['destination', 'destination_code'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_itinerary',
            description: 'Build a detailed day-by-day personalised travel itinerary using all context gathered so far',
            parameters: {
                type: 'object',
                properties: {
                    destination: { type: 'string', description: 'Destination city name' },
                    destination_code: { type: 'string', description: 'Destination IATA code' },
                    duration_days: { type: 'number', description: 'Number of days' },
                    travel_purpose: { type: 'string', description: 'Purpose: honeymoon, family, business, adventure, leisure, solo' },
                    interests: { type: 'array', items: { type: 'string' }, description: 'Traveller interests and preferences' },
                    traveler_profile: { type: 'string', description: 'Full traveller profile summary for deep personalisation' },
                },
                required: ['destination', 'destination_code', 'duration_days', 'travel_purpose'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'summarize_trip',
            description: 'Generate a comprehensive trip summary after all other agents have run — synthesises findings into an executive briefing with highlights, recommendations, and next steps',
            parameters: {
                type: 'object',
                properties: {
                    destination: { type: 'string', description: 'Destination city name' },
                    traveler_name: { type: 'string', description: 'Traveller name from profile agent' },
                    duration_days: { type: 'number', description: 'Trip duration in days' },
                    travel_purpose: { type: 'string', description: 'Trip purpose (leisure, business, honeymoon, etc.)' },
                    best_flight: { type: 'string', description: 'Best flight option summary — flight number, price, duration, why it is the top pick' },
                    best_hotel: { type: 'string', description: 'Best hotel option summary — name, category, price per night, why it suits the traveller' },
                    weather_summary: { type: 'string', description: 'Weather overview — season, average temperature, key conditions to expect' },
                    itinerary_highlight: { type: 'string', description: 'Most exciting day or activity from the itinerary' },
                    budget_estimate: { type: 'string', description: 'Overall budget estimate per person per day' },
                },
                required: ['destination', 'traveler_name', 'duration_days', 'travel_purpose'],
            },
        },
    },
];

// ─── Orchestrator system prompt ──────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a sophisticated multi-agent travel assistant for TLP Airways. Coordinate seven specialist sub-agents to deliver comprehensive, personalised travel plans.

**STRICT TOOL CALL ORDER — call ALL 7 tools, ONE per response, in this exact sequence:**
1. get_user_profile — FIRST, always. Infer userName from the user's message or use "Guest". Pass the trip context.
2. search_flights — SECOND. Use profile context for cabin class preference.
3. search_hotels — THIRD. Pass travelerProfile summary from step 1.
4. get_destination_info — FOURTH. Pass travelPurpose and travelerProfile.
5. get_weather — FIFTH. Pass departure/return dates from the user's message.
6. create_itinerary — SIXTH. Pass the full traveler_profile from step 1 to personalise the plan.
7. summarize_trip — SEVENTH AND LAST. Synthesise key findings: pass best_flight (top-pick flight number, price, duration), best_hotel (top-pick name, category, price/night), weather_summary (season, temp range), itinerary_highlight (most exciting day or activity), and budget_estimate.

**CRITICAL RULES:**
- ONE tool call per response — never batch or parallelize
- Call ALL 7 tools before writing any final text
- After each tool result, respond ONLY with the next tool call — no commentary between tools
- Write your final summary ONLY after summarize_trip has returned

**IATA codes:**
- Origins: Mumbai=BOM, Delhi=DEL, Bangalore=BLR, Chennai=MAA, Hyderabad=HYD, Kolkata=CCU
- Destinations: Bali=DPS, Singapore=SIN, Dubai=DXB, London=LHR, Sydney=SYD, Bangkok=BKK, Tokyo=NRT, Paris=CDG, New York=JFK, Maldives=MLE, Kuala Lumpur=KUL, Hong Kong=HKG

**Final summary (after all 7 tools):** 2 sentences max. Warm, concierge tone. The full summary is already in the Summary tab — just close with a personalised sentence inviting them to explore the tabs.`;

// ─── Public types ────────────────────────────────────────────────────────────

export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
}

type SSEWriter = (event: Record<string, any>) => void;

// ─── Main orchestrator ───────────────────────────────────────────────────────

export async function runOrchestrator(
    messages: ConversationMessage[],
    writeSSE: SSEWriter
): Promise<{ input: number; output: number }> {
    const client = createClient();
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    const chatMessages: ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content }) as ChatCompletionMessageParam),
    ];

    let totalInput = 0;
    let totalOutput = 0;
    const calledTools = new Set<string>();

    while (true) {
        const response = await client.chat.completions.create({
            model: ORCHESTRATOR_DEPLOYMENT,
            messages: chatMessages,
            tools: OPENAI_TOOLS,
            tool_choice: 'auto',
            parallel_tool_calls: false,
            max_tokens: 2048,
        });

        totalInput += response.usage?.prompt_tokens ?? 0;
        totalOutput += response.usage?.completion_tokens ?? 0;

        const message = response.choices[0].message;
        chatMessages.push(message as ChatCompletionMessageParam);

        if (message.content) {
            writeSSE({ type: 'text', agent: 'orchestrator', content: message.content });
        }

        if (!message.tool_calls?.length) break;

        for (const toolCall of message.tool_calls) {
            const tc = toolCall as any;
            const toolName: string = tc.function.name;
            const toolInput = JSON.parse(tc.function.arguments);
            const agentId = AGENT_META[toolName]?.agentId ?? toolName;

            writeSSE({ type: 'agent_start', agent: agentId, toolName, query: toolInput });
            await sleep(600);

            let result: any;
            let isError = false;

            try {
                switch (toolName) {
                    case 'get_user_profile': {
                        const r = await runProfileSubAgent(toolInput, client);
                        totalInput += r.inputTokens; totalOutput += r.outputTokens;
                        result = r.profile;
                        break;
                    }
                    case 'search_flights': {
                        const r = await runFlightSubAgent(toolInput as SearchFlightsInput & { travelPurpose?: string }, client);
                        totalInput += r.inputTokens; totalOutput += r.outputTokens;
                        result = r.data;
                        break;
                    }
                    case 'search_hotels': {
                        const r = await runHotelSubAgent(toolInput as SearchHotelsInput & { travelPurpose?: string; travelerProfile?: string }, client);
                        totalInput += r.inputTokens; totalOutput += r.outputTokens;
                        result = r.data;
                        break;
                    }
                    case 'get_destination_info': {
                        const r = await runDestinationSubAgent(toolInput as GetDestinationInput & { travelerProfile?: string }, client);
                        totalInput += r.inputTokens; totalOutput += r.outputTokens;
                        result = r.data;
                        break;
                    }
                    case 'get_weather': {
                        const r = await runWeatherSubAgent(toolInput as GetWeatherInput, client);
                        totalInput += r.inputTokens; totalOutput += r.outputTokens;
                        result = r.forecast;
                        break;
                    }
                    case 'create_itinerary': {
                        const r = await runItinerarySubAgent(toolInput as CreateItineraryInput, client);
                        totalInput += r.inputTokens; totalOutput += r.outputTokens;
                        result = r.itinerary;
                        break;
                    }
                    case 'summarize_trip': {
                        const r = await runSummarySubAgent(toolInput, client);
                        totalInput += r.inputTokens; totalOutput += r.outputTokens;
                        result = r.summary;
                        break;
                    }
                    default:
                        throw new Error(`Unknown tool: ${toolName}`);
                }
            } catch (err: any) {
                console.error(`[travel-agent] tool=${toolName} error:`, err.message);
                result = { error: err.message };
                isError = true;
            }

            calledTools.add(toolName);
            writeSSE({ type: 'agent_result', agent: agentId, toolName, data: result, isError });
            await sleep(300);

            chatMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(compressResult(toolName, result)),
            } as ChatCompletionMessageParam);

            // Emit summarising signal once all 6 tools have been called
            if ([...ALL_TOOLS].every(t => calledTools.has(t))) {
                writeSSE({ type: 'summarising', usage: { input: totalInput, output: totalOutput } });
            }
        }
    }

    return { input: totalInput, output: totalOutput };
}

// ─── Sub-agent helpers ───────────────────────────────────────────────────────

function stripFences(raw: string): string {
    return raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

async function callSubAgent(
    client: AzureOpenAI,
    systemPrompt: string,
    userMessage: string,
    maxTokens = 2000,
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
    const response = await client.chat.completions.create({
        model: SUBAGENT_DEPLOYMENT,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
        ],
        max_completion_tokens: maxTokens,
    } as any);
    return {
        text: response.choices[0].message.content ?? '{}',
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
    };
}

// ─── 1. Profile Sub-Agent ────────────────────────────────────────────────────

const PROFILE_SYSTEM_PROMPT = `PERSONA: You are a CRM analyst for TLP Airways with access to the loyalty programme database. You build rich, realistic customer profiles.

TASK: Generate a believable TLP Airways loyalty member profile for the given traveller based on their name and trip context. Make it feel like a real returning customer — with history, preferences, and a personality.

CONTEXT: TLP Airways is a premium Indian carrier. Loyalty tiers: Bronze (0–5 flights/year), Silver (6–15), Gold (16–30), Platinum (31+). Infer tier from the type of travel implied by the trip context.

FORMAT: Respond ONLY with valid JSON — no markdown, no code fences:
{
  "name": "string",
  "loyaltyId": "TLP-XXXXXX",
  "loyaltyTier": "Bronze|Silver|Gold|Platinum",
  "segment": "string (e.g. Leisure Traveler, Frequent Business Flyer, Family Explorer)",
  "travelPersona": "string (2 sentences capturing this person's travel style and what they value most)",
  "preferredCabinClass": "Economy|Premium Economy|Business",
  "preferredDestinations": ["string (3 past favourite destinations)"],
  "dietaryPreference": "Veg|Non-Veg|Vegan|Jain",
  "seatPreference": "Window|Aisle|No Preference",
  "loyaltyPoints": number,
  "totalFlights": number,
  "memberSince": "YYYY",
  "recentTrips": ["string (e.g. Singapore, 2024)"],
  "specialInterests": ["string (3-5 interests relevant to travel)"],
  "travelStyle": "Budget|Mid-Range|Luxury"
}`;

async function runProfileSubAgent(
    input: { userName: string; tripContext?: string },
    client: AzureOpenAI,
): Promise<{ profile: any; inputTokens: number; outputTokens: number }> {
    const userMsg = `Traveller: ${input.userName}. Trip context: ${input.tripContext || 'international leisure travel'}.`;
    const { text, inputTokens, outputTokens } = await callSubAgent(client, PROFILE_SYSTEM_PROMPT, userMsg);
    let profile: any;
    try {
        profile = JSON.parse(stripFences(text));
    } catch {
        profile = { name: input.userName, loyaltyTier: 'Gold', segment: 'Leisure Traveler', travelPersona: 'An avid traveller who values comfort and authentic local experiences.', preferredCabinClass: 'Economy', travelStyle: 'Mid-Range' };
    }
    return { profile, inputTokens, outputTokens };
}

// ─── 2. Flight Sub-Agent ─────────────────────────────────────────────────────
// Strategy: fetch data deterministically, then LLM returns ONLY enrichment fields.
// Server merges enrichment into the original structure — guarantees correct data shape.

const FLIGHT_ENRICH_PROMPT = `You are a senior flight consultant. Given a list of flights and trip context, return a JSON object with ONLY enrichment fields — do not repeat flight data.

FORMAT — respond ONLY with this exact JSON structure, no markdown:
{
  "agent_commentary": "2 sentences summarising the flight options for this traveller",
  "rankings": [
    { "id": "flight-id", "recommendation_reason": "one sentence why this flight suits or doesn't suit the traveller", "top_pick": true }
  ]
}
Set top_pick: true on exactly ONE flight. Set top_pick: false on all others.`;

async function runFlightSubAgent(
    input: SearchFlightsInput & { travelPurpose?: string; travelerProfile?: string },
    client: AzureOpenAI,
): Promise<{ data: any; inputTokens: number; outputTokens: number }> {
    // Normalise: orchestrator sends camelCase keys (date, returnDate, cabinClass) but
    // searchFlights expects snake_case (departure_date, return_date, cabin_class)
    const normalised: SearchFlightsInput = {
        ...input,
        departure_date: input.departure_date || (input as any).date,
        return_date: input.return_date || (input as any).returnDate,
        cabin_class: input.cabin_class || (input as any).cabinClass,
    };
    const rawData = searchFlights(normalised);

    const allFlights = [...(rawData.outbound || []), ...(rawData.return_flights || [])];
    const flightSummaries = allFlights.map(f => ({
        id: f.id, flight: f.flightNumber, dep: f.departureTime, arr: f.arrivalTime,
        dur: f.duration, price: f.price, stops: f.stops?.length ?? 0, aircraft: f.aircraftType,
    }));

    const userMsg = `Travel purpose: ${input.travelPurpose || 'leisure'}. Passengers: ${input.passengers || 1}.
Flights: ${JSON.stringify(flightSummaries)}`;

    const { text, inputTokens, outputTokens } = await callSubAgent(client, FLIGHT_ENRICH_PROMPT, userMsg, 800);

    let enrichment: { agent_commentary?: string; rankings?: Array<{ id: string; recommendation_reason: string; top_pick: boolean }> } = {};
    try { enrichment = JSON.parse(stripFences(text)); } catch { /* use raw data as-is */ }

    // Merge enrichment into original data structure
    const enrichMap = new Map((enrichment.rankings || []).map(r => [r.id, r]));
    const enrich = (flights: any[]) => flights.map(f => ({
        ...f,
        recommendation_reason: enrichMap.get(f.id)?.recommendation_reason,
        top_pick: enrichMap.get(f.id)?.top_pick ?? false,
        agent_commentary: enrichment.agent_commentary,
    }));

    return {
        data: { ...rawData, outbound: enrich(rawData.outbound || []), return_flights: enrich(rawData.return_flights || []) },
        inputTokens, outputTokens,
    };
}

// ─── 3. Hotel Sub-Agent ──────────────────────────────────────────────────────

const HOTEL_ENRICH_PROMPT = `You are a luxury travel consultant. Given a list of hotels and trip context, return ONLY enrichment fields — do not repeat hotel data.

FORMAT — respond ONLY with this exact JSON structure, no markdown:
{
  "agent_commentary": "2 sentences on the hotel options and which best fits this traveller",
  "rankings": [
    { "id": "hotel-id", "match_reason": "one sentence why this hotel matches the traveller's profile and trip purpose", "top_pick": true }
  ]
}
Set top_pick: true on exactly ONE hotel. Set top_pick: false on all others.`;

async function runHotelSubAgent(
    input: SearchHotelsInput & { travelPurpose?: string; travelerProfile?: string },
    client: AzureOpenAI,
): Promise<{ data: any; inputTokens: number; outputTokens: number }> {
    // Normalise: LLM may send `destination` (from tool def) but searchHotels expects `destination_code`
    const normalised = { ...input, destination_code: (input as any).destination_code || (input as any).destination } as any;
    const rawData = searchHotels(normalised);

    const hotelSummaries = (rawData.hotels || []).map((h: any) => ({
        id: h.id, name: h.name, category: h.category, rating: h.rating,
        price: h.pricePerNight, neighbourhood: h.neighbourhood, amenities: h.amenities?.slice(0, 5),
    }));

    const userMsg = `Travel purpose: ${input.travelPurpose || 'leisure'}. Traveller: ${input.travelerProfile || 'leisure traveller'}.
Hotels: ${JSON.stringify(hotelSummaries)}`;

    const { text, inputTokens, outputTokens } = await callSubAgent(client, HOTEL_ENRICH_PROMPT, userMsg, 800);

    let enrichment: { agent_commentary?: string; rankings?: Array<{ id: string; match_reason: string; top_pick: boolean }> } = {};
    try { enrichment = JSON.parse(stripFences(text)); } catch { /* use raw data as-is */ }

    const enrichMap = new Map((enrichment.rankings || []).map(r => [r.id, r]));
    const enrichedHotels = (rawData.hotels || []).map((h: any) => ({
        ...h,
        match_reason: enrichMap.get(h.id)?.match_reason,
        top_pick: enrichMap.get(h.id)?.top_pick ?? false,
        agent_commentary: enrichment.agent_commentary,
    }));

    return {
        data: { ...rawData, hotels: enrichedHotels },
        inputTokens, outputTokens,
    };
}

// ─── 4. Destination Sub-Agent ────────────────────────────────────────────────

const DESTINATION_ENRICH_PROMPT = `You are a destination expert. Given a destination and trip context, return ONLY a personalised intro — do not repeat destination data.

FORMAT — respond ONLY with this exact JSON structure, no markdown:
{
  "personalized_intro": "2-3 sentences written directly to the traveller explaining why this destination is perfect for their specific trip and travel style",
  "recommended_for": "short label e.g. Honeymooners & Romance Seekers, or Adventure Families, or Solo Explorers"
}`;

async function runDestinationSubAgent(
    input: GetDestinationInput & { travelPurpose?: string; travelerProfile?: string },
    client: AzureOpenAI,
): Promise<{ data: any; inputTokens: number; outputTokens: number }> {
    // Normalise: LLM may send `destinationCode` (camelCase) but getDestinationInfo expects `destination_code`
    const normalised = { ...input, destination_code: (input as any).destination_code || (input as any).destinationCode } as GetDestinationInput;
    const rawData = getDestinationInfo(normalised);

    const destName = rawData.destination?.name ?? input.destination_code;
    const userMsg = `Destination: ${destName}. Travel purpose: ${input.travelPurpose || 'leisure'}. Traveller: ${input.travelerProfile || 'leisure traveller'}.`;

    const { text, inputTokens, outputTokens } = await callSubAgent(client, DESTINATION_ENRICH_PROMPT, userMsg, 400);

    let enrichment: { personalized_intro?: string; recommended_for?: string } = {};
    try { enrichment = JSON.parse(stripFences(text)); } catch { /* use raw data as-is */ }

    // Merge enrichment fields into the destination object
    const data = rawData.destination
        ? { ...rawData, destination: { ...rawData.destination, ...enrichment } }
        : rawData;

    return { data, inputTokens, outputTokens };
}

// ─── 5. Weather Sub-Agent ────────────────────────────────────────────────────

const WEATHER_SYSTEM_PROMPT = `PERSONA: You are an expert travel meteorologist with encyclopedic knowledge of seasonal weather patterns, climate zones, monsoon seasons, and micro-climates at popular travel destinations worldwide.

TASK: Generate a realistic weather forecast for a traveler visiting the destination during their specified travel period. Use your knowledge of typical monthly conditions and seasonal patterns.

CONTEXT: Reference monsoon windows, dry/wet seasons, trade winds, and local weather phenomena (e.g. Bali's rainy season Nov–Mar, Sydney's mild winters, Dubai's extreme summer heat, Tokyo's cherry blossom season Mar–Apr, Paris spring showers).

FORMAT: Respond ONLY with valid JSON — no markdown, no code fences:
{
  "destination": "string",
  "travel_period": "string (human-readable, e.g. June 15–22, 2025)",
  "season": "string (e.g. Dry Season, Summer, Monsoon, Spring)",
  "overview": "string (2 sentences on what the traveller should expect)",
  "avg_high": number,
  "avg_low": number,
  "humidity_level": "Low|Moderate|High|Very High",
  "uv_index": "Low|Moderate|High|Very High|Extreme",
  "rainfall_chance": "< 10%|10–30%|30–60%|> 60%",
  "daily": [
    {
      "label": "string (Mon Jun 15 if dates known, else Day 1)",
      "date": "YYYY-MM-DD",
      "icon": "single weather emoji",
      "condition": "string",
      "high": number,
      "low": number,
      "humidity": number,
      "note": "string (optional short tip)"
    }
  ],
  "packing_tips": ["string"],
  "best_time_of_day": "string"
}
Generate daily entries for each day of the trip (up to 7 days).`;

async function runWeatherSubAgent(
    input: GetWeatherInput,
    client: AzureOpenAI,
): Promise<{ forecast: WeatherForecast; inputTokens: number; outputTokens: number }> {
    const parts = [`Weather forecast for ${input.destination} (${input.destination_code}).`];
    if (input.departure_date) parts.push(`Travel dates: ${input.departure_date}${input.return_date ? ` to ${input.return_date}` : ''}.`);
    if (input.duration_days) parts.push(`Duration: ${input.duration_days} days.`);

    const { text, inputTokens, outputTokens } = await callSubAgent(client, WEATHER_SYSTEM_PROMPT, parts.join(' '), 2000);
    let forecast: WeatherForecast;
    try {
        forecast = JSON.parse(stripFences(text));
    } catch {
        forecast = {
            destination: input.destination, travel_period: input.departure_date || 'Travel period',
            season: 'Seasonal', overview: 'Weather information unavailable.',
            avg_high: 28, avg_low: 22, humidity_level: 'Moderate', uv_index: 'High',
            rainfall_chance: '10–30%', daily: [],
            packing_tips: ['Check local weather before departure'],
            best_time_of_day: 'Morning hours are typically cooler',
        };
    }
    return { forecast, inputTokens, outputTokens };
}

// ─── 6. Itinerary Sub-Agent ──────────────────────────────────────────────────

const ITINERARY_SYSTEM_PROMPT = `PERSONA: You are an expert travel itinerary architect with deep first-hand knowledge of global destinations. You craft day-by-day experiences that feel authentic, practical, and deeply personalised — not generic tourist checklists.

TASK: Create a detailed personalised day-by-day itinerary. Use the traveller profile to shape every decision — a honeymooner gets romantic dinners and private experiences; a family gets kid-friendly timing and child-appropriate activities; a business traveller gets efficient mornings and rewarding evenings. Reference real places, restaurants, and neighbourhoods by name.

CONTEXT: You have the traveller's loyalty tier, travel style, special interests, dietary preferences, and travel persona. Use all of it. Every day should feel distinct — balance iconic experiences with local hidden gems.

FORMAT: Respond ONLY with valid JSON — no markdown, no code fences:
{
  "destination": "string",
  "duration_days": number,
  "travel_purpose": "string",
  "personalized_for": "string (e.g. Gold tier honeymooner who loves food and adventure)",
  "itinerary": [
    {
      "day": number,
      "title": "string (evocative day title)",
      "image_query": "string (2-4 word image search query capturing the day's vibe, e.g. 'Bali temple sunrise', 'Singapore skyline night', 'Ubud rice terraces')",
      "activities": [
        {
          "time": "HH:MM",
          "activity": "string (specific, vivid description referencing real places)",
          "type": "dining|exploration|culture|adventure|business|shopping|relaxation|transport|accommodation",
          "tip": "string (practical insider tip)"
        }
      ]
    }
  ],
  "packing_tips": ["string (max 5 items)"],
  "budget_estimate": "string (e.g. ₹8,000–12,000 per person per day, mid-range)"
}
IMPORTANT: Include EXACTLY 4 activities per day. Keep each activity description under 20 words. Keep each tip under 10 words.`;

async function runItinerarySubAgent(
    input: CreateItineraryInput & { traveler_profile?: string },
    client: AzureOpenAI,
): Promise<{ itinerary: any; inputTokens: number; outputTokens: number }> {
    // Normalise: orchestrator sometimes sends number_of_days instead of duration_days
    const durationDays = input.duration_days || (input as any).number_of_days || 7;
    const userMsg = `Plan a ${durationDays}-day ${input.travel_purpose} trip to ${input.destination} (${input.destination_code}).${
        input.interests?.length ? ` Interests: ${input.interests.join(', ')}.` : ''
    }${input.traveler_profile ? ` Traveller profile: ${input.traveler_profile}` : ''}`;

    const { text, inputTokens, outputTokens } = await callSubAgent(client, ITINERARY_SYSTEM_PROMPT, userMsg, 5000);
    let itinerary: any;
    try {
        itinerary = JSON.parse(stripFences(text));
    } catch {
        itinerary = { destination: input.destination, duration_days: durationDays, travel_purpose: input.travel_purpose, itinerary: [], packing_tips: [], budget_estimate: 'Contact us for a quote' };
    }
    return { itinerary, inputTokens, outputTokens };
}

// ─── 7. Summary Sub-Agent ────────────────────────────────────────────────────

const SUMMARY_SYSTEM_PROMPT = `PERSONA: You are a senior travel consultant delivering a final executive briefing after your team of seven specialist agents has completed all research.

TASK: Create a compelling, personalised trip summary that synthesises all findings into a clear, actionable executive overview.

FORMAT: Respond ONLY with valid JSON — no markdown, no code fences:
{
  "executive_summary": "string (3-4 sentences: warm, concierge-quality summary of the complete trip plan — what makes it special for this specific traveller)",
  "destination": "string",
  "traveler_name": "string",
  "duration_days": number,
  "travel_purpose": "string",
  "trip_highlights": [
    { "icon": "✈️", "label": "Best Flight", "value": "string (flight number · duration · price)", "detail": "string (why it's the top pick)" },
    { "icon": "🏨", "label": "Top Hotel", "value": "string (hotel name · category)", "detail": "string (price/night · key amenity)" },
    { "icon": "🌤️", "label": "Weather", "value": "string (season · temperature range)", "detail": "string (one practical note)" },
    { "icon": "📅", "label": "Itinerary", "value": "string (N-day plan type)", "detail": "string (highlight activity)" }
  ],
  "personalized_for": "string (loyalty tier + travel style, e.g. 'Gold tier honeymoon couple who loves fine dining')",
  "total_estimate": "string (budget range per person per day)",
  "top_recommendations": ["string (4 specific, actionable tips tailored to this trip and traveller — not generic advice)"],
  "next_steps": ["string (3 clear, ordered action items the traveller should do right now)"],
  "readiness_score": number (0-100, reflecting how complete and well-matched this trip plan is for the traveller)
}`;

async function runSummarySubAgent(
    input: {
        destination: string;
        traveler_name: string;
        duration_days: number;
        travel_purpose: string;
        best_flight?: string;
        best_hotel?: string;
        weather_summary?: string;
        itinerary_highlight?: string;
        budget_estimate?: string;
    },
    client: AzureOpenAI,
): Promise<{ summary: TripSummary; inputTokens: number; outputTokens: number }> {
    const userMsg = [
        `Trip: ${input.duration_days}-day ${input.travel_purpose} trip to ${input.destination} for ${input.traveler_name}.`,
        `Best flight: ${input.best_flight || 'See flights tab'}.`,
        `Best hotel: ${input.best_hotel || 'See hotels tab'}.`,
        `Weather: ${input.weather_summary || 'See weather tab'}.`,
        `Itinerary highlight: ${input.itinerary_highlight || 'See itinerary tab'}.`,
        `Budget estimate: ${input.budget_estimate || 'TBD'}.`,
    ].join('\n');

    const { text, inputTokens, outputTokens } = await callSubAgent(client, SUMMARY_SYSTEM_PROMPT, userMsg, 1500);
    let summary: TripSummary;
    try {
        summary = JSON.parse(stripFences(text));
    } catch {
        summary = {
            executive_summary: `Your ${input.duration_days}-day ${input.travel_purpose} trip to ${input.destination} has been fully planned by our specialist agents. Flights, hotels, weather forecasts, and a personalised day-by-day itinerary are ready for your review in the tabs on the right.`,
            destination: input.destination,
            traveler_name: input.traveler_name,
            duration_days: input.duration_days,
            travel_purpose: input.travel_purpose,
            trip_highlights: [
                { icon: '✈️', label: 'Best Flight', value: input.best_flight || 'See Flights tab', detail: 'Top-picked by Flight Agent' },
                { icon: '🏨', label: 'Top Hotel', value: input.best_hotel || 'See Hotels tab', detail: 'Matched to your profile' },
                { icon: '🌤️', label: 'Weather', value: input.weather_summary || 'See Weather tab', detail: 'Seasonal forecast ready' },
                { icon: '📅', label: 'Itinerary', value: `${input.duration_days}-day plan`, detail: input.itinerary_highlight || 'Day-by-day schedule' },
            ],
            personalized_for: 'Tailored to your loyalty profile',
            total_estimate: input.budget_estimate || 'See Budget tab',
            top_recommendations: [
                'Review the Itinerary tab for your day-by-day plan',
                'Compare flight options and select your preferred timing',
                'Check hotel amenities before booking',
                'Review weather packing tips before departure',
            ],
            next_steps: [
                'Select and book your preferred flight',
                'Reserve your hotel room',
                'Download the itinerary for offline access',
            ],
            readiness_score: 85,
        };
    }
    return { summary, inputTokens, outputTokens };
}

// ─── Context compression ─────────────────────────────────────────────────────
// Strips tool results down to essentials before feeding back to the orchestrator.
// Keeps the context window lean so the final synthesis is fast.

function compressResult(toolName: string, result: any): any {
    if (!result) return result;
    switch (toolName) {
        case 'get_user_profile':
            return {
                name: result.name, tier: result.loyaltyTier, segment: result.segment,
                persona: result.travelPersona, style: result.travelStyle,
                cabinPref: result.preferredCabinClass, interests: result.specialInterests?.slice(0, 4),
            };
        case 'search_flights': {
            const slim = (flights: any[]) => (flights || []).slice(0, 3).map((f: any) => ({
                id: f.id, flight: f.flightNumber, from: f.origin, to: f.destination,
                dep: f.departureTime, arr: f.arrivalTime, dur: f.duration,
                price: f.price, stops: f.stops?.length ?? 0, topPick: f.top_pick,
            }));
            return {
                route: result.searched_route, total: result.total_results,
                commentary: result.agent_commentary,
                outbound: slim(result.outbound), returns: slim(result.return_flights),
            };
        }
        case 'search_hotels':
            return {
                destination: result.destination, total: result.total_results,
                commentary: result.agent_commentary,
                hotels: (result.hotels || []).slice(0, 3).map((h: any) => ({
                    id: h.id, name: h.name, category: h.category, rating: h.rating,
                    price: h.pricePerNight, topPick: h.top_pick, matchReason: h.match_reason,
                })),
            };
        case 'get_destination_info': {
            const d = result.destination;
            if (!d) return { found: false };
            return {
                found: true, name: d.name, country: d.country,
                intro: d.personalized_intro || d.tagline,
                bestTime: d.bestTimeToVisit, visa: d.visaRequirements,
                highlights: d.highlights?.slice(0, 3).map((h: any) => h.name),
                tips: d.tips?.slice(0, 2), budget: d.averageDailyBudget,
            };
        }
        case 'get_weather':
            return {
                destination: result.destination, season: result.season,
                overview: result.overview, avg_high: result.avg_high, avg_low: result.avg_low,
                humidity: result.humidity_level, uv: result.uv_index, rain: result.rainfall_chance,
            };
        case 'create_itinerary':
            return {
                destination: result.destination, days: result.duration_days,
                purpose: result.travel_purpose, personalizedFor: result.personalized_for,
                budget: result.budget_estimate,
                itinerary: (result.itinerary || []).map((day: any) => ({
                    day: day.day, title: day.title,
                    activities: day.activities?.slice(0, 3).map((a: any) => `${a.time} ${a.activity}`),
                })),
            };
        case 'summarize_trip':
            return {
                destination: result.destination, score: result.readiness_score,
                summary: result.executive_summary?.slice(0, 120),
                next_steps: result.next_steps?.slice(0, 2),
            };
        default:
            return result;
    }
}
