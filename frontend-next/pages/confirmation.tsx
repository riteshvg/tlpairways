import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Box,
    Button,
    Divider,
    Alert,
    CircularProgress,
    Stack,
    Chip
} from '@mui/material';
import Head from 'next/head';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlightIcon from '@mui/icons-material/Flight';
import { format } from 'date-fns';
import AdobeDataLayer from '../components/AdobeDataLayer';

export default function ConfirmationPage() {
    const router = useRouter();
    const [bookingData, setBookingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try to retrieve data from sessionStorage
        const storedData = sessionStorage.getItem('temp_confirmation_data');

        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);

                // Generate PNR if not exists (Persistent for this session)
                if (!parsedData.pnr) {
                    parsedData.pnr = `TL${Math.floor(Math.random() * 900000 + 100000).toString().toUpperCase()}`;

                    // Generate Ticket Numbers for each traveller
                    if (parsedData.travellers) {
                        parsedData.travellers = parsedData.travellers.map((t: any) => ({
                            ...t,
                            ticketNumber: t.ticketNumber || `176${Math.floor(Math.random() * 9000000000 + 1000000000)}`
                        }));
                    }

                    // Save back to storage so it doesn't change on refresh
                    sessionStorage.setItem('temp_confirmation_data', JSON.stringify(parsedData));
                }

                setBookingData(parsedData);
            } catch (e) {
                console.error("Failed to parse booking data", e);
            }
        }
        setLoading(false);
    }, []);

    // Track Purchase Event
    useEffect(() => {
        if (bookingData && window.adobeDataLayer) {
            window.adobeDataLayer.push({
                event: 'purchase',
                ecommerce: {
                    purchase: {
                        actionField: {
                            id: bookingData.paymentData?.transactionId || 'TXN_UNKNOWN',
                            affiliation: 'Online Store',
                            revenue: bookingData.paymentData?.amount || 0,
                            tax: 0,
                            shipping: 0,
                            coupon: ''
                        },
                        products: [
                            {
                                name: `${bookingData.onwardFlight.origin} to ${bookingData.onwardFlight.destination}`,
                                id: bookingData.onwardFlight.id,
                                price: bookingData.onwardFlight.currentPrice,
                                brand: 'TL Airways',
                                category: 'Flight',
                                variant: bookingData.query?.cabinClass || 'economy',
                                quantity: bookingData.travellers?.length || 1
                            }
                        ]
                    }
                }
            });
        }
    }, [bookingData]);

    const getAncillariesForPassenger = (idx: number) => {
        const services: string[] = [];
        const anc = bookingData?.ancillaryServices || {};

        ['onward', 'return'].forEach(type => {
            if (!anc[type]) return;

            // Access selections for this specific passenger index
            const paxSelection = anc[type][idx];
            if (!paxSelection) return;

            const prefix = type === 'onward' ? 'Onward' : 'Return';

            // Meal
            if (paxSelection.meal) {
                services.push(`${prefix} Meal: ${paxSelection.meal}`);
            }
            // Baggage
            if (paxSelection.baggage && paxSelection.baggage > 0) {
                services.push(`${prefix} Baggage: +${paxSelection.baggage}kg`);
            }
            // Seat
            if (paxSelection.seatNumber) {
                services.push(`${prefix} Seat: ${paxSelection.seatNumber} (${paxSelection.seatType.replace('_', ' ')})`);
            } else if (paxSelection.seatType && paxSelection.seatType !== 'standard') {
                services.push(`${prefix} Seat: ${paxSelection.seatType.replace('_', ' ')}`);
            }
            // Priority Boarding
            if (paxSelection.priorityBoarding) {
                services.push(`${prefix} Priority Boarding`);
            }
        });
        return services;
    };

    if (loading) {
        return <Container><Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box></Container>;
    }

    if (!bookingData) {
        return (
            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Alert severity="error">
                    Booking details not found. Please start a new search.
                </Alert>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push('/')}>
                    Go Home
                </Button>
            </Container>
        );
    }

    const { onwardFlight, returnFlight, travellers, paymentData, pnr } = bookingData;

    return (
        <>
            <Head>
                <title>Booking Confirmed - TLAirways</title>
            </Head>

            <AdobeDataLayer pageData={{
                pageType: 'confirmation',
                pageName: 'Booking Confirmation',
                pageSection: 'booking',
                pageSubSection: 'confirmation'
            }} />

            <Container maxWidth="md" sx={{ mt: 6, mb: 10 }}>
                {/* Success Banner */}
                <Paper sx={{ p: 4, textAlign: 'center', mb: 4, bgcolor: '#e8f5e9' }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                    <Typography variant="h4" gutterBottom color="success.main" fontWeight="bold">
                        Booking Confirmed!
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Your booking reference number is <strong>{pnr}</strong>
                    </Typography>
                    <Typography color="text.secondary">
                        A confirmation email has been sent to <strong>{bookingData.query?.contactEmail || travellers[0]?.email}</strong>
                    </Typography>
                </Paper>

                <Grid container spacing={4}>
                    {/* Flight Details */}
                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                                <FlightIcon sx={{ mr: 1 }} /> Flight Details
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 3 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Onward Journey</Typography>
                                        <Typography fontWeight="bold">{format(new Date(bookingData.query?.date), 'dd MMM yyyy')}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Box>
                                                <Typography variant="h5">{onwardFlight.origin}</Typography>
                                                <Typography variant="caption">{onwardFlight.originCity}</Typography>
                                            </Box>
                                            <Box sx={{ flexGrow: 1, borderBottom: '1px dashed grey', textAlign: 'center' }}>
                                                <FlightIcon sx={{ transform: 'rotate(90deg)', fontSize: 16 }} />
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h5">{onwardFlight.destination}</Typography>
                                                <Typography variant="caption">{onwardFlight.destinationCity}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: 'right' }}>
                                        <Typography variant="subtitle2" color="text.secondary">Flight</Typography>
                                        <Typography variant="body1">{onwardFlight.airline} {onwardFlight.flightNumber}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            {returnFlight && (
                                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #eee' }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={{ xs: 12, sm: 3 }}>
                                            <Typography variant="subtitle2" color="text.secondary">Return Journey</Typography>
                                            <Typography fontWeight="bold">{format(new Date(bookingData.query?.returnDate), 'dd MMM yyyy')}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Box>
                                                    <Typography variant="h5">{returnFlight.origin}</Typography>
                                                    <Typography variant="caption">{returnFlight.originCity}</Typography>
                                                </Box>
                                                <Box sx={{ flexGrow: 1, borderBottom: '1px dashed grey', textAlign: 'center' }}>
                                                    <FlightIcon sx={{ transform: 'rotate(90deg)', fontSize: 16 }} />
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="h5">{returnFlight.destination}</Typography>
                                                    <Typography variant="caption">{returnFlight.destinationCity}</Typography>
                                                </Box>
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: 'right' }}>
                                            <Typography variant="subtitle2" color="text.secondary">Flight</Typography>
                                            <Typography variant="body1">{returnFlight.airline} {returnFlight.flightNumber}</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Passenger & Payment Details */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Passengers</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                {travellers.map((p: any, i: number) => (
                                    <Box key={i} sx={{ border: '1px solid #eee', borderRadius: 1, p: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Box>
                                                <Typography fontWeight="bold">{p.firstName} {p.lastName}</Typography>
                                                <Typography variant="caption" color="text.secondary">{p.gender}, {p.nationality}</Typography>
                                            </Box>
                                            <Chip label="Confirmed" color="success" size="small" variant="outlined" />
                                        </Box>

                                        <Box sx={{ mb: 1 }}>
                                            <Typography variant="caption" color="text.secondary">Ticket Number</Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{p.ticketNumber}</Typography>
                                        </Box>

                                        {/* Ancillary Services Summary */}
                                        {getAncillariesForPassenger(i).length > 0 && (
                                            <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #eee' }}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">Add-ons:</Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                                    {getAncillariesForPassenger(i).map((service, sIdx) => (
                                                        <Chip key={sIdx} label={service} size="small" sx={{ fontSize: '0.7rem' }} />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 5 }}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Payment Summary</Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                                <Typography variant="body2">{paymentData.transactionId}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                    {paymentData.method} {paymentData.vendor ? `(${paymentData.vendor})` : ''}
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">Amount Paid</Typography>
                                <Typography variant="h5" color="primary">₹{paymentData.amount.toLocaleString()}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 6, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => router.push('/')}
                        sx={{ px: 4 }}
                    >
                        Book Another Flight
                    </Button>
                </Box>
            </Container>
        </>
    );
}
