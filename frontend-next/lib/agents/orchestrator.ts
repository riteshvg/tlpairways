/**
 * Travel Agent Orchestrator
 *
 * Runs the Claude API tool-use loop server-side and streams SSE events to the client.
 * Each tool call represents a named sub-agent (Flight Agent, Hotel Agent, etc.).
 *
 * SSE event shape:
 *   { type: "text",         agent: "orchestrator", content: "..." }
 *   { type: "agent_start",  agent: "flight-agent",  query: {...} }
 *   { type: "agent_result", agent: "flight-agent",  data: {...} }
 *   { type: "error",        message: "..." }
 *   { type: "done" }
 */

import Anthropic from '@anthropic-ai/sdk';
import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
import {
    TOOL_DEFINITIONS,
    searchFlights,
    searchHotels,
    getDestinationInfo,
    createItinerary,
    getUserProfile,
    SearchFlightsInput,
    SearchHotelsInput,
    GetDestinationInput,
    CreateItineraryInput,
    GetUserProfileInput,
    GetWeatherInput,
    WeatherForecast,
} from './tools';

// Map tool names → agent display names and colors
const AGENT_META: Record<string, { displayName: string; agentId: string }> = {
    search_flights:       { displayName: 'Flight Agent',      agentId: 'flight-agent' },
    search_hotels:        { displayName: 'Hotel Agent',       agentId: 'hotel-agent' },
    get_destination_info: { displayName: 'Destination Agent', agentId: 'destination-agent' },
    create_itinerary:     { displayName: 'Itinerary Agent',   agentId: 'itinerary-agent' },
    get_user_profile:     { displayName: 'Profile Agent',     agentId: 'profile-agent' },
    get_weather:          { displayName: 'Weather Agent',     agentId: 'weather-agent' },
};

const SYSTEM_PROMPT = `You are a sophisticated multi-agent travel assistant for TLP Airways. Your job is to understand natural language travel requests and coordinate specialist sub-agents to deliver comprehensive travel plans.

You have access to six specialist agents (tools):
1. **Profile Agent** (get_user_profile) — retrieves the traveler's AEP profile and preferences
2. **Flight Agent** (search_flights) — finds flights between airports
3. **Hotel Agent** (search_hotels) — finds hotels at destinations
4. **Destination Agent** (get_destination_info) — provides destination highlights, attractions, visa info, tips
5. **Weather Agent** (get_weather) — generates a weather forecast for the destination during the travel period
6. **Itinerary Agent** (create_itinerary) — builds day-by-day travel plans

**STRICT TOOL CALL ORDER — you MUST call all 6 tools, one per response, in this exact sequence:**
1. get_user_profile → FIRST, always
2. search_flights → SECOND, always
3. search_hotels → THIRD, always
4. get_destination_info → FOURTH, always
5. get_weather → FIFTH, always — pass the destination code and travel dates from the user's message
6. create_itinerary → SIXTH, always — you MUST call this even if you already have all other info

**CRITICAL RULES:**
- Call exactly ONE tool per response — never batch tools
- You MUST call all 6 tools before generating your final text response
- Do NOT write any summary or final answer until create_itinerary has been called and returned
- After each tool result, your ONLY response should be the next tool call — no commentary between tools

**Other guidelines:**
- For flights, infer the most likely Indian gateway from context (Mumbai=BOM, Delhi=DEL, Bangalore=BLR)
- Map city names to IATA codes: Bali=DPS, Sydney=SYD, London=LHR, Dubai=DXB, Singapore=SIN, Bangkok=BKK
- Present results in a warm, expert tone — like a knowledgeable travel concierge
- After all agents complete, write a SHORT conversational summary — maximum 3 sentences. Example: "Great news! I found 3 flights from Mumbai to Bali with prices from ₹24,800, and 2 hotel options in Nusa Dua. Check the tabs on the right for flights, hotels, your 7-day itinerary, recommendations, and budget breakdown."
- DO NOT include markdown tables, flight lists, hotel details, itinerary days, or bullet-point breakdowns in your response — all of that is already shown in the right panel tabs.
- DO NOT repeat data that agents already returned. Keep it warm and concise.

**Important:** When presenting prices, use INR (₹) format.`;

export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string | Anthropic.ContentBlock[];
}

type SSEWriter = (event: Record<string, any>) => void;

