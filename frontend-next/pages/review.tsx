import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAnalytics } from '../lib/analytics/useAnalytics';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Box,
    Button,
    Divider,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Stack,
    Chip
} from '@mui/material';
import Head from 'next/head';
import { format } from 'date-fns';
import flightsData from '../data/flights.json';
import BookingSteps from '../components/BookingSteps';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PersonIcon from '@mui/icons-material/Person';
import LuggageIcon from '@mui/icons-material/Luggage';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ChairIcon from '@mui/icons-material/EventSeat';
import PaymentIcon from '@mui/icons-material/Payment';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';

const CURRENCY_CONFIG = {
    formatPrice: (amount: number, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    }
};

export default function ReviewPage() {
    const router = useRouter();
    const query = router.query;
    const { user } = useUser();
    const { trackPageView } = useAnalytics();

    const [loading, setLoading] = useState(false);
    const [onwardFlight, setOnwardFlight] = useState<any>(null);
    const [returnFlight, setReturnFlight] = useState<any>(null);
    const [travellers, setTravellers] = useState<any[]>([]);
    const [ancillaryServices, setAncillaryServices] = useState<any>({ onward: {}, return: {} });
    const [paymentDetails, setPaymentDetails] = useState<any>(null);

    useEffect(() => {
        if (!router.isReady) return;

        const {
            onwardFlightId,
            returnFlightId,
            ancillary,
            travellers: travellersJson,
            cabinClass = 'economy'
        } = query;

        // Parse Travellers
        if (travellersJson) {
            try {
                setTravellers(JSON.parse(travellersJson as string));
            } catch (e) {
                console.error("Failed to parse travellers", e);
            }
        }

        // Parse Ancillary
        if (ancillary) {
            try {
                setAncillaryServices(JSON.parse(ancillary as string));
            } catch (e) {
                console.error("Failed to parse ancillary", e);
            }
        }

        // Load Flights
        const allFlights = (flightsData as any).flights || [];
        if (onwardFlightId) {
            const f = allFlights.find((x: any) => x.id === onwardFlightId);
            if (f) {
                const basePrice = f.price;
                const multiplier = cabinClass === 'business' ? 1.7 : cabinClass === 'first' ? 2.2 : 1;
                setOnwardFlight({ ...f, currentPrice: Math.round(basePrice * multiplier), cabinClass });
            }
        }
        if (returnFlightId) {
            const f = allFlights.find((x: any) => x.id === returnFlightId);
            if (f) {
                const basePrice = f.price;
                const multiplier = cabinClass === 'business' ? 1.7 : cabinClass === 'first' ? 2.2 : 1;
                setReturnFlight({ ...f, currentPrice: Math.round(basePrice * multiplier), cabinClass });
            }
        }

        // Load Payment Details from Session Storage
        const storedPayment = sessionStorage.getItem('tempPaymentDetails');
        if (storedPayment) {
            setPaymentDetails(JSON.parse(storedPayment));
        } else {
            // If no payment details, redirect back to payment
            // router.push({ pathname: '/payment', query });
        }

    }, [router.isReady, router.query]);

    // Track Page View
    useEffect(() => {
        if (!onwardFlight) return;
        trackPageView({
            pageName: 'Review Booking',
            pageType: 'checkout',
            pageTitle: 'Review Booking | TLP Airways',
            bookingStep: 'review',
            bookingStepNumber: 4,
            totalBookingSteps: 4,
            user
        });
    }, [onwardFlight, trackPageView, user]);

    // Helper to get ancillaries for a specific passenger (Replicated from Confirmation Page)
    const getAncillariesForPassenger = (idx: number) => {
        const services: any[] = [];
        const anc = ancillaryServices || {};

        ['onward', 'return'].forEach(type => {
            if (!anc[type]) return;

            // In review page, the structure from URL params might be slightly different than final bookingData
            // The previous logic assumed anc[type] is an object where keys are passenger indices.
            // Let's ensure we access it correctly. 
            // ancillaryServices state in review.tsx is { onward: { '0': {...} }, return: { '0': {...} } }

            const paxSelection = anc[type][idx.toString()];
            if (!paxSelection) return;

            const prefix = type === 'onward' ? 'Onward' : 'Return';

            // Meals (can be array or single object depending on selection flow)
            if (paxSelection.meals && Object.keys(paxSelection.meals).length > 0) {
                Object.values(paxSelection.meals).forEach((m: any) => {
                    services.push({
                        type: 'meal',
                        icon: RestaurantIcon,
                        label: m.name,
                        direction: prefix,
                        color: 'primary'
                    });
                });
            }

            // Baggage
            if (paxSelection.baggage && Object.keys(paxSelection.baggage).length > 0) {
                Object.values(paxSelection.baggage).forEach((b: any) => {
                    services.push({
                        type: 'baggage',
                        icon: LuggageIcon,
                        label: `+ ${b.weight} kg`,
                        direction: prefix,
                        color: 'secondary'
                    });
                });
            }

            // Seats
            if (paxSelection.seats && Object.keys(paxSelection.seats).length > 0) {
                Object.values(paxSelection.seats).forEach((s: any) => {
                    services.push({
                        type: 'seat',
                        icon: AirlineSeatReclineNormalIcon,
                        label: `Seat ${s.number}`,
                        direction: prefix,
                        color: 'info'
                    });
                });
            }
        });
        return services;
    };

    const calculateTotal = () => {
        const numPassengers = travellers.length;
        let baseFare = 0;

        // Flight Base
        if (onwardFlight) baseFare += onwardFlight.currentPrice * numPassengers;
        if (returnFlight) baseFare += returnFlight.currentPrice * numPassengers;

        // Ancillaries
        const calculateAncillaryTotal = (services: any) => {
            let sum = 0;
            if (!services) return 0;
            Object.values(services).forEach((passengerServices: any) => {
                if (passengerServices.meals) {
                    Object.values(passengerServices.meals).forEach((m: any) => sum += (m.price || 0));
                }
                if (passengerServices.baggage) {
                    Object.values(passengerServices.baggage).forEach((b: any) => sum += (b.price || 0));
                }
                if (passengerServices.seats) {
                    Object.values(passengerServices.seats).forEach((s: any) => sum += (s.price || 0));
                }
            });
            return sum;
        };

        const ancillaryCost = calculateAncillaryTotal(ancillaryServices.onward) +
            calculateAncillaryTotal(ancillaryServices.return);

        // Taxes & Fees
        const taxes = Math.round(baseFare * 0.05); // 5% Taxes
        const surcharge = Math.round(baseFare * 0.01); // 1% Surcharge
        const fees = Math.round(baseFare * 0.02); // 2% Convenience Fee

        const grandTotal = baseFare + taxes + surcharge + fees + ancillaryCost;

        return {
            baseFare,
            taxes: taxes + surcharge,
            fees,
            ancillary: ancillaryCost,
            grandTotal
        };
    };

    const handleConfirmBooking = () => {
        setLoading(true);
        // Navigate to confirmation page
        // Pass a flag to indicate confirmed
        router.push({
            pathname: '/confirmation',
            query: {
                ...query,
                bookingConfirmed: 'true'
            }
        });
    };

    const handleCancel = () => {
        router.back();
    };

    if (!onwardFlight) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
            <Head>
                <title>Review Booking | TLP Airways</title>
            </Head>

            <Container maxWidth="lg">
                <BookingSteps currentStep="review" />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        Review Your Booking
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Please review your flight selection, passenger details, and additional services carefully.
                        Once confirmed, your booking will be finalized and the payment processed.
                    </Typography>
                </Box>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Stack spacing={3}>
                            {/* Flights Summary */}
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                                    <FlightTakeoffIcon color="primary" /> Flight Details
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">Onward Journey</Typography>
                                    <Typography variant="body2">{onwardFlight.airline} • {onwardFlight.flightNumber}</Typography>
                                    <Typography variant="body1">
                                        {onwardFlight.origin} → {onwardFlight.destination}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {format(new Date(query.departureDate as string || Date.now()), 'EEE, dd MMM yyyy')} • {onwardFlight.departureTime}
                                    </Typography>
                                </Box>

                                {returnFlight && (
                                    <Box sx={{ mt: 2 }}>
                                        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                                        <Typography variant="subtitle1" fontWeight="bold">Return Journey</Typography>
                                        <Typography variant="body2">{returnFlight.airline} • {returnFlight.flightNumber}</Typography>
                                        <Typography variant="body1">
                                            {returnFlight.origin} → {returnFlight.destination}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {format(new Date(query.returnDate as string || Date.now()), 'EEE, dd MMM yyyy')} • {returnFlight.departureTime}
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>

                            {/* Consolidated Traveller & Services Tickets */}
                            <Box>
                                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                                    <PersonIcon color="primary" /> Travellers & Services
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Stack spacing={2}>
                                    {travellers.map((t, idx) => {
                                        const ancillaries = getAncillariesForPassenger(idx);

                                        return (
                                            <Paper
                                                key={idx}
                                                elevation={0}
                                                variant="outlined"
                                                sx={{
                                                    p: 0,
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    borderLeft: '4px solid',
                                                    borderColor: 'primary.main',
                                                    bgcolor: 'background.paper'
                                                }}
                                            >
                                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {t.title} {t.firstName} {t.lastName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                            {t.type}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Divider />

                                                <Box sx={{ p: 2 }}>
                                                    {ancillaries.length > 0 ? (
                                                        <Grid container spacing={1}>
                                                            {ancillaries.map((service, sIdx) => {
                                                                const IconComponent = service.icon;
                                                                return (
                                                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sIdx}>
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 1.5,
                                                                            p: 1,
                                                                            borderRadius: 1,
                                                                            border: '1px dashed #e0e0e0',
                                                                            height: '100%'
                                                                        }}>
                                                                            <IconComponent color={service.color} fontSize="small" />
                                                                            <Box>
                                                                                <Typography variant="caption" display="block" color="text.secondary" lineHeight={1}>
                                                                                    {service.direction}
                                                                                </Typography>
                                                                                <Typography variant="body2" fontWeight="medium">
                                                                                    {service.label}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                    </Grid>
                                                                );
                                                            })}
                                                        </Grid>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                            No additional services selected.
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            </Box>

                            {/* Payment Summary */}
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                                    <PaymentIcon color="primary" /> Payment Method
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                {paymentDetails ? (
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                                            {paymentDetails.method}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {paymentDetails.vendor}
                                            {paymentDetails.cardNumber && ` •••• ${paymentDetails.cardNumber.slice(-4)}`}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Billed to: {paymentDetails.billingName}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography color="error">No payment details found</Typography>
                                )}
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Price Sidebar */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 100 }}>
                            <Typography variant="h6" gutterBottom>Fare Summary</Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Base Fare</Typography>
                                    <Typography variant="body2">{CURRENCY_CONFIG.formatPrice(calculateTotal().baseFare)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Taxes & Surcharges (6%)</Typography>
                                    <Typography variant="body2">{CURRENCY_CONFIG.formatPrice(calculateTotal().taxes)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Convenience Fee (2%)</Typography>
                                    <Typography variant="body2">{CURRENCY_CONFIG.formatPrice(calculateTotal().fees)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Ancillaries</Typography>
                                    <Typography variant="body2">{CURRENCY_CONFIG.formatPrice(calculateTotal().ancillary)}</Typography>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6">Total Amount</Typography>
                                    <Typography variant="h6" color="primary">
                                        {CURRENCY_CONFIG.formatPrice(calculateTotal().grandTotal)}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleConfirmBooking}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Confirm Booking'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel Booking
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
