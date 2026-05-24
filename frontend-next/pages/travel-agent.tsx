import { useState, useRef, useEffect, useCallback } from 'react';
import Head from 'next/head';
import {
    Box, Typography, TextField, IconButton, Button, Paper, Tabs, Tab,
    CircularProgress, Chip, Divider, useTheme, useMediaQuery,
    Dialog, DialogTitle, DialogContent, DialogActions, Avatar,
    Grid, FormControl, InputLabel, Select, MenuItem, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import ExploreIcon from '@mui/icons-material/Explore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddCommentIcon from '@mui/icons-material/AddComment';
import PersonIcon from '@mui/icons-material/Person';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import CloseIcon from '@mui/icons-material/Close';
import { useUser } from '@auth0/nextjs-auth0/client';

import AgentMessage, { AgentId } from '../components/TravelAgent/AgentMessage';
import FlightResultCard from '../components/TravelAgent/FlightResultCard';
import HotelResultCard from '../components/TravelAgent/HotelResultCard';
import DestinationCard from '../components/TravelAgent/DestinationCard';
import ItineraryCard from '../components/TravelAgent/ItineraryCard';
import WeatherCard from '../components/TravelAgent/WeatherCard';
import SummaryCard from '../components/TravelAgent/SummaryCard';
import AepEventsPanel from '../components/TravelAgent/AepEventsPanel';
import { useAnalytics } from '../lib/analytics/useAnalytics';
import {
    trackAgentSessionStarted,
    trackAgentResultSelected,
    trackAgentBookingHandoff,
} from '../lib/analytics/agentEvents';
import {
    pushAgentSessionStarted,
    pushAgentResultSelected,
    pushAgentBookingHandoff,
} from '../lib/analytics/dataLayer';
import type { Flight, Hotel, DestinationInfo, CreateItineraryResult, WeatherForecast, TripSummary } from '../lib/agents/tools';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Message {
    id: string;
    role: 'user' | 'assistant';
    agent: AgentId;
    content: string;
    isLoading?: boolean;
    isStreaming?: boolean;
}

interface AgentStartEvent {
    type: 'agent_start';
    agent: AgentId;
    toolName: string;
    query: Record<string, any>;
}

interface AgentResultEvent {
    type: 'agent_result';
    agent: AgentId;
    toolName: string;
    data: any;
    isError?: boolean;
}

interface TextEvent {
    type: 'text';
    agent: 'orchestrator';
    content: string;
}

interface DoneEvent { type: 'done' }
interface ErrorEvent { type: 'error'; message: string }
interface SummarisingEvent { type: 'summarising' }

type SSEEvent = AgentStartEvent | AgentResultEvent | TextEvent | DoneEvent | ErrorEvent | SummarisingEvent;

interface Results {
    outboundFlights: Flight[];
    returnFlights: Flight[];
    hotels: Hotel[];
    destination: DestinationInfo | null;
    itinerary: CreateItineraryResult | null;
    weather: WeatherForecast | null;
    summary: TripSummary | null;
}

// ─── Suggested prompts ─────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
    { label: 'Vacation to Bali', text: 'I want to plan a 7-day vacation to Bali, Indonesia. I\'m flying from Mumbai.', icon: '🌴' },
    { label: 'Business trip to Sydney', text: 'Plan a business cum leisure itinerary for my 5-day trip to Sydney, Australia from Delhi.', icon: '💼' },
    { label: 'Weekend in Dubai', text: 'I need a 4-day itinerary for Dubai from Bangalore. Mix of business meetings and leisure.', icon: '🏙️' },
    { label: 'Romantic Singapore', text: 'Plan a honeymoon trip to Singapore for 6 nights from Mumbai. Looking for luxury options.', icon: '💍' },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function TravelAgentPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useUser();
    const { trackPageView } = useAnalytics();

    const STORAGE_KEY = 'tlp_agent_session';

    const makeWelcomeMessage = (name?: string): Message => ({
        id: 'welcome',
        role: 'assistant',
        agent: 'orchestrator',
        content: `Hello${name ? `, ${name.split(' ')[0]}` : ''}! 👋 I'm your AI Travel Concierge.\n\nI can help you plan complete trips — flights, hotels, destination highlights, and day-by-day itineraries. Just tell me where you want to go!\n\nTry: "I want to book a vacation to Bali from Mumbai" or "Plan a business trip to Sydney for 5 days."`,
    });

    // Always start with defaults — localStorage is browser-only and must be read in useEffect
    type AgentStatus = 'idle' | 'active' | 'done' | 'error';
    type PipelineState = Record<string, AgentStatus>;

    const [messages, setMessages] = useState<Message[]>([makeWelcomeMessage()]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<Results>({ outboundFlights: [], returnFlights: [], hotels: [], destination: null, itinerary: null, weather: null, summary: null });
    const [activeTab, setActiveTab] = useState(0);
    const [agentSessionId, setAgentSessionId] = useState('');
    const [pipeline, setPipeline] = useState<PipelineState>({});
    const [isSummarising, setIsSummarising] = useState(false);
    const [tokenUsage, setTokenUsage] = useState<{ input: number; output: number } | null>(null);
    const [bookedFlightId, setBookedFlightId] = useState<string | null>(null);
    const [bookedReturnFlightId, setBookedReturnFlightId] = useState<string | null>(null);
    const [bookedHotelId, setBookedHotelId] = useState<string | null>(null);
    const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
    const [selectedReturn, setSelectedReturn] = useState<Flight | null>(null);

    // Trip details modal
    const [showTripModal, setShowTripModal] = useState(false);
    const [pendingPrompt, setPendingPrompt] = useState('');
    const [dateErrors, setDateErrors] = useState({ departure: false, returnDate: false });
    const [tripDetails, setTripDetails] = useState({
        adults: 1,
        children: 0,
        childAges: [] as number[],
        departureDate: '',
        returnDate: '',
        tripType: 'roundtrip' as 'oneway' | 'roundtrip',
        cabinClass: 'Economy',
        travelPurpose: 'leisure',
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Conversation history for the API (only user + final assistant turns)
    const conversationHistory = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

    // Restore session from localStorage after mount (client-only)
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.messages?.length) setMessages(parsed.messages);
                if (parsed.results) setResults(parsed.results);
                if (parsed.activeTab != null) setActiveTab(parsed.activeTab);
                if (parsed.agentSessionId) setAgentSessionId(parsed.agentSessionId);
                if (parsed.conversationHistory) conversationHistory.current = parsed.conversationHistory;
                if (parsed.tripDetails) setTripDetails(parsed.tripDetails);
                if (parsed.bookedFlightId) setBookedFlightId(parsed.bookedFlightId);
                if (parsed.bookedReturnFlightId) setBookedReturnFlightId(parsed.bookedReturnFlightId);
                if (parsed.bookedHotelId) setBookedHotelId(parsed.bookedHotelId);
                if (parsed.selectedOutbound) setSelectedOutbound(parsed.selectedOutbound);
                if (parsed.selectedReturn) setSelectedReturn(parsed.selectedReturn);
            }
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        trackPageView({
            pageType: 'travel-agent',
            pageName: 'AI Travel Agent',
            pageTitle: 'TLP Airways — AI Travel Concierge',
            sections: ['chat', 'results'],
            user
        });
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Persist session state so it survives navigation to booking pages
    useEffect(() => {
        if (messages.length <= 1 && !results.outboundFlights.length) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                messages: messages.filter(m => !m.isLoading),
                results,
                activeTab,
                agentSessionId,
                tripDetails,
                bookedFlightId,
                bookedReturnFlightId,
                bookedHotelId,
                selectedOutbound,
                selectedReturn,
                conversationHistory: conversationHistory.current,
            }));
        } catch { /* ignore quota errors */ }
    }, [messages, results, activeTab, agentSessionId, tripDetails, bookedFlightId, bookedReturnFlightId, bookedHotelId, selectedOutbound, selectedReturn]);

    const addMessage = useCallback((msg: Omit<Message, 'id'>) => {
        const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setMessages(prev => [...prev, { ...msg, id }]);
        return id;
    }, []);

    const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    }, []);

    const handleNewConversation = () => {
        localStorage.removeItem(STORAGE_KEY);
        conversationHistory.current = [];
        setMessages([makeWelcomeMessage(user?.name ?? undefined)]);
        setResults({ outboundFlights: [], returnFlights: [], hotels: [], destination: null, itinerary: null, weather: null, summary: null });
        setActiveTab(0);
        setAgentSessionId('');
        setInput('');
        setPipeline({});
        setIsSummarising(false);
        setTokenUsage(null);
        setTripDetails({ adults: 1, children: 0, childAges: [], departureDate: '', returnDate: '', tripType: 'roundtrip', cabinClass: 'Economy', travelPurpose: 'leisure' });
        setDateErrors({ departure: false, returnDate: false });
        setSelectedOutbound(null);
        setSelectedReturn(null);
        setBookedFlightId(null);
        setBookedReturnFlightId(null);
        setBookedHotelId(null);
    };

    const handleSend = (promptText?: string) => {
        const text = (promptText ?? input).trim();
        if (!text || isLoading) return;
        setInput('');
        setPendingPrompt(text);
        setShowTripModal(true);
    };

    const handleTripConfirm = async () => {
        const errors = {
            departure: !tripDetails.departureDate,
            returnDate: tripDetails.tripType === 'roundtrip' && !tripDetails.returnDate,
        };
        if (errors.departure || errors.returnDate) {
            setDateErrors(errors);
            return;
        }
        setDateErrors({ departure: false, returnDate: false });
        setShowTripModal(false);
        const text = buildEnrichedPrompt(pendingPrompt, tripDetails);
        await runAgents(text);
    };

    const buildEnrichedPrompt = (
        prompt: string,
        details: typeof tripDetails
    ): string => {
        const parts: string[] = [prompt];
        const travellers = details.adults + details.children;
        parts.push(`\n\nTrip details:`);
        parts.push(`- Travellers: ${details.adults} adult${details.adults !== 1 ? 's' : ''}${details.children > 0 ? `, ${details.children} child${details.children !== 1 ? 'ren' : ''}` : ''}`);
        if (details.children > 0 && details.childAges.length > 0) {
            parts.push(`- Children's ages: ${details.childAges.join(', ')} years`);
        }
        parts.push(`- Trip type: ${details.tripType === 'roundtrip' ? 'Round trip' : 'One way'}`);
        parts.push(`- Cabin class: ${details.cabinClass}`);
        parts.push(`- Travel purpose: ${details.travelPurpose}`);
        if (details.departureDate) parts.push(`- Departure: ${details.departureDate}`);
        if (details.returnDate && details.tripType === 'roundtrip') parts.push(`- Return: ${details.returnDate}`);
        if (details.departureDate && details.returnDate && details.tripType === 'roundtrip') {
            const dep = new Date(details.departureDate);
            const ret = new Date(details.returnDate);
            const nights = Math.round((ret.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24));
            if (nights > 0) parts.push(`- Duration: ${nights} night${nights !== 1 ? 's' : ''}`);
        }
        return parts.join('\n');
    };

    const runAgents = async (text: string) => {
        setIsLoading(true);

        // Generate a session ID for this conversation turn
        const sessionId = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setAgentSessionId(sessionId);

        // Add user message to UI
        addMessage({ role: 'user', agent: 'user', content: text });

        // Track session start — both data layer and Web SDK
        pushAgentSessionStarted({ agentSessionId: sessionId, userPrompt: text });
        trackAgentSessionStarted({ agentSessionId: sessionId, userPrompt: text, intentType: 'travel_request' });

        // Build API conversation history
        conversationHistory.current.push({ role: 'user', content: text });

        // Placeholder for streaming orchestrator response
        const orchestratorMsgId = addMessage({
            role: 'assistant',
            agent: 'orchestrator',
            content: '',
            isLoading: true,
        });
        let orchestratorText = '';

        // Reset results and pipeline for new query
        setPipeline({});
        setIsSummarising(false);
        setTokenUsage(null);
        const newResults: Results = { outboundFlights: [], returnFlights: [], hotels: [], destination: null, itinerary: null, weather: null, summary: null };

        try {
            const response = await fetch('/api/travel-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: conversationHistory.current })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'API error');
            }

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const jsonStr = line.slice(6).trim();
                    if (!jsonStr) continue;

                    let event: SSEEvent;
                    try { event = JSON.parse(jsonStr); } catch { continue; }

                    if (event.type === 'text') {
                        orchestratorText += event.content;
                        updateMessage(orchestratorMsgId, {
                            content: orchestratorText,
                            isLoading: false,
                            isStreaming: true
                        });

                    } else if (event.type === 'agent_start') {
                        setPipeline(prev => ({ ...prev, [event.agent]: 'active' }));

                    } else if (event.type === 'agent_result') {
                        setPipeline(prev => ({ ...prev, [event.agent]: event.isError ? 'error' : 'done' }));

                        if (!event.isError) {
                            if (event.toolName === 'search_flights') {
                                // Accumulate across multiple calls — deduplicate by flight ID
                                const incomingOutbound: Flight[] = event.data?.outbound || [];
                                const incomingReturn: Flight[] = event.data?.return_flights || [];
                                const existingOutboundIds = new Set(newResults.outboundFlights.map(f => f.id));
                                const existingReturnIds = new Set(newResults.returnFlights.map(f => f.id));
                                newResults.outboundFlights = [
                                    ...newResults.outboundFlights,
                                    ...incomingOutbound.filter(f => !existingOutboundIds.has(f.id))
                                ];
                                newResults.returnFlights = [
                                    ...newResults.returnFlights,
                                    ...incomingReturn.filter(f => !existingReturnIds.has(f.id))
                                ];
                                if (newResults.outboundFlights.length > 0) setActiveTab(0); // Flights+Hotels tab
                                console.log('[FlightAgent] outbound:', newResults.outboundFlights.length, 'return:', newResults.returnFlights.length);
                            } else if (event.toolName === 'search_hotels') {
                                newResults.hotels = event.data.hotels || [];
                                if (newResults.hotels.length > 0 && newResults.outboundFlights.length === 0) setActiveTab(0);
                            } else if (event.toolName === 'get_destination_info' && event.data.destination) {
                                newResults.destination = event.data.destination;
                            } else if (event.toolName === 'create_itinerary') {
                                newResults.itinerary = event.data;
                            } else if (event.toolName === 'get_weather') {
                                newResults.weather = event.data;
                            } else if (event.toolName === 'summarize_trip') {
                                newResults.summary = event.data;
                            }
                            setResults({ ...newResults });
                        }

                    } else if (event.type === 'summarising') {
                        setIsSummarising(true);

                    } else if (event.type === 'done') {
                        setIsSummarising(false);
                        if ((event as any).usage) setTokenUsage((event as any).usage);
                        updateMessage(orchestratorMsgId, { isLoading: false, isStreaming: false });
                        conversationHistory.current.push({ role: 'assistant', content: orchestratorText });

                    } else if (event.type === 'error') {
                        updateMessage(orchestratorMsgId, {
                            content: `Sorry, I encountered an error: ${event.message}`,
                            isLoading: false,
                            isStreaming: false
                        });
                    }
                }
            }
        } catch (err: any) {
            updateMessage(orchestratorMsgId, {
                content: `I'm unable to process your request right now. Please check that ANTHROPIC_API_KEY is configured.\n\nError: ${err.message}`,
                isLoading: false,
                isStreaming: false
            });
        } finally {
            setIsLoading(false);
            setIsSummarising(false);
            updateMessage(orchestratorMsgId, { isStreaming: false });
        }
    };

    const navigateToBooking = (outbound: Flight, returnFlight: Flight | null) => {
        const fallbackDate = new Date();
        fallbackDate.setDate(fallbackDate.getDate() + 14);
        const departDate = tripDetails.departureDate || fallbackDate.toISOString().split('T')[0];
        const totalPassengers = tripDetails.adults + tripDetails.children;

        pushAgentResultSelected({ agentSessionId, resultType: 'flight', resultId: outbound.id, resultName: outbound.flightNumber, price: outbound.price, destination: outbound.destination });
        trackAgentResultSelected({ agentSessionId, resultType: 'flight', resultId: outbound.id, resultName: outbound.flightNumber, price: outbound.price, destination: outbound.destination });
        pushAgentBookingHandoff({ agentSessionId, bookingType: 'flight', destinationCode: outbound.destination, targetPage: '/traveller-details' });
        trackAgentBookingHandoff({ agentSessionId, bookingType: 'flight', destinationCode: outbound.destination, targetPage: '/traveller-details' });

        const params = new URLSearchParams({
            originCode: outbound.origin,
            destinationCode: outbound.destination,
            date: departDate,
            adults: String(tripDetails.adults),
            children: String(tripDetails.children),
            infants: '0',
            passengers: String(totalPassengers),
            tripType: tripDetails.tripType,
            cabinClass: tripDetails.cabinClass,
            onwardFlightId: outbound.id,
            ...(returnFlight && { returnFlightId: returnFlight.id }),
            ...(tripDetails.returnDate && tripDetails.tripType === 'roundtrip' && { returnDate: tripDetails.returnDate }),
        });
        // Mark as booked in the agent tab immediately — visible when user switches back
        setBookedFlightId(outbound.id);
        setBookedReturnFlightId(returnFlight?.id ?? null);
        setSelectedOutbound(null);
        setSelectedReturn(null);
        window.open(`/traveller-details?${params.toString()}`, '_blank');
    };

    const handleBookFlight = (flight: Flight, label: string) => {
        if (label === 'Outbound') {
            setSelectedOutbound(prev => prev?.id === flight.id ? null : flight);
        } else {
            setSelectedReturn(prev => prev?.id === flight.id ? null : flight);
        }
    };

    const handleConfirmBooking = () => {
        if (selectedOutbound) navigateToBooking(selectedOutbound, selectedReturn);
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

    const handleBookHotel = (hotel: Hotel) => {
        pushAgentResultSelected({ agentSessionId, resultType: 'hotel', resultId: hotel.id, resultName: hotel.name, price: hotel.pricePerNight, destination: hotel.cityCode });
        trackAgentResultSelected({ agentSessionId, resultType: 'hotel', resultId: hotel.id, resultName: hotel.name, price: hotel.pricePerNight, destination: hotel.cityCode });
        pushAgentBookingHandoff({ agentSessionId, bookingType: 'hotel', destinationCode: hotel.cityCode, targetPage: '/hotel-booking' });
        trackAgentBookingHandoff({ agentSessionId, bookingType: 'hotel', destinationCode: hotel.cityCode, targetPage: '/hotel-booking' });

        const fallbackCheckIn = new Date();
        fallbackCheckIn.setDate(fallbackCheckIn.getDate() + 14);
        const fallbackCheckOut = new Date(fallbackCheckIn);
        fallbackCheckOut.setDate(fallbackCheckOut.getDate() + 3);

        const params = new URLSearchParams({
            hotelId: hotel.id,
            hotelName: hotel.name,
            cityCode: hotel.cityCode,
            city: hotel.city,
            country: hotel.country,
            pricePerNight: String(hotel.pricePerNight),
            category: hotel.category,
            checkIn: tripDetails.departureDate || fallbackCheckIn.toISOString().split('T')[0],
            checkOut: tripDetails.returnDate || fallbackCheckOut.toISOString().split('T')[0],
            guests: String(tripDetails.adults + tripDetails.children),
        });
        // Mark as booked in the agent tab immediately — visible when user switches back
        setBookedHotelId(hotel.id);
        window.open(`/hotel-booking?${params.toString()}`, '_blank');
    };

    // Tab 0: Flights  Tab 1: Hotels  Tab 2: Weather  Tab 3: Recommendations  Tab 4: Budget  Tab 5: Itinerary  Tab 6: Summary
    const tabHasData = (tab: number) => {
        if (tab === 0) return results.outboundFlights.length > 0 || results.returnFlights.length > 0;
        if (tab === 1) return results.hotels.length > 0;
        if (tab === 2) return !!results.weather;
        if (tab === 3) return !!results.destination;
        if (tab === 4) return !!(results.destination?.averageDailyBudget || results.itinerary?.budget_estimate);
        if (tab === 5) return !!results.itinerary;
        if (tab === 6) return !!results.summary;
        return false;
    };

    // ─── Render ─────────────────────────────────────────────────────────────

    const pipelineDoneLabels: Record<string, string> = {
        'flight-agent':      results.outboundFlights.length > 0 ? `${results.outboundFlights.length} flights` : '',
        'hotel-agent':       results.hotels.length > 0 ? `${results.hotels.length} hotels` : '',
        'destination-agent': results.destination ? results.destination.name : '',
        'itinerary-agent':   results.itinerary ? `${results.itinerary.duration_days}d itinerary` : '',
        'profile-agent':     'Gold tier',
        'weather-agent':     results.weather ? `${results.weather.avg_high}°C · ${results.weather.season?.split(/[\s/]+/).slice(0, 2).join(' ')}` : '',
        'summary-agent':     results.summary ? `${results.summary.readiness_score ?? 85}/100` : '',
    };

    const PIPELINE_AGENTS: { id: string; label: string; shortLabel: string; color: string; icon: React.ReactNode }[] = [
        { id: 'profile-agent',      label: 'Profile',     shortLabel: 'Profile',     color: '#37474F', icon: <PersonIcon sx={{ fontSize: 13 }} /> },
        { id: 'flight-agent',       label: 'Flights',     shortLabel: 'Flights',     color: '#00695C', icon: <FlightIcon sx={{ fontSize: 13 }} /> },
        { id: 'hotel-agent',        label: 'Hotels',      shortLabel: 'Hotels',      color: '#6A1B9A', icon: <HotelIcon sx={{ fontSize: 13 }} /> },
        { id: 'destination-agent',  label: 'Destination', shortLabel: 'Dest.',       color: '#BF360C', icon: <ExploreIcon sx={{ fontSize: 13 }} /> },
        { id: 'weather-agent',      label: 'Weather',     shortLabel: 'Weather',     color: '#1565C0', icon: <WbSunnyIcon sx={{ fontSize: 13 }} /> },
        { id: 'itinerary-agent',    label: 'Itinerary',   shortLabel: 'Itinerary',   color: '#2E7D32', icon: <CalendarMonthIcon sx={{ fontSize: 13 }} /> },
        { id: 'summary-agent',      label: 'Summary',     shortLabel: 'Summary',     color: '#AD1457', icon: <AutoAwesomeIcon sx={{ fontSize: 13 }} /> },
    ];

    const showPipeline = isLoading || Object.keys(pipeline).length > 0;

    // Find index of the currently active agent for connector animation
    const activeAgentIdx = PIPELINE_AGENTS.findIndex(a => pipeline[a.id] === 'active');

    const pipelineStrip = showPipeline ? (
        <Box sx={{
            px: 2,
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            overflowX: 'auto',
            flexShrink: 0,
        }}>
            {PIPELINE_AGENTS.map((agent, idx) => {
                const status: AgentStatus = pipeline[agent.id] || 'idle';
                const isActive = status === 'active';
                const isDone = status === 'done';
                const doneLabel = pipelineDoneLabels[agent.id];

                return (
                    <Box key={agent.id} sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Step */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            px: 0.75,
                            py: 0.5,
                            borderRadius: 2,
                            bgcolor: isDone ? `${agent.color}12` : isActive ? `${agent.color}08` : 'transparent',
                            border: '1px solid',
                            borderColor: isDone ? `${agent.color}35` : isActive ? `${agent.color}25` : 'transparent',
                            transition: 'all 0.3s ease',
                            minWidth: 52,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    bgcolor: isDone ? agent.color : isActive ? `${agent.color}30` : '#E0E0E0',
                                    color: isDone ? 'white' : isActive ? agent.color : '#9E9E9E',
                                    flexShrink: 0,
                                    transition: 'all 0.3s ease',
                                    ...(isActive && {
                                        animation: 'agentPulse 1.5s ease-in-out infinite',
                                        '@keyframes agentPulse': {
                                            '0%, 100%': { boxShadow: `0 0 0 0 ${agent.color}60` },
                                            '50%': { boxShadow: `0 0 0 4px ${agent.color}00` },
                                        }
                                    })
                                }}>
                                    {isActive
                                        ? <CircularProgress size={9} sx={{ color: agent.color }} />
                                        : isDone
                                            ? <Box component="span" sx={{ fontSize: 9, fontWeight: 900, lineHeight: 1, color: 'white' }}>✓</Box>
                                            : agent.icon
                                    }
                                </Box>
                                <Typography sx={{
                                    fontSize: '0.67rem',
                                    fontWeight: isDone || isActive ? 700 : 400,
                                    color: isDone ? agent.color : isActive ? agent.color : '#C0C0C0',
                                    whiteSpace: 'nowrap',
                                    transition: 'color 0.3s',
                                }}>
                                    {agent.shortLabel}
                                </Typography>
                            </Box>
                            {/* Result count below */}
                            {isDone && doneLabel && (
                                <Typography sx={{ fontSize: '0.58rem', color: agent.color, opacity: 0.8, mt: 0.2, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 72 }}>
                                    {doneLabel}
                                </Typography>
                            )}
                            {isActive && (
                                <Typography sx={{ fontSize: '0.58rem', color: agent.color, opacity: 0.7, mt: 0.2, fontStyle: 'italic' }}>
                                    working…
                                </Typography>
                            )}
                        </Box>

                        {/* Connector — pulses when this agent just finished and next is starting */}
                        {idx < PIPELINE_AGENTS.length - 1 && (() => {
                            const isHandoffActive = activeAgentIdx === idx + 1 && isDone;
                            const nextColor = PIPELINE_AGENTS[idx + 1].color;
                            return (
                                <Box sx={{
                                    mx: 0.3,
                                    width: 16,
                                    height: 2,
                                    borderRadius: 1,
                                    position: 'relative',
                                    bgcolor: isDone ? `${agent.color}40` : '#E8E8E8',
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                    ...(isHandoffActive && {
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: '-100%',
                                            width: '100%',
                                            height: '100%',
                                            background: `linear-gradient(90deg, transparent, ${nextColor}, transparent)`,
                                            animation: 'handoff 0.8s ease-in-out infinite',
                                            borderRadius: 1,
                                        },
                                        '@keyframes handoff': {
                                            '0%': { left: '-100%' },
                                            '100%': { left: '100%' },
                                        }
                                    })
                                }} />
                            );
                        })()}
                    </Box>
                );
            })}

            <Box sx={{ ml: 'auto', pl: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                {(isLoading || isSummarising) && (
                    <>
                        <CircularProgress size={10} sx={{ color: isSummarising ? 'primary.main' : 'text.disabled' }} />
                        <Typography sx={{ fontSize: '0.65rem', color: isSummarising ? 'primary.main' : 'text.disabled', fontStyle: 'italic', whiteSpace: 'nowrap', fontWeight: isSummarising ? 600 : 400 }}>
                            {isSummarising ? 'Generating summary…' : 'Processing…'}
                        </Typography>
                    </>
                )}
            </Box>
        </Box>
    ) : null;

    const chatPanel = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#FAFBFC' }}>
            {/* Agent pipeline breadcrumb */}
            {pipelineStrip}

            {/* Messages */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                px: 2.5,
                py: 2.5,
                backgroundImage: 'radial-gradient(circle at 20px 20px, #E8F4F8 1px, transparent 0)',
                backgroundSize: '32px 32px',
            }}>
                {messages.map(msg => (
                    <AgentMessage
                        key={msg.id}
                        agent={msg.agent}
                        content={msg.content}
                        isLoading={msg.isLoading}
                        isStreaming={msg.isStreaming}
                    />
                ))}
                <div ref={messagesEndRef} />
            </Box>

            {/* Suggested prompts (only when no conversation yet) */}
            {messages.length === 1 && (
                <Box sx={{ px: 2, pb: 1.5 }}>
                    <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 1, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        Popular requests
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {SUGGESTED_PROMPTS.map(p => (
                            <Box
                                key={p.label}
                                onClick={() => handleSend(p.text)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: '#F0F7FF',
                                        transform: 'translateX(2px)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    }
                                }}
                            >
                                <Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>{p.icon}</Typography>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', lineHeight: 1.3 }}>
                                        {p.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {p.text}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Input box */}
            <Box sx={{
                px: 2,
                pb: 2,
                pt: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}>
                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'flex-end',
                    bgcolor: '#F5F7F9',
                    borderRadius: 3,
                    border: '1.5px solid',
                    borderColor: 'divider',
                    px: 1.5,
                    py: 0.75,
                    transition: 'border-color 0.2s',
                    '&:focus-within': { borderColor: 'primary.main', bgcolor: 'background.paper' },
                }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={3}
                        placeholder="Where do you want to go? ✈️"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        disabled={isLoading}
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                            '& .MuiInputBase-root': { fontSize: '0.875rem', lineHeight: 1.5 },
                            '& textarea': { py: 0.5 },
                        }}
                    />
                    <IconButton
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        size="small"
                        sx={{
                            bgcolor: input.trim() && !isLoading ? 'primary.main' : 'action.disabledBackground',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                            '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                            borderRadius: 2,
                            p: 0.75,
                            mb: 0.25,
                            transition: 'background-color 0.2s',
                            flexShrink: 0,
                        }}
                    >
                        {isLoading ? <CircularProgress size={18} sx={{ color: 'text.disabled' }} /> : <SendIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                </Box>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 0.75, fontSize: '0.62rem' }}>
                    Shift+Enter for new line · Enter to send
                </Typography>
            </Box>
        </Box>
    );

    const resultsPanel = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tabs */}
            <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: '1px solid', borderColor: 'divider', minHeight: 44, bgcolor: 'background.paper', '& .MuiTab-root': { minHeight: 44, fontSize: '0.75rem', textTransform: 'none' } }}
            >
                <Tab icon={<FlightIcon sx={{ fontSize: 16 }} />} iconPosition="start"
                    label={`Flights${results.outboundFlights.length > 0 ? ` (${results.outboundFlights.length})` : ''}`} />
                <Tab icon={<HotelIcon sx={{ fontSize: 16 }} />} iconPosition="start"
                    label={`Hotels${results.hotels.length > 0 ? ` (${results.hotels.length})` : ''}`} />
                <Tab icon={<WbSunnyIcon sx={{ fontSize: 16 }} />} iconPosition="start"
                    label={`Weather${results.weather ? ' ✓' : ''}`} />
                <Tab icon={<TipsAndUpdatesIcon sx={{ fontSize: 16 }} />} iconPosition="start"
                    label={`Recommendations${results.destination ? ' ✓' : ''}`} />
                <Tab icon={<AccountBalanceWalletIcon sx={{ fontSize: 16 }} />} iconPosition="start"
                    label={`Budget${tabHasData(4) ? ' ✓' : ''}`} />
                <Tab icon={<CalendarMonthIcon sx={{ fontSize: 16 }} />} iconPosition="start"
                    label={`Itinerary${results.itinerary ? ' ✓' : ''}`} />
                <Tab icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />} iconPosition="start"
                    label={`Summary${results.summary ? ' ✓' : ''}`}
                    sx={{ color: results.summary ? '#AD1457' : undefined, '&.Mui-selected': { color: '#AD1457' } }} />
            </Tabs>

            {/* Tab content */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>

                {/* Tab 0: Flights */}
                {activeTab === 0 && (
                    <>
                        {results.outboundFlights.length === 0 && results.returnFlights.length === 0 && (
                            <EmptyState icon="✈️" message="Flights will appear here once you tell me your route." />
                        )}
                        {results.outboundFlights.length > 0 && (
                            <>
                                {!bookedFlightId && (results.outboundFlights[0] as any)?.agent_commentary && (
                                    <Box sx={{ display: 'flex', gap: 1, p: 1.25, mb: 1.5, borderRadius: 2, bgcolor: '#F0F7FF', border: '1px solid #BBDEFB' }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 14, color: '#1565C0', mt: 0.1, flexShrink: 0 }} />
                                        <Typography variant="caption" color="primary.dark">{(results.outboundFlights[0] as any).agent_commentary}</Typography>
                                    </Box>
                                )}
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                                    ✈️ Outbound Flights
                                </Typography>
                                {results.outboundFlights.map(f => (
                                    <FlightResultCard key={f.id} flight={f} label="Outbound" agentSessionId={agentSessionId} onBook={handleBookFlight}
                                        isBooked={bookedFlightId === f.id} isOtherBooked={!!bookedFlightId && bookedFlightId !== f.id}
                                        isSelected={selectedOutbound?.id === f.id} isOtherSelected={!!selectedOutbound && selectedOutbound.id !== f.id} />
                                ))}
                            </>
                        )}
                        {results.returnFlights.length > 0 && (
                            <>
                                <Divider sx={{ my: 1.5 }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                                    ↩️ Return Flights
                                </Typography>
                                {results.returnFlights.map(f => (
                                    <FlightResultCard key={f.id} flight={f} label="Return" agentSessionId={agentSessionId} onBook={handleBookFlight}
                                        isBooked={bookedReturnFlightId === f.id} isOtherBooked={!!bookedReturnFlightId && bookedReturnFlightId !== f.id}
                                        isSelected={selectedReturn?.id === f.id} isOtherSelected={!!selectedReturn && selectedReturn.id !== f.id} />
                                ))}
                            </>
                        )}

                        {/* ── Bottom booking panel ── */}
                        {(results.outboundFlights.length > 0 || results.returnFlights.length > 0) && (() => {
                            const hasReturn = results.returnFlights.length > 0 && tripDetails.tripType === 'roundtrip';
                            const isComplete = !!selectedOutbound && (!hasReturn || !!selectedReturn);
                            const totalPrice = ((selectedOutbound?.price ?? 0) + (selectedReturn?.price ?? 0)) * (tripDetails.adults + tripDetails.children);

                            if (bookedFlightId && (results.returnFlights.length === 0 || bookedReturnFlightId)) {
                                // Post-booking confirmation state
                                return (
                                    <Box sx={{ position: 'sticky', bottom: -16, mx: -2, mt: 2, p: 2, bgcolor: '#E8F5E9', borderTop: '2px solid #A5D6A7', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography sx={{ fontSize: 20 }}>✅</Typography>
                                                <Box>
                                                    <Typography variant="caption" fontWeight={700} color="#1B5E20" display="block">Flight booked!</Typography>
                                                    <Typography variant="caption" color="#2E7D32">Ready to pick your hotel?</Typography>
                                                </Box>
                                            </Box>
                                            <Button size="small" variant="contained" onClick={() => setActiveTab(1)}
                                                sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, textTransform: 'none', fontSize: '0.72rem', borderRadius: 2, whiteSpace: 'nowrap' }}>
                                                View Hotels →
                                            </Button>
                                        </Box>
                                    </Box>
                                );
                            }

                            return (
                                <Box sx={{
                                    position: 'sticky', bottom: -16, mx: -2, mt: 2, p: 2,
                                    bgcolor: 'background.paper',
                                    borderTop: '2px solid',
                                    borderColor: isComplete ? '#43A047' : 'divider',
                                    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                                }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.62rem', display: 'block', mb: 1.25 }}>
                                        Your Selection
                                    </Typography>

                                    {/* Outbound slot */}
                                    {selectedOutbound ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, p: 1, borderRadius: 1.5, bgcolor: '#E0F2F1', border: '1px solid #80CBC4' }}>
                                            <FlightTakeoffIcon sx={{ fontSize: 14, color: '#00695C', flexShrink: 0 }} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="caption" fontWeight={700} color="#00695C" noWrap>
                                                    {selectedOutbound.flightNumber} · {selectedOutbound.origin}→{selectedOutbound.destination}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.62rem' }}>
                                                    {selectedOutbound.departureTime}–{selectedOutbound.arrivalTime} · {selectedOutbound.duration}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" fontWeight={700} color="#00695C" sx={{ flexShrink: 0 }}>
                                                {formatPrice(selectedOutbound.price)}
                                            </Typography>
                                            <IconButton size="small" onClick={() => setSelectedOutbound(null)} sx={{ p: 0.25, flexShrink: 0 }}>
                                                <CloseIcon sx={{ fontSize: 13 }} />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, p: 1, borderRadius: 1.5, border: '1.5px dashed', borderColor: 'divider' }}>
                                            <FlightTakeoffIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                            <Typography variant="caption" color="text.disabled">Select an outbound flight above</Typography>
                                        </Box>
                                    )}

                                    {/* Return slot */}
                                    {hasReturn && (
                                        selectedReturn ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, p: 1, borderRadius: 1.5, bgcolor: '#E8F5E9', border: '1px solid #A5D6A7' }}>
                                                <FlightLandIcon sx={{ fontSize: 14, color: '#2E7D32', flexShrink: 0 }} />
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="caption" fontWeight={700} color="#2E7D32" noWrap>
                                                        {selectedReturn.flightNumber} · {selectedReturn.origin}→{selectedReturn.destination}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.62rem' }}>
                                                        {selectedReturn.departureTime}–{selectedReturn.arrivalTime} · {selectedReturn.duration}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" fontWeight={700} color="#2E7D32" sx={{ flexShrink: 0 }}>
                                                    {formatPrice(selectedReturn.price)}
                                                </Typography>
                                                <IconButton size="small" onClick={() => setSelectedReturn(null)} sx={{ p: 0.25, flexShrink: 0 }}>
                                                    <CloseIcon sx={{ fontSize: 13 }} />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, p: 1, borderRadius: 1.5, border: '1.5px dashed', borderColor: 'divider' }}>
                                                <FlightLandIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                <Typography variant="caption" color="text.disabled">Select a return flight above</Typography>
                                            </Box>
                                        )
                                    )}

                                    {/* Total + Book Now */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.25 }}>
                                        {(selectedOutbound || selectedReturn) ? (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.62rem' }}>Total</Typography>
                                                <Typography variant="subtitle2" fontWeight={800} color={isComplete ? '#2E7D32' : 'text.primary'}>
                                                    {formatPrice(totalPrice)}
                                                </Typography>
                                                {tripDetails.adults + tripDetails.children > 1 && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                                                        for {tripDetails.adults + tripDetails.children} travellers
                                                    </Typography>
                                                )}
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>
                                                Select a flight to see total
                                            </Typography>
                                        )}
                                        <Button
                                            variant="contained"
                                            disabled={!isComplete}
                                            onClick={handleConfirmBooking}
                                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
                                        >
                                            Book Now →
                                        </Button>
                                    </Box>
                                </Box>
                            );
                        })()}
                    </>
                )}

                {/* Tab 1: Hotels */}
                {activeTab === 1 && (
                    <>
                        {results.hotels.length === 0 && (
                            <EmptyState icon="🏨" message="Hotels will appear here once you tell me your destination." />
                        )}
                        {results.hotels.length > 0 && (
                            <>
                                {(results.hotels[0] as any)?.agent_commentary && (
                                    <Box sx={{ display: 'flex', gap: 1, p: 1.25, mb: 1.5, borderRadius: 2, bgcolor: '#FAF0FF', border: '1px solid #E1BEE7' }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 14, color: '#6A1B9A', mt: 0.1, flexShrink: 0 }} />
                                        <Typography variant="caption" sx={{ color: '#4A148C' }}>{(results.hotels[0] as any).agent_commentary}</Typography>
                                    </Box>
                                )}
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                                    🏨 Hotels
                                </Typography>
                                {results.hotels.map(h => (
                                    <HotelResultCard key={h.id} hotel={h} agentSessionId={agentSessionId} onBook={handleBookHotel} />
                                ))}
                            </>
                        )}
                    </>
                )}

                {/* Tab 2: Weather */}
                {activeTab === 2 && (
                    <>
                        {!results.weather && <EmptyState icon="🌤️" message="Weather forecast will appear here once the Weather Agent runs." />}
                        {results.weather && <WeatherCard forecast={results.weather} />}
                    </>
                )}

                {/* Tab 3: Recommendations */}
                {activeTab === 3 && (
                    <>
                        {!results.destination && <EmptyState icon="💡" message="Destination highlights, local tips, and must-sees will appear here." />}
                        {results.destination && (
                            <Box>
                                {/* Personalised intro from Destination Agent */}
                                {(results.destination as any).personalized_intro && (
                                    <Box sx={{ display: 'flex', gap: 1, p: 1.5, mb: 2, borderRadius: 2, bgcolor: '#FFF8E1', border: '1px solid #FFE082' }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 14, color: '#F57F17', mt: 0.1, flexShrink: 0 }} />
                                        <Box>
                                            {(results.destination as any).recommended_for && (
                                                <Typography variant="caption" fontWeight={700} color="warning.dark" display="block" sx={{ mb: 0.25 }}>
                                                    {(results.destination as any).recommended_for}
                                                </Typography>
                                            )}
                                            <Typography variant="caption" color="text.primary" sx={{ lineHeight: 1.5 }}>
                                                {(results.destination as any).personalized_intro}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                {/* Highlights */}
                                {results.destination.highlights?.length > 0 && (
                                    <Box sx={{ mb: 2.5 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                                            🌟 Top Highlights
                                        </Typography>
                                        {results.destination.highlights.map((h, i) => (
                                            <Box key={i} sx={{ mb: 1, p: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="body2" fontWeight={700}>{h.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{h.description}</Typography>
                                                {h.bestTime && <Chip label={`Best: ${h.bestTime}`} size="small" sx={{ mt: 0.5, fontSize: '0.6rem' }} />}
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                                {/* Tips */}
                                {results.destination.tips?.length > 0 && (
                                    <Box sx={{ mb: 2.5 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                                            💡 Local Tips
                                        </Typography>
                                        {results.destination.tips.map((tip, i) => (
                                            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.75, p: 1, borderRadius: 1.5, bgcolor: '#FFFDE7' }}>
                                                <Typography sx={{ fontSize: '0.75rem' }}>•</Typography>
                                                <Typography variant="caption" color="text.primary">{tip}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                                {/* Cuisine */}
                                {results.destination.cuisine?.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                                            🍜 Must-Try Cuisine
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                            {results.destination.cuisine.map((c, i) => (
                                                <Chip key={i} label={c} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                                {/* Visa */}
                                {results.destination.visaRequirements && (
                                    <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: '#E3F2FD', border: '1px solid #BBDEFB' }}>
                                        <Typography variant="caption" fontWeight={700} color="primary.main">🛂 Visa Info</Typography>
                                        <Typography variant="caption" display="block" color="text.primary" sx={{ mt: 0.5 }}>{results.destination.visaRequirements}</Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </>
                )}

                {/* Tab 4: Budget */}
                {activeTab === 4 && (
                    <>
                        {!tabHasData(4) && <EmptyState icon="💰" message="Estimated budget breakdown will appear here once results are ready." />}

                        {tabHasData(4) && (
                            <Box>
                                {results.destination?.averageDailyBudget && (
                                    <Box sx={{ mb: 2.5 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1.5 }}>
                                            📊 Daily Budget Estimates
                                        </Typography>
                                        {[
                                            { label: 'Budget', value: results.destination.averageDailyBudget.budget, color: '#2E7D32', bg: '#E8F5E9' },
                                            { label: 'Mid-Range', value: results.destination.averageDailyBudget.mid, color: '#1565C0', bg: '#E3F2FD' },
                                            { label: 'Luxury', value: results.destination.averageDailyBudget.luxury, color: '#6A1B9A', bg: '#F3E5F5' },
                                        ].map(tier => (
                                            <Box key={tier.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, p: 1.5, borderRadius: 2, bgcolor: tier.bg, border: `1px solid ${tier.color}30` }}>
                                                <Typography variant="body2" fontWeight={700} sx={{ color: tier.color }}>{tier.label}</Typography>
                                                <Typography variant="body2" fontWeight={700} sx={{ color: tier.color }}>{tier.value} / person / day</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                                {results.itinerary?.budget_estimate && (
                                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#FFF8E1', border: '1px solid #FFE082' }}>
                                        <Typography variant="caption" fontWeight={700} color="warning.dark">🧮 Trip Estimate</Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>{results.itinerary.budget_estimate}</Typography>
                                        {results.itinerary.duration_days && (
                                            <Typography variant="caption" color="text.secondary">Based on {results.itinerary.duration_days}-day {results.itinerary.travel_purpose} trip</Typography>
                                        )}
                                    </Box>
                                )}
                                {results.destination && (
                                    <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: '#F5F5F5' }}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">💱 Local Currency</Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5 }}>{results.destination.currency} — {results.destination.name}, {results.destination.country}</Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </>
                )}

                {/* Tab 5: Itinerary */}
                {activeTab === 5 && (
                    <>
                        {!results.itinerary && <EmptyState icon="📅" message="Your day-by-day itinerary will appear here once the Itinerary Agent builds it." />}
                        {results.itinerary && <ItineraryCard itinerary={results.itinerary} />}
                    </>
                )}

                {/* Tab 6: Summary */}
                {activeTab === 6 && (
                    <>
                        {!results.summary && (
                            <EmptyState icon="✨" message="Your personalised trip brief will appear here once the Summary Agent synthesises all findings." />
                        )}
                        {results.summary && <SummaryCard summary={results.summary} />}
                    </>
                )}
            </Box>

            {/* AEP Events panel */}
            <Box sx={{ px: 2, pb: 2 }}>
                <AepEventsPanel />
            </Box>
        </Box>
    );

    return (
        <>
            <Head>
                <title>AI Travel Agent — TLP Airways</title>
                <meta name="description" content="Multi-agent AI travel planner for flights, hotels, and itineraries" />
            </Head>

            <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Page header */}
                <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', flexShrink: 0 }}>
                    <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight={700}>AI Travel Concierge</Typography>
                    <Chip label="Multi-Agent" size="small" sx={{ backgroundColor: '#E3F2FD', color: '#1565C0', fontSize: '0.65rem' }} />
                    <Chip label="AEP Web SDK" size="small" sx={{ backgroundColor: '#FFF3E0', color: '#E65100', fontSize: '0.65rem' }} />
                    <Chip label="Real-Time Profile" size="small" sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: '0.65rem' }} />
                    <Box sx={{ ml: 'auto' }}>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AddCommentIcon />}
                            onClick={handleNewConversation}
                            sx={{ textTransform: 'none', fontSize: '0.75rem', borderColor: 'divider', color: 'text.secondary' }}
                        >
                            New Chat
                        </Button>
                    </Box>
                </Box>

                {/* Main split pane */}
                {isMobile ? (
                    // Mobile: stacked
                    <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ height: '55%', borderBottom: '1px solid', borderColor: 'divider' }}>{chatPanel}</Box>
                        <Box sx={{ height: '45%' }}>{resultsPanel}</Box>
                    </Box>
                ) : (
                    // Desktop: side by side
                    <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                        <Paper elevation={0} sx={{ width: '40%', borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 0 }}>
                            {chatPanel}
                        </Paper>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'grey.50' }}>
                            {resultsPanel}
                        </Box>
                    </Box>
                )}
            </Box>

            {/* ── Trip Details Modal ── */}
            <Dialog open={showTripModal} onClose={() => setShowTripModal(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ pb: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                            <FamilyRestroomIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>Personalise your trip</Typography>
                            <Typography variant="caption" color="text.secondary">Help us find the right options for everyone</Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 2.5 }}>
                    {/* Travellers */}
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                        Travellers
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 2.5 }}>
                        {/* Adults */}
                        <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <PersonIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="caption" fontWeight={600}>Adults</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton size="small" onClick={() => setTripDetails(d => ({ ...d, adults: Math.max(1, d.adults - 1) }))}
                                    sx={{ border: '1px solid', borderColor: 'divider', p: 0.25 }}>
                                    <RemoveIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                                <Typography fontWeight={700} sx={{ minWidth: 24, textAlign: 'center' }}>{tripDetails.adults}</Typography>
                                <IconButton size="small" onClick={() => setTripDetails(d => ({ ...d, adults: Math.min(12, d.adults + 1) }))}
                                    sx={{ border: '1px solid', borderColor: 'divider', p: 0.25 }}>
                                    <AddIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </Box>
                        </Box>
                        {/* Children */}
                        <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <ChildCareIcon sx={{ fontSize: 16, color: '#6A1B9A' }} />
                                <Typography variant="caption" fontWeight={600}>Children</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton size="small" onClick={() => setTripDetails(d => {
                                    const kids = Math.max(0, d.children - 1);
                                    return { ...d, children: kids, childAges: d.childAges.slice(0, kids) };
                                })} sx={{ border: '1px solid', borderColor: 'divider', p: 0.25 }}>
                                    <RemoveIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                                <Typography fontWeight={700} sx={{ minWidth: 24, textAlign: 'center' }}>{tripDetails.children}</Typography>
                                <IconButton size="small" onClick={() => setTripDetails(d => ({
                                    ...d, children: Math.min(8, d.children + 1), childAges: [...d.childAges, 5]
                                }))} sx={{ border: '1px solid', borderColor: 'divider', p: 0.25 }}>
                                    <AddIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>

                    {/* Child ages */}
                    {tripDetails.children > 0 && (
                        <Box sx={{ mb: 2.5 }}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" sx={{ mb: 1 }}>
                                Children's ages
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {Array.from({ length: tripDetails.children }).map((_, i) => (
                                    <TextField
                                        key={i}
                                        label={`Child ${i + 1}`}
                                        type="number"
                                        size="small"
                                        value={tripDetails.childAges[i] ?? 5}
                                        onChange={e => setTripDetails(d => {
                                            const ages = [...d.childAges];
                                            ages[i] = Math.min(17, Math.max(0, Number(e.target.value)));
                                            return { ...d, childAges: ages };
                                        })}
                                        inputProps={{ min: 0, max: 17 }}
                                        sx={{ width: 90 }}
                                        InputProps={{ endAdornment: <Typography variant="caption" color="text.secondary">yrs</Typography> }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Trip type toggle */}
                    <Box sx={{ mb: 2.5 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                            Trip Type
                        </Typography>
                        <ToggleButtonGroup
                            value={tripDetails.tripType}
                            exclusive
                            onChange={(_, v) => { if (v) setTripDetails(d => ({ ...d, tripType: v, returnDate: v === 'oneway' ? '' : d.returnDate })); }}
                            size="small"
                            fullWidth
                        >
                            <ToggleButton value="oneway" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>One Way</ToggleButton>
                            <ToggleButton value="roundtrip" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>Round Trip</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* Dates */}
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                        Travel Dates
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                        <TextField
                            label="Departure *"
                            type="date"
                            size="small"
                            fullWidth
                            required
                            error={dateErrors.departure}
                            helperText={dateErrors.departure ? 'Please select a departure date' : ''}
                            value={tripDetails.departureDate}
                            onChange={e => { setTripDetails(d => ({ ...d, departureDate: e.target.value })); setDateErrors(err => ({ ...err, departure: false })); }}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: new Date().toISOString().split('T')[0] }}
                        />
                        {tripDetails.tripType === 'roundtrip' && (
                            <TextField
                                label="Return *"
                                type="date"
                                size="small"
                                fullWidth
                                required
                                error={dateErrors.returnDate}
                                helperText={dateErrors.returnDate ? 'Please select a return date' : ''}
                                value={tripDetails.returnDate}
                                onChange={e => { setTripDetails(d => ({ ...d, returnDate: e.target.value })); setDateErrors(err => ({ ...err, returnDate: false })); }}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: tripDetails.departureDate || new Date().toISOString().split('T')[0] }}
                            />
                        )}
                    </Box>

                    {/* Cabin class + Travel purpose */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Cabin Class</InputLabel>
                            <Select
                                value={tripDetails.cabinClass}
                                label="Cabin Class"
                                onChange={e => setTripDetails(d => ({ ...d, cabinClass: e.target.value }))}
                            >
                                <MenuItem value="Economy">Economy</MenuItem>
                                <MenuItem value="Premium Economy">Premium Economy</MenuItem>
                                <MenuItem value="Business">Business</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Travel Purpose</InputLabel>
                            <Select
                                value={tripDetails.travelPurpose}
                                label="Travel Purpose"
                                onChange={e => setTripDetails(d => ({ ...d, travelPurpose: e.target.value }))}
                            >
                                <MenuItem value="leisure">Leisure</MenuItem>
                                <MenuItem value="business">Business</MenuItem>
                                <MenuItem value="honeymoon">Honeymoon</MenuItem>
                                <MenuItem value="family">Family</MenuItem>
                                <MenuItem value="adventure">Adventure</MenuItem>
                                <MenuItem value="business and leisure">Business + Leisure</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Summary pill */}
                    {tripDetails.departureDate && (
                        <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: '#E3F2FD', border: '1px solid #BBDEFB', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DateRangeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="caption" color="primary.main" fontWeight={600}>
                                {tripDetails.adults + tripDetails.children} traveller{tripDetails.adults + tripDetails.children !== 1 ? 's' : ''}
                                {` · ${tripDetails.cabinClass}`}
                                {` · ${tripDetails.departureDate ? new Date(tripDetails.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}`}
                                {tripDetails.tripType === 'roundtrip' && tripDetails.returnDate ? ` → ${new Date(tripDetails.returnDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button variant="outlined" onClick={() => setShowTripModal(false)}
                        sx={{ textTransform: 'none', borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleTripConfirm}
                        startIcon={<AutoAwesomeIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}>
                        Plan My Trip
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, color: 'text.disabled' }}>
            <Typography fontSize={36} sx={{ mb: 1 }}>{icon}</Typography>
            <Typography variant="body2" textAlign="center" sx={{ maxWidth: 280, lineHeight: 1.6 }}>{message}</Typography>
        </Box>
    );
}
