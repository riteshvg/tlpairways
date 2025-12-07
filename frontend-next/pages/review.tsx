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


    const calculateTotal = () => {
        let total = 0;
        const numPassengers = travellers.length;

        // Flight Base
        if (onwardFlight) total += onwardFlight.currentPrice * numPassengers;
        if (returnFlight) total += returnFlight.currentPrice * numPassengers;

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

        total += calculateAncillaryTotal(ancillaryServices.onward);
        total += calculateAncillaryTotal(ancillaryServices.return);

        return total;
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

                <Grid container spacing={3} sx={{ mt: 2 }}>
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

                            {/* Travellers Summary */}
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                                    <PersonIcon color="primary" /> Travellers ({travellers.length})
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {travellers.map((t, idx) => (
                                        <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="subtitle2">{t.title} {t.firstName} {t.lastName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">Type: {t.type}</Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>

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

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Base Fare ({travellers.length} travellers)</Typography>
                                <Typography variant="h6" color="primary">
                                    {CURRENCY_CONFIG.formatPrice(calculateTotal())}
                                </Typography>
                            </Box>

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
