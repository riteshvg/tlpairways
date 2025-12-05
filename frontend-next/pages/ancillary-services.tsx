import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
    Stack
} from '@mui/material';
import Head from 'next/head';
import { ExpandMore as ExpandMoreIcon, FlightTakeoff, FlightLand, Restaurant, Luggage, AirlineSeatReclineNormal } from '@mui/icons-material';
import { format } from 'date-fns';
import BookingSteps from '../components/BookingSteps';
import flightsData from '../data/flights.json';
import mealsData from '../data/ancillary/meals.json';
import baggageRules from '../data/ancillary/baggage_rules.json';
import AdobeDataLayer from '../components/AdobeDataLayer';

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
}

interface PassengerServices {
    [passengerIndex: number]: AncillarySelection;
}

interface FlightServices {
    onward: PassengerServices;
    return?: PassengerServices;
}

const SEAT_PRICES: Record<string, number> = {
    standard: 0,
    window: 250,
    aisle: 250,
    extra_legroom: 800
};

const BAGGAGE_PRICES = {
    5: 1500,
    10: 2800,
    15: 4000,
    20: 5000
};

export default function AncillaryServicesPage() {
    const router = useRouter();
    const {
        onwardFlightId,
        returnFlightId,
        passengers = '1',
        cabinClass = 'economy',
        travellers: travellersJson,
        contactEmail,
        contactPhone,
        tripType
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
                // simple price logic again for display
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

    // Initialize selections for new travellers
    useEffect(() => {
        if (travellers.length > 0) {
            setSelections(prev => {
                const nextOnward: PassengerServices = { ...prev.onward };
                const nextReturn: PassengerServices = { ...(prev.return || {}) };

                travellers.forEach((_, idx) => {
                    if (!nextOnward[idx]) {
                        nextOnward[idx] = { meal: '', baggage: 0, seatType: 'standard', seatPrice: 0 };
                    }
                    if (returnFlightId && !nextReturn[idx]) {
                        nextReturn[idx] = { meal: '', baggage: 0, seatType: 'standard', seatPrice: 0 };
                    }
                });

                return { onward: nextOnward, return: returnFlightId ? nextReturn : undefined };
            });
        }
    }, [travellers, returnFlightId]);

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

            // Special handling for seat price
            if (field === 'seatType') {
                updatedSelection.seatPrice = SEAT_PRICES[value as string] || 0;
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

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const calculateAncillaryTotal = () => {
        let total = 0;

        // Onward
        Object.values(selections.onward).forEach(sel => {
            total += (BAGGAGE_PRICES[sel.baggage as keyof typeof BAGGAGE_PRICES] || 0);
            total += sel.seatPrice;
            // Meals are free in this demo, but could start charging
        });

        // Return
        if (selections.return) {
            Object.values(selections.return).forEach(sel => {
                total += (BAGGAGE_PRICES[sel.baggage as keyof typeof BAGGAGE_PRICES] || 0);
                total += sel.seatPrice;
            });
        }

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

        return (
            <Box>
                {travellers.map((traveller, idx) => {
                    const sel = currentSelections[idx] || { meal: '', baggage: 0, seatType: 'standard', seatPrice: 0 };

                    return (
                        <Accordion key={idx} defaultExpanded={idx === 0}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight="bold">
                                    {traveller.firstName} {traveller.lastName}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                                    {sel.meal && <Chip size="small" icon={<Restaurant sx={{ fontSize: 16 }} />} label={sel.meal} color="primary" variant="outlined" />}
                                    {sel.baggage > 0 && <Chip size="small" icon={<Luggage sx={{ fontSize: 16 }} />} label={`+${sel.baggage}kg`} color="secondary" variant="outlined" />}
                                    {sel.seatType !== 'standard' && <Chip size="small" icon={<AirlineSeatReclineNormal sx={{ fontSize: 16 }} />} label={sel.seatType.replace('_', ' ')} color="info" variant="outlined" />}
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={3}>
                                    {/* Meal Selection */}
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <FormControl fullWidth>
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
                                        <FormControl fullWidth>
                                            <InputLabel>Extra Baggage</InputLabel>
                                            <Select
                                                value={sel.baggage}
                                                label="Extra Baggage"
                                                onChange={(e) => handleServiceChange(direction, idx, 'baggage', e.target.value as number)}
                                            >
                                                <MenuItem value={0}>Standard Allowance (15kg)</MenuItem>
                                                <MenuItem value={5}>+5kg (₹1,500)</MenuItem>
                                                <MenuItem value={10}>+10kg (₹2,800)</MenuItem>
                                                <MenuItem value={15}>+15kg (₹4,000)</MenuItem>
                                                <MenuItem value={20}>+20kg (₹5,000)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Seat Selection */}
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Seat Preference</InputLabel>
                                            <Select
                                                value={sel.seatType}
                                                label="Seat Preference"
                                                onChange={(e) => handleServiceChange(direction, idx, 'seatType', e.target.value)}
                                            >
                                                <MenuItem value="standard">Standard (Free)</MenuItem>
                                                <MenuItem value="window">Window (₹250)</MenuItem>
                                                <MenuItem value="aisle">Aisle (₹250)</MenuItem>
                                                <MenuItem value="extra_legroom">Extra Legroom (₹800)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
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

            <AdobeDataLayer pageData={{
                pageType: 'booking',
                pageName: 'Ancillary Services',
                pageSection: 'booking',
                pageSubSection: 'ancillary'
            }} />

            <BookingSteps activeStep={1} />

            <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
                <Typography variant="h4" gutterBottom>
                    Add-on Services
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Enhance your journey with meals, extra baggage, and seat selection.
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body2">Seat Selection</Typography>
                                <Typography variant="body2">
                                    ₹{Object.values(selections.onward).concat(Object.values(selections.return || {}))
                                        .reduce((acc, curr) => acc + curr.seatPrice, 0)
                                        .toLocaleString()}
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
            </Container>
        </>
    );
}