export async function runOrchestrator(
    messages: ConversationMessage[],
    writeSSE: SSEWriter
): Promise<{ input: number; output: number }> {
    // Support both direct Anthropic API and AWS Bedrock.
    // When USE_BEDROCK=true, credentials come from the IAM role automatically.
    const useBedrock = process.env.USE_BEDROCK === 'true' || !process.env.ANTHROPIC_API_KEY;
    const client = useBedrock
        ? new AnthropicBedrock({ awsRegion: process.env.AWS_REGION || 'us-east-1' })
        : new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Bedrock uses ARN-style model IDs; direct API uses short model names.
    // Default Bedrock model can be overridden with BEDROCK_MODEL_ID env var.
    const model = useBedrock
        ? (process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-sonnet-4-5-20250514-v2:0')
        : 'claude-sonnet-4-6';

    // Convert our message format to Anthropic's format
    const anthropicMessages: Anthropic.MessageParam[] = messages.map(m => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : m.content as Anthropic.ContentBlock[]
    }));

    let continueLoop = true;
    let currentMessages = [...anthropicMessages];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    while (continueLoop) {
        const response = await (client as any).messages.create({
            model,
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            tools: TOOL_DEFINITIONS as Anthropic.Tool[],
            messages: currentMessages
        });

        totalInputTokens += response.usage?.input_tokens ?? 0;
        totalOutputTokens += response.usage?.output_tokens ?? 0;

        // Collect text content and tool uses from this response turn
        const toolUses: Anthropic.ToolUseBlock[] = [];
        const textBlocks: Anthropic.TextBlock[] = [];

        for (const block of response.content) {
            if (block.type === 'text') {
                textBlocks.push(block);
                writeSSE({ type: 'text', agent: 'orchestrator', content: block.text });
            } else if (block.type === 'tool_use') {
                toolUses.push(block);
            }
        }

        // If no tool calls, we're done
        if (toolUses.length === 0 || response.stop_reason === 'end_turn') {
            continueLoop = false;
            break;
        }

        // Add assistant turn to messages
        currentMessages.push({ role: 'assistant', content: response.content });

        // Execute each tool and collect results — sequential with handoff delays for demo effect
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        for (const toolUse of toolUses) {
            const meta = AGENT_META[toolUse.name];
            const agentId = meta?.agentId || toolUse.name;

            // Signal that this agent is starting
            writeSSE({
                type: 'agent_start',
                agent: agentId,
                toolName: toolUse.name,
                query: toolUse.input
            });

            // Brief pause so the "working" state is visible before result arrives
            await sleep(600);

            let result: any;
            let isError = false;

            try {
                if (toolUse.name === 'create_itinerary') {
                    // Real LLM sub-agent — has its own system prompt and reasoning
                    const subAgentResult = await runItinerarySubAgent(
                        toolUse.input as CreateItineraryInput,
                        client,
                        useBedrock
                    );
                    totalInputTokens += subAgentResult.inputTokens;
                    totalOutputTokens += subAgentResult.outputTokens;
                    result = subAgentResult.itinerary;
                } else if (toolUse.name === 'get_weather') {
                    const subAgentResult = await runWeatherSubAgent(
                        toolUse.input as GetWeatherInput,
                        client,
                        useBedrock
                    );
                    totalInputTokens += subAgentResult.inputTokens;
                    totalOutputTokens += subAgentResult.outputTokens;
                    result = subAgentResult.forecast;
                } else {
                    result = executeTool(toolUse.name, toolUse.input as any);
                }
            } catch (err: any) {
                result = { error: err.message };
                isError = true;
            }

            // Stream the agent result to the client
            writeSSE({
                type: 'agent_result',
                agent: agentId,
                toolName: toolUse.name,
                data: result,
                isError
            });

            // Brief handoff pause before next agent starts — gives the UI time to animate
            await sleep(300);

            toolResults.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: JSON.stringify(compressResult(toolUse.name, result)),
                is_error: isError
            });
        }

        // Signal that all agents are done and final synthesis is starting
        writeSSE({ type: 'summarising', usage: { input: totalInputTokens, output: totalOutputTokens } });

        // Add tool results as user message and continue the loop
        currentMessages.push({ role: 'user', content: toolResults });
    }

    return { input: totalInputTokens, output: totalOutputTokens };
}

// ─── Itinerary Sub-Agent (real LLM call) ────────────────────────────────────

