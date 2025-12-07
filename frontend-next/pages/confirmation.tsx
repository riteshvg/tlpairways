import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
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
    Chip,
    Card,
    CardContent
} from '@mui/material';
import Head from 'next/head';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlightIcon from '@mui/icons-material/Flight';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LuggageIcon from '@mui/icons-material/Luggage';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { format } from 'date-fns';
import { useAnalytics } from '../lib/analytics/useAnalytics';
import { hashSensitiveData } from '../lib/analytics/dataLayer';

export default function ConfirmationPage() {
    const router = useRouter();
    const { user } = useUser();
    const { trackPurchase, trackPageView } = useAnalytics();
    const pageViewTracked = useRef(false); // Prevent duplicate page views
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
                    parsedData.pnr = `TL${Math.floor(Math.random() * 900000 + 100000).toString().toUpperCase()} `;

                    // Generate Ticket Numbers for each traveller
                    if (parsedData.travellers) {
                        parsedData.travellers = parsedData.travellers.map((t: any) => ({
                            ...t,
                            ticketNumber: t.ticketNumber || `176${Math.floor(Math.random() * 9000000000 + 1000000000)} `
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

    // Track both purchase and page view events together
    useEffect(() => {
        if (!bookingData || pageViewTracked.current) return;

        const trackConfirmationEvents = async () => {
            const { buildPurchaseProducts } = await import('../lib/analytics/buildPurchaseProducts');

            const transactionId = bookingData.paymentData?.transactionId || `TXN${Date.now()}${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
            const pnr = bookingData.pnr || `${Math.floor(Math.random() * 90) + 10}ST${Math.floor(Math.random() * 90) + 10}`;
            const ticketNumber = `176${Math.floor(Math.random() * 9000000000 + 1000000000)}`;

            // Build products array
            const products = buildPurchaseProducts(
                bookingData.onwardFlight,
                bookingData.returnFlight,
                bookingData.ancillaryServices || { onward: {}, return: {} },
                bookingData.travellers || [],
                bookingData.query || {}
            );

            // Calculate totals
            const numPassengers = bookingData.travellers?.length || 1;
            const flightTotal = ((bookingData.onwardFlight?.currentPrice || 0) * numPassengers) +
                ((bookingData.returnFlight?.currentPrice || 0) * numPassengers);

            const ancillaryTotal = products
                .filter(p => p.category === 'ancillary')
                .reduce((sum, p) => sum + (p.price * p.quantity), 0);

            const baseFare = flightTotal;
            const taxes = Math.round(baseFare * 0.05);
            const convenienceFee = Math.round(baseFare * 0.02);
            const surcharge = Math.round(baseFare * 0.01);
            const totalAmount = baseFare + ancillaryTotal + taxes + convenienceFee + surcharge;

            // Hash customer data
            const contactEmail = bookingData.query?.contactEmail || bookingData.travellers?.[0]?.email || '';
            const contactPhone = bookingData.query?.contactPhone || bookingData.travellers?.[0]?.phone || '';

            // 1. First, track the pageView event
            trackPageView(
                {
                    pageType: 'confirmation',
                    pageName: 'Booking Confirmation',
                    pageTitle: 'Booking Confirmed - TLP Airways',
                    pageCategory: 'booking',
                    bookingStep: 'confirmation',
                    bookingStepNumber: 5,
                    totalBookingSteps: 5,
                    sections: ['bookingDetails', 'flightInfo', 'passengerInfo', 'paymentSummary'],
                    user: user
                },
                {
                    bookingContext: {
                        pnr: bookingData.pnr,
                        bookingStatus: 'confirmed',
                        selectedFlights: {
                            onward: bookingData.onwardFlight ? {
                                flightNumber: bookingData.onwardFlight.flightNumber,
                                origin: bookingData.onwardFlight.origin,
                                originCity: bookingData.onwardFlight.originCity,
                                destination: bookingData.onwardFlight.destination,
                                destinationCity: bookingData.onwardFlight.destinationCity,
                                departureTime: bookingData.onwardFlight.departureTime,
                                price: bookingData.onwardFlight.currentPrice,
                                cabinClass: bookingData.onwardFlight.cabinClass
                            } : null,
                            ...(bookingData.returnFlight ? {
                                return: {
                                    flightNumber: bookingData.returnFlight.flightNumber,
                                    origin: bookingData.returnFlight.origin,
                                    originCity: bookingData.returnFlight.originCity,
                                    destination: bookingData.returnFlight.destination,
                                    destinationCity: bookingData.returnFlight.destinationCity,
                                    departureTime: bookingData.returnFlight.departureTime,
                                    price: bookingData.returnFlight.currentPrice,
                                    cabinClass: bookingData.returnFlight.cabinClass
                                }
                            } : {})
                        },
                        totalPrice: flightTotal,
                        tripType: bookingData.query?.tripType || (bookingData.returnFlight ? 'roundtrip' : 'oneway'),
                        passengers: {
                            total: numPassengers,
                            breakdown: {
                                adults: parseInt(bookingData.query?.adults || numPassengers),
                                children: parseInt(bookingData.query?.children || 0),
                                infants: parseInt(bookingData.query?.infants || 0)
                            }
                        },
                        cabinClass: bookingData.query?.cabinClass || 'economy'
                    },
                    searchContext: {
                        searchId: `search_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
                        origin: bookingData.onwardFlight?.origin || null,
                        destination: bookingData.onwardFlight?.destination || null,
                        originDestination: bookingData.onwardFlight ? `${bookingData.onwardFlight.origin}-${bookingData.onwardFlight.destination}` : null,
                        originCity: bookingData.onwardFlight?.originCity || null,
                        destinationCity: bookingData.onwardFlight?.destinationCity || null,
                        departureDate: bookingData.query?.date ? new Date(bookingData.query.date).toISOString().split('T')[0] : null,
                        returnDate: bookingData.query?.returnDate ? new Date(bookingData.query.returnDate).toISOString().split('T')[0] : null,
                        travelDay: bookingData.query?.date ? new Date(bookingData.query.date).toLocaleDateString('en-US', { weekday: 'long' }) : null,
                        numberOfDays: bookingData.query?.returnDate && bookingData.query?.date ?
                            Math.ceil((new Date(bookingData.query.returnDate).getTime() - new Date(bookingData.query.date).getTime()) / (1000 * 60 * 60 * 24)) : null,
                        passengers: {
                            total: numPassengers,
                            breakdown: {
                                adults: {
                                    count: parseInt(bookingData.query?.adults || numPassengers),
                                    type: 'adult',
                                    description: '12+ years'
                                },
                                children: {
                                    count: parseInt(bookingData.query?.children || 0),
                                    type: 'child',
                                    description: '2-11 years'
                                },
                                infants: {
                                    count: parseInt(bookingData.query?.infants || 0),
                                    type: 'infant',
                                    description: 'Under 2 years'
                                }
                            },
                            summary: `adult: ${numPassengers}`
                        },
                        cabinClass: bookingData.query?.cabinClass || 'economy',
                        tripType: bookingData.query?.tripType || 'oneway',
                        travelPurpose: bookingData.query?.travelPurpose || 'personal',
                        searchDateTime: new Date().toISOString().split('T')[0],
                        searchCriteria: {
                            originAirport: bookingData.onwardFlight?.origin || null,
                            originAirportName: bookingData.onwardFlight?.originCity || null,
                            originCity: bookingData.onwardFlight?.originCity || null,
                            originCountry: null,
                            destinationAirport: bookingData.onwardFlight?.destination || null,
                            destinationAirportName: bookingData.onwardFlight?.destinationCity || null,
                            destinationCity: bookingData.onwardFlight?.destinationCity || null,
                            destinationCountry: null,
                            departureDate: bookingData.query?.date ? new Date(bookingData.query.date).toISOString().split('T')[0] : null,
                            returnDate: bookingData.query?.returnDate ? new Date(bookingData.query.returnDate).toISOString().split('T')[0] : null,
                            tripType: bookingData.query?.tripType || 'oneway',
                            passengers: {
                                adults: parseInt(bookingData.query?.adults || numPassengers),
                                children: parseInt(bookingData.query?.children || 0),
                                infants: parseInt(bookingData.query?.infants || 0),
                                total: numPassengers
                            },
                            cabinClass: bookingData.query?.cabinClass || 'economy',
                            travelPurpose: bookingData.query?.travelPurpose || 'personal',
                            searchDateTime: new Date().toISOString().split('T')[0],
                            flexibleDates: false,
                            directFlightsOnly: false
                        },
                        distanceKm: 268, // Default, should be calculated
                        specialDays: {
                            onward: { is_special: false, special_day: null, special_type: null, country: null },
                            return: { is_special: false, special_day: null, special_type: null, country: null },
                            hasSpecialDays: false
                        },
                        revenueData: {
                            potential_revenue: totalAmount,
                            avg_revenue_per_user: Math.round(totalAmount / numPassengers),
                            booking_probability_score: 1,
                            estimated_conversion_value: totalAmount,
                            revenue_bucket: totalAmount > 50000 ? 'high_value' : totalAmount > 20000 ? 'medium_value' : 'low_value',
                            currency: { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
                        },
                        geography: {
                            userLocation: {
                                country: 'India',
                                state: 'Unknown',
                                city: 'Unknown',
                                timezone: 'Asia/Calcutta',
                                ipCountry: 'India',
                                currency: 'INR',
                                language: 'en-US'
                            }
                        },
                        searchPerformance: {
                            searchDurationMs: 0,
                            resultsLoadedAt: new Date().toISOString(),
                            searchAbandoned: false
                        }
                    }
                }
            );

            // 2. Then, push the purchase event directly to data layer
            const purchaseEvent = {
                event: 'purchase',
                eventData: {
                    revenue: {
                        transactionId,
                        totalRevenue: totalAmount,
                        currency: 'INR',
                        products,
                        bookingReference: pnr,
                        paymentMethod: bookingData.paymentData?.paymentType || 'netbanking',
                        paymentMode: bookingData.query?.paymentType || 'cash',
                        paymentStatus: 'completed',
                        timestamp: new Date().toISOString()
                    },
                    paymentDetails: {
                        paymentType: bookingData.paymentData?.paymentType || 'netbanking',
                        paymentMode: bookingData.query?.paymentType || 'cash',
                        paymentCurrency: 'INR',
                        paymentCategories: {
                            baseFare,
                            ancillaryFare: ancillaryTotal,
                            taxes,
                            convenienceFee,
                            surcharge,
                            totalFees: taxes + convenienceFee + surcharge,
                            totalAmount
                        },
                        pnr,
                        ticketNumber,
                        bookingId: transactionId,
                        passengers: numPassengers,
                        tripType: bookingData.query?.tripType || 'oneway'
                    },
                    customer: {
                        userId: contactEmail,
                        email: contactEmail,
                        phone: contactPhone,
                        loyaltyTier: 'standard'
                    },
                    booking: {
                        tripType: bookingData.query?.tripType || 'oneway',
                        cabinClass: bookingData.query?.cabinClass || 'economy',
                        passengers: numPassengers,
                        departureDate: bookingData.query?.date ? new Date(bookingData.query.date).toISOString().split('T')[0] : null,
                        returnDate: bookingData.query?.returnDate ? new Date(bookingData.query.returnDate).toISOString().split('T')[0] : null,
                        haulType: {
                            onward: 'short haul',
                            overall: 'short haul'
                        }
                    },
                    sustainabilityImpact: {
                        carbonFootprint: Math.round(268 * 0.254),
                        distance: 268,
                        treesPlanted: Math.floor(totalAmount / 10000),
                        carbonOffset: Math.round(268 * 0.254),
                        sustainabilityContribution: 100,
                        impactType: 'carbonFootprint',
                        contributionType: 'treesPlanted',
                        timestamp: new Date().toISOString()
                    }
                },
                timestamp: new Date().toISOString()
            };

            // Push purchase event to data layer
            if (typeof window !== 'undefined' && (window as any).adobeDataLayer) {
                (window as any).adobeDataLayer.push(purchaseEvent);
                console.log('✅ Purchase event tracked:', purchaseEvent);
            }

            // Mark as tracked
            pageViewTracked.current = true;
        };

        trackConfirmationEvents();
    }, [bookingData, user, trackPageView]);

    const getAncillariesForPassenger = (idx: number) => {
        const services: any[] = [];
        const anc = bookingData?.ancillaryServices || {};

        ['onward', 'return'].forEach(type => {
            if (!anc[type]) return;

            const paxSelection = anc[type][idx];
            if (!paxSelection) return;

            const prefix = type === 'onward' ? 'Onward' : 'Return';

            // Meal
            if (paxSelection.meal) {
                services.push({
                    type: 'meal',
                    icon: RestaurantIcon,
                    label: paxSelection.meal,
                    direction: prefix,
                    color: 'primary'
                });
            }
            // Baggage
            if (paxSelection.baggage && paxSelection.baggage > 0) {
                services.push({
                    type: 'baggage',
                    icon: LuggageIcon,
                    label: `+ ${paxSelection.baggage} kg`,
                    direction: prefix,
                    color: 'secondary'
                });
            }
            // Seat
            if (paxSelection.seatNumber) {
                services.push({
                    type: 'seat',
                    icon: AirlineSeatReclineNormalIcon,
                    label: paxSelection.seatNumber,
                    direction: prefix,
                    color: 'info'
                });
            }
            // Priority Boarding
            if (paxSelection.priorityBoarding) {
                services.push({
                    type: 'priority',
                    icon: PriorityHighIcon,
                    label: 'Priority Boarding',
                    direction: prefix,
                    color: 'warning'
                });
            }
        });
        return services;
    };

    const calculatePriceBreakdown = () => {
        const BAGGAGE_PRICES = { 5: 1500, 10: 2800, 15: 4000, 20: 5000 };
        const breakdown = {
            flightTotal: 0,
            baggageTotal: 0,
            seatTotal: 0,
            priorityBoardingTotal: 0,
            ancillaryTotal: 0,
            taxesAndFees: 0,
            grandTotal: 0
        };

        const numPassengers = travellers?.length || 1;
        breakdown.flightTotal = ((onwardFlight?.currentPrice || 0) * numPassengers) +
            ((returnFlight?.currentPrice || 0) * numPassengers);

        const anc = bookingData?.ancillaryServices || {};
        ['onward', 'return'].forEach(direction => {
            const services = anc[direction];
            if (!services) return;

            Object.values(services).forEach((sel: any) => {
                if (sel.baggage) {
                    breakdown.baggageTotal += (BAGGAGE_PRICES[sel.baggage as keyof typeof BAGGAGE_PRICES] || 0);
                }
                if (sel.seatPrice) {
                    breakdown.seatTotal += sel.seatPrice;
                }
                if (sel.priorityBoardingPrice) {
                    breakdown.priorityBoardingTotal += sel.priorityBoardingPrice;
                }
            });
        });

        breakdown.ancillaryTotal = breakdown.baggageTotal + breakdown.seatTotal + breakdown.priorityBoardingTotal;
        breakdown.taxesAndFees = Math.round((breakdown.flightTotal + breakdown.ancillaryTotal) * 0.05); // 5% taxes
        breakdown.grandTotal = breakdown.flightTotal + breakdown.ancillaryTotal + breakdown.taxesAndFees;

        return breakdown;
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

                                        {/* Ancillary Services Summary - Visual */}
                                        {getAncillariesForPassenger(i).length > 0 && (
                                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #eee' }}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Add-ons:</Typography>
                                                <Grid container spacing={1}>
                                                    {getAncillariesForPassenger(i).map((service, sIdx) => {
                                                        const IconComponent = service.icon;
                                                        return (
                                                            <Grid key={sIdx} size={{ xs: 6, sm: 6 }}>
                                                                <Card variant="outlined" sx={{ height: '100%' }}>
                                                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                                            <IconComponent color={service.color} sx={{ fontSize: 20 }} />
                                                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                                                                                    {service.direction}
                                                                                </Typography>
                                                                                <Typography variant="body2" fontWeight="medium" sx={{ lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                    {service.label}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Stack>
                                                                    </CardContent>
                                                                </Card>
                                                            </Grid>
                                                        );
                                                    })}
                                                </Grid>
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
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{paymentData.transactionId}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                    {paymentData.method} {paymentData.vendor ? `(${paymentData.vendor})` : ''}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Price Breakdown */}
                            <Stack spacing={1} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Flight Total</Typography>
                                    <Typography variant="body2" fontWeight="medium">₹{calculatePriceBreakdown().flightTotal.toLocaleString()}</Typography>
                                </Box>

                                {calculatePriceBreakdown().baggageTotal > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Extra Baggage</Typography>
                                        <Typography variant="body2">₹{calculatePriceBreakdown().baggageTotal.toLocaleString()}</Typography>
                                    </Box>
                                )}

                                {calculatePriceBreakdown().seatTotal > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Seat Selection</Typography>
                                        <Typography variant="body2">₹{calculatePriceBreakdown().seatTotal.toLocaleString()}</Typography>
                                    </Box>
                                )}

                                {calculatePriceBreakdown().priorityBoardingTotal > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Priority Boarding</Typography>
                                        <Typography variant="body2">₹{calculatePriceBreakdown().priorityBoardingTotal.toLocaleString()}</Typography>
                                    </Box>
                                )}

                                {calculatePriceBreakdown().ancillaryTotal > 0 && (
                                    <>
                                        <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" fontWeight="medium">Ancillaries Total</Typography>
                                            <Typography variant="body2" fontWeight="medium">₹{calculatePriceBreakdown().ancillaryTotal.toLocaleString()}</Typography>
                                        </Box>
                                    </>
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Taxes & Fees</Typography>
                                    <Typography variant="body2">₹{calculatePriceBreakdown().taxesAndFees.toLocaleString()}</Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">Amount Paid</Typography>
                                <Typography variant="h5" color="success.main" fontWeight="bold">₹{paymentData.amount.toLocaleString()}</Typography>
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
