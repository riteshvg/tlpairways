/**
 * Travel Agent Tool Implementations
 *
 * Each function here is a "sub-agent" called by the orchestrator (Claude) via tool use.
 * Tools read from local mock data files and return structured results.
 */

import path from 'path';
import fs from 'fs';

// ─── Data loaders (server-side only) ────────────────────────────────────────

function loadData<T>(filename: string): T {
    const filePath = path.join(process.cwd(), 'data', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Flight {
    id: string;
    flightNumber: string;
    origin: string;
    originCity: string;
    destination: string;
    destinationCity: string;
    destinationCountry?: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    durationMinutes: number;
    price: number;
    aircraftType: string;
    stops: string[];
    availableSeats: number;
    cabinClass: string[];
    mealOptions: string[];
    baggage: { checked: string; cabin: string };
    distance: number;
    international?: boolean;
}

export interface Hotel {
    id: string;
    name: string;
    city: string;
    cityCode: string;
    country: string;
    rating: number;
    reviewCount: number;
    pricePerNight: number;
    currency: string;
    amenities: string[];
    category: string;
    description: string;
    neighbourhood: string;
    distanceFromAirport: string;
    checkInTime: string;
    checkOutTime: string;
    roomTypes: { type: string; pricePerNight: number; maxGuests: number }[];
    images: string[];
    coordinates: { lat: number; lng: number };
}

export interface DestinationInfo {
    name: string;
    country: string;
    cityCode: string;
    continent: string;
    tagline: string;
    description: string;
    bestTimeToVisit: string;
    currency: string;
    language: string;
    timezone: string;
    visaRequirements: string;
    highlights: Array<{
        name: string;
        type: string;
        description: string;
        bestTime: string;
        entryFee: string;
    }>;
    neighborhoods: Array<{ name: string; vibe: string }>;
    tips: string[];
    cuisine: string[];
    averageDailyBudget: { budget: string; mid: string; luxury: string };
}

// ─── Tool: search_flights ────────────────────────────────────────────────────

export interface SearchFlightsInput {
    origin: string;        // IATA code e.g. "BOM"
    destination: string;   // IATA code e.g. "DPS"
    departure_date?: string;
    return_date?: string;
    passengers?: number;
    cabin_class?: string;
}

export interface SearchFlightsResult {
    outbound: Flight[];
    return_flights: Flight[];
    total_results: number;
    searched_route: string;
}

export function searchFlights(input: SearchFlightsInput): SearchFlightsResult {
    const domestic = loadData<{ flights: Flight[] }>('flights.json');
    const international = loadData<{ flights: Flight[] }>('international-flights.json');
    const allFlights = [...domestic.flights, ...international.flights];

    const originUpper = input.origin.toUpperCase();
    const destUpper = input.destination.toUpperCase();

    const outbound = allFlights.filter(
        f => f.origin === originUpper && f.destination === destUpper
    ).slice(0, 4);

    let returnFlights: Flight[] = [];
    if (input.return_date) {
        returnFlights = allFlights.filter(
            f => f.origin === destUpper && f.destination === originUpper
        ).slice(0, 4);
    }

    // If cabin class filter provided, sort accordingly
    if (input.cabin_class) {
        const cabin = input.cabin_class.charAt(0).toUpperCase() + input.cabin_class.slice(1).toLowerCase();
        outbound.sort((a, b) =>
            (b.cabinClass.includes(cabin) ? 1 : -1) - (a.cabinClass.includes(cabin) ? 1 : -1)
        );
    }

    return {
        outbound,
        return_flights: returnFlights,
        total_results: outbound.length + returnFlights.length,
        searched_route: `${originUpper} → ${destUpper}`
    };
}

// ─── Tool: search_hotels ─────────────────────────────────────────────────────

export interface SearchHotelsInput {
    destination_code: string;  // IATA city code e.g. "DPS"
    check_in_date?: string;
    check_out_date?: string;
    guests?: number;
    category?: string;   // "luxury" | "boutique" | "premium" | "budget"
    max_price_per_night?: number;
}

export interface SearchHotelsResult {
    hotels: Hotel[];
    total_results: number;
    destination: string;
}

export function searchHotels(input: SearchHotelsInput): SearchHotelsResult {
    const hotelsData = loadData<Record<string, Hotel[]>>('hotels.json');
    const code = input.destination_code.toUpperCase();
    let hotels = hotelsData[code] || [];

    if (input.category) {
        hotels = hotels.filter(h => h.category === input.category);
    }
    if (input.max_price_per_night) {
        hotels = hotels.filter(h => h.pricePerNight <= input.max_price_per_night!);
    }
    if (input.guests && input.guests > 2) {
        hotels = hotels.filter(h =>
            h.roomTypes.some(r => r.maxGuests >= input.guests!)
        );
    }

    return {
        hotels,
        total_results: hotels.length,
        destination: code
    };
}

// ─── Tool: get_destination_info ──────────────────────────────────────────────

export interface GetDestinationInput {
    destination_code: string;  // IATA code e.g. "DPS"
}

export interface GetDestinationResult {
    found: boolean;
    destination?: DestinationInfo;
    message?: string;
}

export function getDestinationInfo(input: GetDestinationInput): GetDestinationResult {
    const destinations = loadData<Record<string, DestinationInfo>>('destinations.json');
    const code = input.destination_code.toUpperCase();
    const dest = destinations[code];

    if (!dest) {
        return { found: false, message: `No destination info found for code: ${code}` };
    }

    return { found: true, destination: dest };
}

// ─── Tool: create_itinerary ──────────────────────────────────────────────────

export interface CreateItineraryInput {
    destination: string;       // City name e.g. "Bali"
    destination_code: string;  // IATA e.g. "DPS"
    duration_days: number;
    travel_purpose: 'vacation' | 'business' | 'business_leisure' | 'honeymoon' | 'adventure';
    interests?: string[];
}

export interface ItineraryDay {
    day: number;
    title: string;
    activities: Array<{
        time: string;
        activity: string;
        type: string;
        tip?: string;
    }>;
}

export interface CreateItineraryResult {
    destination: string;
    duration_days: number;
    travel_purpose: string;
    itinerary: ItineraryDay[];
    packing_tips: string[];
    budget_estimate: string;
}

export function createItinerary(input: CreateItineraryInput): CreateItineraryResult {
    const destinations = loadData<Record<string, DestinationInfo>>('destinations.json');
    const dest = destinations[input.destination_code.toUpperCase()];

    const highlights = dest?.highlights || [];
    const tips = dest?.tips || [];
    const budget = dest?.averageDailyBudget;

    // Build a template itinerary from destination highlights
    const itinerary: ItineraryDay[] = [];

    for (let day = 1; day <= Math.min(input.duration_days, 7); day++) {
        const dayHighlights = highlights.slice((day - 1) * 2, day * 2);
        const activities: ItineraryDay['activities'] = [];

        if (day === 1) {
            activities.push({ time: '14:00', activity: 'Check-in and freshen up at hotel', type: 'accommodation' });
            activities.push({ time: '18:00', activity: `Explore ${dest?.neighborhoods?.[0]?.name || 'the local neighbourhood'}`, type: 'exploration' });
            activities.push({ time: '20:00', activity: 'Welcome dinner — local cuisine', type: 'dining', tip: dest?.cuisine?.[0] ? `Try ${dest.cuisine[0]}` : undefined });
        } else if (day === input.duration_days) {
            activities.push({ time: '09:00', activity: 'Last-minute shopping and souvenirs', type: 'shopping' });
            activities.push({ time: '12:00', activity: 'Farewell lunch', type: 'dining' });
            activities.push({ time: '15:00', activity: 'Transfer to airport', type: 'transport' });
        } else {
            activities.push({ time: '08:00', activity: 'Breakfast at hotel', type: 'dining' });
            if (dayHighlights[0]) {
                activities.push({
                    time: '10:00',
                    activity: dayHighlights[0].name,
                    type: dayHighlights[0].type,
                    tip: dayHighlights[0].description.substring(0, 80) + '...'
                });
            }
            if (input.travel_purpose === 'business' || input.travel_purpose === 'business_leisure') {
                activities.push({ time: '14:00', activity: 'Business meetings / conference sessions', type: 'business' });
                if (day % 2 === 0 && dayHighlights[1]) {
                    activities.push({
                        time: '18:00',
                        activity: dayHighlights[1].name,
                        type: dayHighlights[1].type,
                        tip: `Best time: ${dayHighlights[1].bestTime}`
                    });
                }
            } else {
                if (dayHighlights[1]) {
                    activities.push({
                        time: '15:00',
                        activity: dayHighlights[1].name,
                        type: dayHighlights[1].type,
                        tip: `Best time: ${dayHighlights[1].bestTime}`
                    });
                }
                activities.push({
                    time: '19:30',
                    activity: 'Dinner — ' + (dest?.neighborhoods?.[day % (dest?.neighborhoods?.length || 1)]?.name || 'local area'),
                    type: 'dining'
                });
            }
        }

        const titles: Record<number, string> = {
            1: 'Arrival & First Impressions',
            2: 'Culture & Highlights',
            3: 'Adventure & Exploration',
            4: 'Hidden Gems & Local Life',
            5: 'Relaxation & Indulgence',
            6: 'Day Trips & Surroundings',
            7: 'Farewell Day'
        };

        itinerary.push({
            day,
            title: titles[day] || `Day ${day}`,
            activities
        });
    }

    const dailyBudget = input.travel_purpose === 'vacation' || input.travel_purpose === 'honeymoon'
        ? budget?.mid
        : budget?.mid;

    return {
        destination: dest?.name || input.destination,
        duration_days: input.duration_days,
        travel_purpose: input.travel_purpose,
        itinerary,
        packing_tips: tips.slice(0, 3),
        budget_estimate: dailyBudget
            ? `Approx. ${dailyBudget} per person per day (mid-range)`
            : 'Varies by preference'
    };
}

// ─── Tool: get_user_profile (AEP Real-Time Profile mock) ────────────────────

export interface GetUserProfileInput {
    user_id?: string;
}

export interface UserProfile {
    userId: string;
    segment: string;
    loyaltyTier: string;
    preferredCabinClass: string;
    preferredDestinations: string[];
    pastTrips: Array<{ destination: string; date: string; type: string }>;
    travelPersona: string;
    aepProfileNote: string;
}

export function getUserProfile(input: GetUserProfileInput): UserProfile {
    // Mock AEP Real-Time Customer Profile — in production this would call AEP APIs
    return {
        userId: input.user_id || 'anonymous',
        segment: 'Frequent Traveler',
        loyaltyTier: 'Gold',
        preferredCabinClass: 'Business',
        preferredDestinations: ['Singapore', 'Dubai', 'London'],
        pastTrips: [
            { destination: 'Singapore', date: '2025-11', type: 'business' },
            { destination: 'Bali', date: '2025-06', type: 'vacation' },
            { destination: 'Dubai', date: '2025-02', type: 'business_leisure' }
        ],
        travelPersona: 'Business + Leisure Traveler (Bleisure)',
        aepProfileNote: 'Profile sourced from AEP Real-Time Customer Profile via Web SDK identity resolution (ECID + hashed email). Segment membership updated in real-time.'
    };
}

// ─── Tool: get_weather ───────────────────────────────────────────────────────

export interface GetWeatherInput {
    destination_code: string;
    destination: string;
    departure_date?: string;
    return_date?: string;
    duration_days?: number;
}

export interface WeatherDay {
    label: string;        // "Day 1", "Day 2", or day-of-week if dates provided
    date?: string;        // YYYY-MM-DD optional
    icon: string;         // weather emoji: ☀️ 🌤️ ⛅ 🌦️ 🌧️ 🌩️ 🌨️ 🌫️
    condition: string;    // "Sunny", "Partly Cloudy", "Light Rain"
    high: number;         // °C
    low: number;          // °C
    humidity: number;     // %
    note?: string;        // optional tip e.g. "Pack sunscreen"
}

export interface WeatherForecast {
    destination: string;
    travel_period: string;          // e.g. "June 15–22, 2025"
    season: string;                 // e.g. "Dry Season", "Summer Monsoon"
    overview: string;               // 1-2 sentence summary
    avg_high: number;
    avg_low: number;
    humidity_level: string;         // "Low" | "Moderate" | "High" | "Very High"
    uv_index: string;               // "Low" | "Moderate" | "High" | "Very High" | "Extreme"
    rainfall_chance: string;        // "< 10%" | "10–30%" | "30–60%" | "> 60%"
    daily: WeatherDay[];
    packing_tips: string[];         // weather-specific packing tips
    best_time_of_day: string;       // e.g. "Early mornings and evenings are coolest"
}

// ─── Tool definitions (passed to Claude API) ────────────────────────────────

export const TOOL_DEFINITIONS = [
    {
        name: 'search_flights',
        description: 'Search for available flights between two airports. Returns outbound and optionally return flights with prices, timing, and cabin class options.',
        input_schema: {
            type: 'object',
            properties: {
                origin: { type: 'string', description: 'IATA airport code for departure city (e.g. "BOM" for Mumbai, "DEL" for Delhi)' },
                destination: { type: 'string', description: 'IATA airport code for arrival city (e.g. "DPS" for Bali, "SYD" for Sydney)' },
                departure_date: { type: 'string', description: 'Departure date in YYYY-MM-DD format' },
                return_date: { type: 'string', description: 'Return date in YYYY-MM-DD format for round trips' },
                passengers: { type: 'number', description: 'Number of passengers' },
                cabin_class: { type: 'string', enum: ['economy', 'premium economy', 'business', 'first'], description: 'Preferred cabin class' }
            },
            required: ['origin', 'destination']
        }
    },
    {
        name: 'search_hotels',
        description: 'Search for hotels in a destination city. Returns hotels with ratings, prices, amenities, and room options.',
        input_schema: {
            type: 'object',
            properties: {
                destination_code: { type: 'string', description: 'IATA city code (e.g. "DPS" for Bali, "SYD" for Sydney, "LHR" for London)' },
                check_in_date: { type: 'string', description: 'Check-in date in YYYY-MM-DD format' },
                check_out_date: { type: 'string', description: 'Check-out date in YYYY-MM-DD format' },
                guests: { type: 'number', description: 'Number of guests' },
                category: { type: 'string', enum: ['luxury', 'boutique', 'premium', 'ultra-luxury'], description: 'Hotel category preference' },
                max_price_per_night: { type: 'number', description: 'Maximum price per night in INR' }
            },
            required: ['destination_code']
        }
    },
    {
        name: 'get_destination_info',
        description: 'Get detailed destination information including highlights, attractions, neighborhoods, travel tips, visa requirements, and cuisine.',
        input_schema: {
            type: 'object',
            properties: {
                destination_code: { type: 'string', description: 'IATA city code (e.g. "DPS" for Bali, "SYD" for Sydney, "DXB" for Dubai)' }
            },
            required: ['destination_code']
        }
    },
    {
        name: 'create_itinerary',
        description: 'Create a day-by-day travel itinerary for a destination, tailored to the travel purpose (vacation, business, business+leisure, honeymoon, adventure).',
        input_schema: {
            type: 'object',
            properties: {
                destination: { type: 'string', description: 'City name e.g. "Bali", "Sydney"' },
                destination_code: { type: 'string', description: 'IATA city code e.g. "DPS", "SYD"' },
                duration_days: { type: 'number', description: 'Number of days for the trip' },
                travel_purpose: { type: 'string', enum: ['vacation', 'business', 'business_leisure', 'honeymoon', 'adventure'], description: 'Purpose of travel' },
                interests: { type: 'array', items: { type: 'string' }, description: 'Traveler interests e.g. ["beach", "food", "temples"]' }
            },
            required: ['destination', 'destination_code', 'duration_days', 'travel_purpose']
        }
    },
    {
        name: 'get_user_profile',
        description: 'Retrieve the authenticated user\'s AEP Real-Time Customer Profile — travel preferences, loyalty tier, past trips, and segment membership. Use this to personalize recommendations.',
        input_schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string', description: 'User ID from Auth0 (optional — if omitted returns anonymous profile)' }
            },
            required: []
        }
    },
    {
        name: 'get_weather',
        description: 'Get weather forecast and climate information for the destination during the travel period. Returns daily conditions, temperature range, humidity, UV index, and packing tips.',
        input_schema: {
            type: 'object',
            properties: {
                destination_code: { type: 'string', description: 'IATA city code e.g. "DPS" for Bali' },
                destination: { type: 'string', description: 'City name e.g. "Bali"' },
                departure_date: { type: 'string', description: 'Departure date YYYY-MM-DD' },
                return_date: { type: 'string', description: 'Return date YYYY-MM-DD' },
                duration_days: { type: 'number', description: 'Trip duration in days' }
            },
            required: ['destination_code', 'destination']
        }
    }
];