const ITINERARY_AGENT_SYSTEM_PROMPT = `
PERSONA: You are an expert travel itinerary architect with deep first-hand knowledge of global destinations. You specialise in crafting day-by-day experiences that feel authentic, practical, and tailored to how the traveler actually wants to spend their time — not a generic tourist checklist.

TASK: Create a detailed, personalised day-by-day itinerary for the given destination, duration, and travel purpose. Every day should feel distinct. Balance iconic experiences with local, off-the-beaten-path moments. For business or bleisure trips, schedule meetings in the morning and experiences in the evening. For honeymoons, lean into romance and privacy. For adventure, prioritise outdoor and active experiences.

CONTEXT: You will receive the destination name, IATA code, duration in days, travel purpose, and optional interests. Use your knowledge of the destination's geography, culture, neighbourhoods, and seasonal considerations. Reference specific real places, restaurants, and neighbourhoods by name.

FORMAT: Respond ONLY with a valid JSON object — no markdown, no explanation, no code fences. The JSON must exactly match this structure:
{
  "destination": "string",
  "duration_days": number,
  "travel_purpose": "string",
  "itinerary": [
    {
      "day": number,
      "title": "string (evocative title for the day)",
      "activities": [
        {
          "time": "HH:MM",
          "activity": "string (specific, vivid description)",
          "type": "dining|exploration|culture|adventure|business|shopping|relaxation|transport|accommodation",
          "tip": "string (practical insider tip, optional)"
        }
      ]
    }
  ],
  "packing_tips": ["string"],
  "budget_estimate": "string (e.g. ₹8,000–12,000 per person per day, mid-range)"
}
`;

async function runItinerarySubAgent(
    input: CreateItineraryInput,
    client: Anthropic | AnthropicBedrock,
    useBedrock: boolean
): Promise<{ itinerary: any; inputTokens: number; outputTokens: number }> {
    // Use the lightest capable model for the sub-agent to keep costs low
    const subModel = useBedrock
        ? 'us.anthropic.claude-haiku-4-5-20251001-v1:0'
        : 'claude-haiku-4-5-20251001';

    const userMessage = `Plan a ${input.duration_days}-day ${input.travel_purpose} trip to ${input.destination} (${input.destination_code}).${
        input.interests?.length ? ` Traveler interests: ${input.interests.join(', ')}.` : ''
    }`;

    const response = await (client as any).messages.create({
        model: subModel,
        max_tokens: 2048,
        system: ITINERARY_AGENT_SYSTEM_PROMPT.trim(),
        messages: [{ role: 'user', content: userMessage }],
    });

    const raw = response.content?.[0]?.type === 'text' ? response.content[0].text : '';

    let itinerary: any;
    try {
        // Strip any accidental markdown fences before parsing
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        itinerary = JSON.parse(cleaned);
    } catch {
        // Fallback to the deterministic function if LLM returns malformed JSON
        itinerary = createItinerary(input);
    }

    return {
        itinerary,
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
    };
}

// ─── Weather Sub-Agent (real LLM call) ──────────────────────────────────────

const WEATHER_AGENT_SYSTEM_PROMPT = `
PERSONA: You are an expert travel meteorologist with encyclopedic knowledge of seasonal weather patterns, climate zones, monsoon seasons, and micro-climates at popular travel destinations worldwide.

TASK: Generate a realistic weather forecast for a traveler visiting the destination during their specified travel period. Use your knowledge of the destination's climate, typical monthly conditions, and seasonal patterns. If exact dates are provided, use them precisely. If only a month can be inferred, use typical seasonal averages.

CONTEXT: You will receive the destination name, IATA code, and optionally departure/return dates and trip duration. Reference your knowledge of monsoon windows, dry/wet seasons, trade winds, and local weather phenomena (e.g. Bali's rainy season Nov–Mar, Sydney's mild winters, Dubai's extreme summer heat).

FORMAT: Respond ONLY with valid JSON — no markdown, no explanation, no code fences. Match this exact structure:
{
  "destination": "string",
  "travel_period": "string (human-readable, e.g. June 15–22, 2025)",
  "season": "string (e.g. Dry Season, Summer, Winter Monsoon)",
  "overview": "string (1-2 sentences summarising what the traveler should expect)",
  "avg_high": number (°C),
  "avg_low": number (°C),
  "humidity_level": "Low|Moderate|High|Very High",
  "uv_index": "Low|Moderate|High|Very High|Extreme",
  "rainfall_chance": "< 10%|10–30%|30–60%|> 60%",
  "daily": [
    {
      "label": "string (Day 1, Day 2... or Mon Jun 15 if dates known)",
      "date": "YYYY-MM-DD (optional)",
      "icon": "single weather emoji",
      "condition": "string (e.g. Sunny, Partly Cloudy, Light Rain)",
      "high": number,
      "low": number,
      "humidity": number,
      "note": "string (optional short tip)"
    }
  ],
  "packing_tips": ["string"],
  "best_time_of_day": "string"
}
Generate daily entries for each day of the trip (up to 7 days max).`.trim();

