import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
    Container,
    Paper,
    Typography,
    Button,
    Grid,
    Box,
    Divider,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import Head from 'next/head';
import { ExpandMore as ExpandMoreIcon, FlightTakeoff, FlightLand, Restaurant, Luggage, AirlineSeatReclineNormal, PriorityHigh, Close as CloseIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import BookingSteps from '../components/BookingSteps';
import flightsData from '../data/flights.json';
import mealsData from '../data/ancillary/meals.json';
import baggageRules from '../data/ancillary/baggage_rules.json';
import seatConfigurations from '../data/ancillary/seat_configurations.json';
import { useAnalytics } from '../lib/analytics/useAnalytics';
import { pushUserContext } from '../lib/analytics/dataLayer';
import SeatMap from '../components/SeatMap';

// --- Interfaces ---
interface Flight {
    id: string;
    flightNumber: string;
    airline: string;
    origin: string;
    destination: string;
    originCity: string;
    destinationCity: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    stops: any[];
    currentPrice: number;
    cabinClass?: string;
    aircraftType?: string;
}

interface Traveller {
    firstName: string;
    lastName: string;
    // other fields omitted for brevity
}

interface AncillarySelection {
    meal: string;
    baggage: number; // additional kg
    seatType: string; // 'standard', 'window', 'aisle', 'extra_legroom'
    seatPrice: number;
    seatNumber?: string;
    priorityBoarding: boolean;
    priorityBoardingPrice: number;
}

interface PassengerServices {
    [passengerIndex: number]: AncillarySelection;
}

interface FlightServices {
    onward: PassengerServices;
    return?: PassengerServices;
}

const BAGGAGE_PRICES = {
    5: 1500,
    10: 2800,
    15: 4000,
    20: 5000
};

const PRIORITY_BOARDING_PRICE = 400;

// Helper: Map API aircraft names to our config keys
const getAircraftConfigKey = (aircraftType: string = '') => {
    if (aircraftType.includes('737')) return 'B737';
    if (aircraftType.includes('A320') || aircraftType.includes('A321')) return 'A320';
    if (aircraftType.includes('777')) return 'B777';
    if (aircraftType.includes('787')) return 'B787';
    return 'B737'; // Default
};

export default function AncillaryServicesPage() {
    const router = useRouter();
    const { user, isLoading } = useUser();
    const { trackPageView } = useAnalytics();
    const pageViewTracked = useRef(false); // Prevent duplicate page views
    const {
        onwardFlightId,
        returnFlightId,
        passengers = '1',
        adults = '1',
        children = '0',
        infants = '0',
        cabinClass = 'economy',
        travellers: travellersJson,
        contactEmail,
        contactPhone,
        tripType,
        date,
        returnDate,
        travelPurpose,
        paymentType,
        originCode,
        destinationCode
    } = router.query;

    const [activeTab, setActiveTab] = useState(0);
    const [onwardFlight, setOnwardFlight] = useState<Flight | null>(null);
    const [returnFlight, setReturnFlight] = useState<Flight | null>(null);
    const [travellers, setTravellers] = useState<Traveller[]>([]);

    // State for selections
    const [selections, setSelections] = useState<FlightServices>({
        onward: {},
        return: {}
    });

    // Seat Map State (now tracks which specific map is open inline)
    const [openSeatMapId, setOpenSeatMapId] = useState<string | null>(null); // Format: "direction-pIndex"
    const [tempOccupiedSeats, setTempOccupiedSeats] = useState<string[]>([]);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'info' | 'success' | 'error' });

    // --- Initialization ---
    useEffect(() => {
        if (travellersJson) {
            try {
                setTravellers(JSON.parse(travellersJson as string));
            } catch (e) {
                console.error("Failed to parse travellers", e);
            }
        }
    }, [travellersJson]);

    useEffect(() => {
        const allFlights = (flightsData as any).flights || [];

        if (onwardFlightId) {
            const f = allFlights.find((x: any) => x.id === onwardFlightId);
            if (f) {
                const basePrice = f.price;
                const multiplier = cabinClass === 'business' ? 1.7 : cabinClass === 'first' ? 2.2 : 1;
                setOnwardFlight({ ...f, currentPrice: Math.round(basePrice * multiplier), cabinClass: cabinClass as string });
            }
        }

        if (returnFlightId) {
            const f = allFlights.find((x: any) => x.id === returnFlightId);
            if (f) {
                const basePrice = f.price;
                const multiplier = cabinClass === 'business' ? 1.7 : cabinClass === 'first' ? 2.2 : 1;
                setReturnFlight({ ...f, currentPrice: Math.round(basePrice * multiplier), cabinClass: cabinClass as string });
            }
        }
    }, [onwardFlightId, returnFlightId, cabinClass]);

    // Track page view with booking context
    useEffect(() => {
        if (onwardFlight && date && !pageViewTracked.current) {
            const formatDate = (dateStr: string) => {
                const d = new Date(dateStr);
                return d.toISOString().split('T')[0];
            };

            const adultCount = parseInt(adults as string) || 1;
            const childCount = parseInt(children as string) || 0;
            const infantCount = parseInt(infants as string) || 0;

            const generatePNR = () => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let pnr = '';
                for (let i = 0; i < 6; i++) {
                    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return pnr;
            };

            const pnr = generatePNR();
            const searchId = `search_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

            const bookingContext = {
                searchId,
                pnr,
                selectedFlights: {
                    onward: {
                        flightNumber: onwardFlight.flightNumber,
                        airline: onwardFlight.airline,
                        origin: onwardFlight.origin,
                        originCity: onwardFlight.originCity,
                        destination: onwardFlight.destination,
                        destinationCity: onwardFlight.destinationCity,
                        departureTime: onwardFlight.departureTime,
                        arrivalTime: onwardFlight.arrivalTime,
                        duration: onwardFlight.duration,
                        departureDate: formatDate(date as string),
                        cabinClass: cabinClass as string,
                        price: {
                            currency: 'INR',
                            amount: onwardFlight.currentPrice
                        }
                    },
                    ...(returnFlight && returnDate ? {
                        return: {
                            flightNumber: returnFlight.flightNumber,
                            airline: returnFlight.airline,
                            origin: returnFlight.origin,
                            originCity: returnFlight.originCity,
                            destination: returnFlight.destination,
                            destinationCity: returnFlight.destinationCity,
                            departureTime: returnFlight.departureTime,
                            arrivalTime: returnFlight.arrivalTime,
                            duration: returnFlight.duration,
                            departureDate: formatDate(returnDate as string),
                            cabinClass: cabinClass as string,
                            price: {
                                currency: 'INR',
                                amount: returnFlight.currentPrice
                            }
                        }
                    } : {})
                },
                totalPrice: (onwardFlight?.currentPrice || 0) + (returnFlight?.currentPrice || 0),
                tripType: tripType as string,
                passengers: {
                    total: adultCount + childCount + infantCount,
                    breakdown: {
                        adults: adultCount,
                        children: childCount,
                        infants: infantCount
                    }
                },
                cabinClass: cabinClass as string,
                travelPurpose: travelPurpose as string,
                paymentType: paymentType as string,
                ancillaryServices: {
                    meals: [],
                    baggage: [],
                    seats: [],
                    priorityBoarding: []
                }
            };

            // CRITICAL: Push userData BEFORE pageView to ensure it's available for Launch data elements
            if (!isLoading && user) {
                pushUserContext({
                    isAuthenticated: true,
                    userId: user.sub || null,
                    userSegment: 'registered'
                });
                console.log('✅ Independent userData pushed BEFORE pageView on ancillary-services');
            }

            trackPageView(
                {
                    pageType: 'booking',
                    pageName: 'Ancillary Services',
                    pageTitle: 'Add-ons & Services - TLP Airways',
                    pageCategory: 'booking',
                    bookingStep: 'ancillary-services',
                    bookingStepNumber: 2,
                    totalBookingSteps: 4,
                    sections: ['meals', 'baggage', 'seats', 'priorityBoarding']
                },
                { bookingContext }
            );

            // Mark as tracked
            pageViewTracked.current = true;
        }
    }, [onwardFlight, date]); // Simplified dependencies - only track when flight data is ready


    // Initialize selections for new travellers
    useEffect(() => {
        if (travellers.length > 0) {
            setSelections(prev => {
                const nextOnward: PassengerServices = { ...prev.onward };
                const nextReturn: PassengerServices = { ...(prev.return || {}) };

                const defaultSelection = {
                    meal: '',
                    baggage: 0,
                    seatType: 'standard',
                    seatPrice: 0,
                    seatNumber: '',
                    priorityBoarding: false,
                    priorityBoardingPrice: 0
                };

                travellers.forEach((_, idx) => {
                    if (!nextOnward[idx]) {
                        nextOnward[idx] = { ...defaultSelection };
                    }
                    if (returnFlightId && !nextReturn[idx]) {
                        nextReturn[idx] = { ...defaultSelection };
                    }
                });

                return { onward: nextOnward, return: returnFlightId ? nextReturn : undefined };
            });
        }
    }, [travellers, returnFlightId]);

    // Mock Occupied Seats based on context (just deterministic random for demo)
    const generateOccupiedSeats = (flightId: string) => {
        // Simple deterministic pseudo-random logic
        const occupied = [];
        const seed = flightId.charCodeAt(0) + flightId.charCodeAt(flightId.length - 1);
        const rows = 30;
        for (let r = 1; r <= rows; r++) {
            if ((r + seed) % 3 === 0) occupied.push(`${r}A`);
            if ((r * seed) % 5 === 0) occupied.push(`${r}C`);
            if ((r + seed) % 7 === 0) occupied.push(`${r}D`);
        }
        return occupied;
    };

    // --- Handlers ---
    const handleServiceChange = (
        direction: 'onward' | 'return',
        pIndex: number,
        field: keyof AncillarySelection,
        value: any
    ) => {
        setSelections(prev => {
            const currentDirSelections = prev[direction] || {};
            const currentPaxSelection = currentDirSelections[pIndex];

            let updatedSelection = { ...currentPaxSelection, [field]: value };

            // Special handling for priority boarding price
            if (field === 'priorityBoarding') {
                updatedSelection.priorityBoardingPrice = value ? PRIORITY_BOARDING_PRICE : 0;
            }

            return {
                ...prev,
                [direction]: {
                    ...currentDirSelections,
                    [pIndex]: updatedSelection
                }
            };
        });
    };

    const toggleSeatMap = (direction: 'onward' | 'return', pIndex: number) => {
        const mapId = `${direction}-${pIndex}`;

        if (openSeatMapId === mapId) {
            setOpenSeatMapId(null); // Close if already open
        } else {
            // Open new one
            const flight = direction === 'onward' ? onwardFlight : returnFlight;
            if (flight) {
                setTempOccupiedSeats(generateOccupiedSeats(flight.id));
            }
            setOpenSeatMapId(mapId);
        }
    };

    const handleSeatSelect = (seat: { number: string, type: string, price: number }, direction: 'onward' | 'return', pIndex: number) => {
        setSelections(prev => {
            const currentDirSelections = prev[direction] || {};
            const currentPaxSelection = currentDirSelections[pIndex];

            return {
                ...prev,
                [direction]: {
                    ...currentDirSelections,
                    [pIndex]: {
                        ...currentPaxSelection,
                        seatNumber: seat.number,
                        seatType: seat.type,
                        seatPrice: seat.price
                    }
                }
            };
        });

        // Don't close immediately, let them see selection
        // setOpenSeatMapId(null); 
        setSnackbar({ open: true, message: `Seat ${seat.number} selected`, severity: 'success' });
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const calculateAncillaryTotal = () => {
        let total = 0;

        const sumServices = (services: PassengerServices) => {
            Object.values(services).forEach(sel => {
                total += (BAGGAGE_PRICES[sel.baggage as keyof typeof BAGGAGE_PRICES] || 0);
                total += sel.seatPrice;
                total += sel.priorityBoardingPrice;
            });
        };

        if (selections.onward) sumServices(selections.onward);
        if (selections.return) sumServices(selections.return);

        return total;
    };

    const handleProceed = () => {
        // Construct URL for payment
        const qCopy = { ...router.query };
        qCopy['ancillary'] = JSON.stringify(selections);

        // Encode URL parameters properly
        const params = new URLSearchParams();
        Object.entries(qCopy).forEach(([key, value]) => {
            if (value !== undefined) params.append(key, value as string);
        });

        window.location.href = `/payment?${params.toString()}`;
    };

    // --- Render Helpers ---
    const renderServicesForm = (direction: 'onward' | 'return') => {
        const currentSelections = selections[direction];
        if (!currentSelections || travellers.length === 0) return null;

        const currentFlight = direction === 'onward' ? onwardFlight : returnFlight;
        const aircraftConfigKey = getAircraftConfigKey(currentFlight?.aircraftType);
        const seatConfig = (seatConfigurations.configurations as any)[aircraftConfigKey];

        return (
            <Box>
                <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f5faff', borderColor: '#cfe8fc' }}>
                    <CardContent sx={{ pb: '16px !important' }}>
                        <Grid container alignItems="center" spacing={2}>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Flight</Typography>
                                <Typography variant="h6">{currentFlight?.flightNumber}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary">Departure</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {currentFlight?.departureTime} <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.8em' }}>({currentFlight?.origin})</Box>
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary">Arrival</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {currentFlight?.arrivalTime} <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.8em' }}>({currentFlight?.destination})</Box>
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                                <Typography variant="body2">{currentFlight?.duration}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <Chip label={currentFlight?.cabinClass?.toUpperCase()} size="small" color="primary" variant="outlined" />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {travellers.map((traveller, idx) => {
                    const sel = currentSelections[idx] || {
                        meal: '',
                        baggage: 0,
                        seatType: 'standard',
                        seatPrice: 0,
                        seatNumber: '',
                        priorityBoarding: false,
                        priorityBoardingPrice: 0
                    };

                    const isSeatMapOpen = openSeatMapId === `${direction}-${idx}`;

                    return (
                        <Accordion key={idx} defaultExpanded={idx === 0}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight="bold">
                                    {traveller.firstName} {traveller.lastName}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                                    {sel.meal && <Chip size="small" icon={<Restaurant sx={{ fontSize: 16 }} />} label={sel.meal} color="primary" variant="outlined" />}
                                    {sel.baggage > 0 && <Chip size="small" icon={<Luggage sx={{ fontSize: 16 }} />} label={`+${sel.baggage}kg`} color="secondary" variant="outlined" />}
                                    {sel.seatNumber && <Chip size="small" icon={<AirlineSeatReclineNormal sx={{ fontSize: 16 }} />} label={`${sel.seatNumber}`} color="info" variant="outlined" />}
                                    {sel.priorityBoarding && <Chip size="small" icon={<PriorityHigh sx={{ fontSize: 16 }} />} label="Priority" color="warning" variant="outlined" />}
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={3}>
                                    {/* Meal Selection */}
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Meal Preference</InputLabel>
                                            <Select
                                                value={sel.meal}
                                                label="Meal Preference"
                                                onChange={(e) => handleServiceChange(direction, idx, 'meal', e.target.value)}
                                            >
                                                <MenuItem value=""><em>None</em></MenuItem>
                                                {mealsData.map((m: any) => (
                                                    <MenuItem key={m.meal_code} value={m.name}>
                                                        {m.name} {m.tags.includes('vegetarian') && '🥬'}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Baggage Selection */}
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Extra Baggage</InputLabel>
                                            <Select
                                                value={sel.baggage}
                                                label="Extra Baggage"
                                                onChange={(e) => handleServiceChange(direction, idx, 'baggage', e.target.value as number)}
                                            >
                                                <MenuItem value={0}>Standard (15kg)</MenuItem>
                                                <MenuItem value={5}>+5kg (₹1,500)</MenuItem>
                                                <MenuItem value={10}>+10kg (₹2,800)</MenuItem>
                                                <MenuItem value={15}>+15kg (₹4,000)</MenuItem>
                                                <MenuItem value={20}>+20kg (₹5,000)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Priority Boarding */}
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={sel.priorityBoarding}
                                                    onChange={(e) => handleServiceChange(direction, idx, 'priorityBoarding', e.target.checked)}
                                                    color="warning"
                                                />
                                            }
                                            label={
                                                <Typography variant="body2">
                                                    {`Priority Boarding (+₹${PRIORITY_BOARDING_PRICE})`}
                                                </Typography>
                                            }
                                            sx={{ border: '1px solid #e0e0e0', borderRadius: 1, pr: 2, m: 0, width: '100%', height: '100%' }}
                                        />
                                    </Grid>

                                    {/* Seat Selection Button */}
                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{ border: '1px solid #c4c4c4', borderRadius: 1, p: 0.5, pl: 2, pr: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">Seat</Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {sel.seatNumber ? sel.seatNumber : 'Not Selected'}
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant={isSeatMapOpen ? "contained" : "outlined"}
                                                size="small"
                                                onClick={() => toggleSeatMap(direction, idx)}
                                                startIcon={<AirlineSeatReclineNormal />}
                                            >
                                                {sel.seatNumber ? 'Change' : 'Select'}
                                            </Button>
                                        </Box>
                                    </Grid>

                                    {/* Inline Seat Map */}
                                    {isSeatMapOpen && seatConfig && (
                                        <Grid size={{ xs: 12 }}>
                                            <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#f8f9fa' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        Select Seat for {traveller.firstName}
                                                    </Typography>
                                                    <IconButton size="small" onClick={() => toggleSeatMap(direction, idx)}>
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Box>

                                                <SeatMap
                                                    config={seatConfig}
                                                    cabinClass={cabinClass as string}
                                                    selectedSeat={sel.seatNumber || null}
                                                    occupiedSeats={tempOccupiedSeats}
                                                    onSeatSelect={(seat) => handleSeatSelect(seat, direction, idx)}
                                                />
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </Box>
        );
    };

    if (!onwardFlight) {
        return <Container><Typography sx={{ mt: 4 }}>Loading services...</Typography></Container>;
    }

    const flightTotal = (onwardFlight.currentPrice || 0) * travellers.length +
        (returnFlight ? (returnFlight.currentPrice || 0) * travellers.length : 0);
    const ancillaryTotal = calculateAncillaryTotal();
    const grandTotal = flightTotal + ancillaryTotal;

    return (
        <>
            <Head>
                <title>Ancillary Services - TLAirways</title>
            </Head>

            <BookingSteps activeStep={1} />

            <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
                <Typography variant="h4" gutterBottom>
                    Add-on Services
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Customize your flight experience.
                </Typography>

                <Grid container spacing={4}>
                    {/* Main Content */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        {returnFlight && (
                            <Paper sx={{ mb: 3 }}>
                                <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                                    <Tab
                                        icon={<FlightTakeoff />}
                                        iconPosition="start"
                                        label={`${onwardFlight.originCity} → ${onwardFlight.destinationCity}`}
                                    />
                                    <Tab
                                        icon={<FlightLand />}
                                        iconPosition="start"
                                        label={`${returnFlight.originCity} → ${returnFlight.destinationCity}`}
                                    />
                                </Tabs>
                            </Paper>
                        )}

                        {/* Tab Panels */}
                        <Box role="tabpanel" hidden={activeTab !== 0}>
                            {activeTab === 0 && (
                                <Box>
                                    <Alert severity="info" sx={{ mb: 3 }}>
                                        Select services for your flight to <strong>{onwardFlight.destinationCity}</strong>
                                    </Alert>
                                    {renderServicesForm('onward')}
                                </Box>
                            )}
                        </Box>

                        {returnFlight && (
                            <Box role="tabpanel" hidden={activeTab !== 1}>
                                {activeTab === 1 && (
                                    <Box>
                                        <Alert severity="info" sx={{ mb: 3 }}>
                                            Select services for your flight to <strong>{returnFlight.destinationCity}</strong>
                                        </Alert>
                                        {renderServicesForm('return')}
                                    </Box>
                                )}
                            </Box>
                        )}

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleProceed}
                                sx={{ px: 5, py: 1.5 }}
                            >
                                Continue to Payment
                            </Button>
                        </Box>
                    </Grid>

                    {/* Sidebar Summary */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 180 }}>
                            <Typography variant="h6" gutterBottom>
                                Price Summary
                            </Typography>

                            {/* Flights */}
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">Flights Total</Typography>
                                    <Typography fontWeight="medium">₹{flightTotal.toLocaleString()}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* Ancillary Breakdown */}
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
                                Add-ons
                            </Typography>

                            {/* Baggage */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">Extra Baggage</Typography>
                                <Typography variant="body2">
                                    ₹{Object.values(selections.onward).concat(Object.values(selections.return || {}))
                                        .reduce((acc, curr) => acc + (BAGGAGE_PRICES[curr.baggage as keyof typeof BAGGAGE_PRICES] || 0), 0)
                                        .toLocaleString()}
                                </Typography>
                            </Box>

                            {/* Seats */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">Seat Selection</Typography>
                                <Typography variant="body2">
                                    ₹{Object.values(selections.onward).concat(Object.values(selections.return || {}))
                                        .reduce((acc, curr) => acc + curr.seatPrice, 0)
                                        .toLocaleString()}
                                </Typography>
                            </Box>

                            {/* Priority Boarding */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body2">Priority Boarding</Typography>
                                <Typography variant="body2">
                                    ₹{Object.values(selections.onward).concat(Object.values(selections.return || {}))
                                        .reduce((acc, curr) => acc + (curr.priorityBoardingPrice || 0), 0)
                                        .toLocaleString()}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

                            {/* Ancillaries Total */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="medium" color="text.primary">Ancillaries Total</Typography>
                                <Typography variant="subtitle1" fontWeight="medium" color="text.primary">
                                    ₹{ancillaryTotal.toLocaleString()}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Grand Total</Typography>
                                <Typography variant="h6" color="primary">
                                    ₹{grandTotal.toLocaleString()}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>

            </Container>
        </>
    );
}