async function runWeatherSubAgent(
    input: GetWeatherInput,
    client: Anthropic | AnthropicBedrock,
    useBedrock: boolean
): Promise<{ forecast: WeatherForecast; inputTokens: number; outputTokens: number }> {
    const subModel = useBedrock
        ? 'us.anthropic.claude-haiku-4-5-20251001-v1:0'
        : 'claude-haiku-4-5-20251001';

    const parts = [`Weather forecast for ${input.destination} (${input.destination_code}).`];
    if (input.departure_date) parts.push(`Travel dates: ${input.departure_date}${input.return_date ? ` to ${input.return_date}` : ''}.`);
    if (input.duration_days) parts.push(`Duration: ${input.duration_days} days.`);

    const response = await (client as any).messages.create({
        model: subModel,
        max_tokens: 1500,
        system: WEATHER_AGENT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: parts.join(' ') }],
    });

    const raw = response.content?.[0]?.type === 'text' ? response.content[0].text : '{}';
    let forecast: WeatherForecast;
    try {
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        forecast = JSON.parse(cleaned);
    } catch {
        forecast = {
            destination: input.destination,
            travel_period: input.departure_date || 'Travel period',
            season: 'Seasonal',
            overview: 'Weather information unavailable.',
            avg_high: 28, avg_low: 22,
            humidity_level: 'Moderate',
            uv_index: 'High',
            rainfall_chance: '10–30%',
            daily: [],
            packing_tips: ['Check local weather before departure'],
            best_time_of_day: 'Morning hours are typically cooler',
        };
    }

    return {
        forecast,
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
    };
}

function executeTool(toolName: string, input: any): any {
    switch (toolName) {
        case 'search_flights':
            return searchFlights(input as SearchFlightsInput);
        case 'search_hotels':
            return searchHotels(input as SearchHotelsInput);
        case 'get_destination_info':
            return getDestinationInfo(input as GetDestinationInput);
        case 'create_itinerary':
            return createItinerary(input as CreateItineraryInput);
        case 'get_user_profile':
            return getUserProfile(input as GetUserProfileInput);
        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}

// Strip full JSON payloads down to just what Claude needs for the summary.
// Reduces token count by ~80% so the final synthesis call is much faster.
function compressResult(toolName: string, result: any): any {
    if (!result) return result;
    switch (toolName) {
        case 'search_flights': {
            const summarise = (flights: any[]) => (flights || []).slice(0, 4).map(f => ({
                id: f.id, flight: f.flightNumber, from: f.origin, to: f.destination,
                dep: f.departureTime, arr: f.arrivalTime, dur: f.duration,
                price: f.price, class: f.cabinClass, stops: f.stops?.length ?? 0,
            }));
            return { route: result.searched_route, total: result.total_results, outbound: summarise(result.outbound), returns: summarise(result.return_flights) };
        }
        case 'search_hotels': {
            return {
                destination: result.destination, total: result.total_results,
                hotels: (result.hotels || []).slice(0, 3).map((h: any) => ({
                    id: h.id, name: h.name, category: h.category, rating: h.rating,
                    price: h.pricePerNight, currency: h.currency, neighbourhood: h.neighbourhood,
                    amenities: h.amenities?.slice(0, 4),
                }))
            };
        }
        case 'get_destination_info': {
            const d = result.destination;
            if (!d) return { found: false };
            return {
                found: true, name: d.name, country: d.country, tagline: d.tagline,
                bestTime: d.bestTimeToVisit, currency: d.currency, visa: d.visaRequirements,
                highlights: d.highlights?.slice(0, 4).map((h: any) => ({ name: h.name, type: h.type })),
                tips: d.tips?.slice(0, 3), cuisine: d.cuisine?.slice(0, 3),
                budget: d.averageDailyBudget,
            };
        }
        case 'create_itinerary': {
            return {
                destination: result.destination, days: result.duration_days,
                purpose: result.travel_purpose, budget: result.budget_estimate,
                itinerary: (result.itinerary || []).map((day: any) => ({
                    day: day.day, title: day.title,
                    activities: day.activities?.map((a: any) => `${a.time} ${a.activity}`),
                })),
                packingTips: result.packing_tips,
            };
        }
        case 'get_user_profile': {
            return {
                segment: result.segment, tier: result.loyaltyTier,
                preferredClass: result.preferredCabinClass,
                topDestinations: result.preferredDestinations?.slice(0, 3),
                persona: result.travelPersona,
            };
        }
        case 'get_weather': {
            return {
                destination: result.destination,
                season: result.season,
                overview: result.overview,
                avg_high: result.avg_high,
                avg_low: result.avg_low,
                humidity: result.humidity_level,
                uv: result.uv_index,
                rain: result.rainfall_chance,
                days: result.daily?.length,
            };
        }
        default:
            return result;
    }
}
