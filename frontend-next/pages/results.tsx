import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Container,
    Typography,
    Paper,
    Box,
    Card,
    CardContent,
    Button,
    Grid,
    Chip,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
} from '@mui/material';
import Head from 'next/head';
import FlightIcon from '@mui/icons-material/Flight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CloseIcon from '@mui/icons-material/Close';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import LuggageIcon from '@mui/icons-material/Luggage';
import { format } from 'date-fns';
import flightsData from '../data/flights.json';
import airports from '../data/airports.json';
import { usePageView, useAnalytics } from '../lib/analytics/useAnalytics';



// Helper function to find airport by code
const findAirportByCode = (code: string) => {
    for (const cityData of airports.airports) {
        const airport = cityData.airports.find((a: any) => a.code === code);
        if (airport) {
            return {
                ...airport,
                city: cityData.city,
                country: cityData.country
            };
        }
    }
    return null;
};

interface Flight {
    id: string;
    flightNumber: string;
    origin: string;
    originCity: string;
    destination: string;
    destinationCity: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    durationMinutes: number;
    price: number;
    aircraftType: string;
    stops: any[];
    availableSeats: number;
    cabinClass: string[];
    mealOptions: string[];
    baggage: {
        checked: string;
        cabin: string;
    };
    distance: number;
    prices?: {
        economy: number;
        premium_economy: number;
        business: number;
        first: number;
    };
    currentPrice?: number;
    departureDateTime?: Date;
    arrivalDateTime?: Date;
}

interface SearchParams {
    originCode: string;
    destinationCode: string;
    date: Date;
    returnDate?: Date;
    passengers: number;
    tripType: string;
    cabinClass: string;
    paymentType?: string;
    travelPurpose?: string;
}

export default function ResultsPage() {
    const router = useRouter();
    const {
        originCode,
        destinationCode,
        date,
        returnDate,
        adults = '1',
        children = '0',
        infants = '0',
        passengers = '1',
        tripType = 'oneway',
        cabinClass = 'economy',
        paymentType,
        travelPurpose
    } = router.query;

    const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
    const [onwardFlights, setOnwardFlights] = useState<Flight[]>([]);
    const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
    const [selectedOnwardFlight, setSelectedOnwardFlight] = useState<Flight | null>(null);
    const [selectedReturnFlight, setSelectedReturnFlight] = useState<Flight | null>(null);
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReturnModal, setIsReturnModal] = useState(false);
    const [searchContext, setSearchContext] = useState<any>(null);

    const { trackSearch, trackPageView } = useAnalytics();

    // Build search context when URL params are available
    useEffect(() => {
        if (originCode && destinationCode && date) {
            const originAirport = findAirportByCode(originCode as string);
            const destAirport = findAirportByCode(destinationCode as string);

            // Format dates as YYYY-MM-DD
            const formatDate = (dateStr: string) => {
                const d = new Date(dateStr);
                return d.toISOString().split('T')[0];
            };

            // Get passenger counts from URL params
            const adultCount = parseInt(adults as string) || 1;
            const childCount = parseInt(children as string) || 0;
            const infantCount = parseInt(infants as string) || 0;

            // Calculate numberOfDays (days between booking date and travel date)
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day calculation
            const travelDate = new Date(date as string);
            travelDate.setHours(0, 0, 0, 0);
            const numberOfDays = Math.ceil((travelDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // Get travelDay (day of week for departure date)
            const travelDay = travelDate.toLocaleDateString('en-US', { weekday: 'long' });

            const context = {
                searchId: `search_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
                origin: originCode as string,
                destination: destinationCode as string,
                originDestination: `${originCode}-${destinationCode}`,
                departureDate: formatDate(date as string),
                returnDate: returnDate ? formatDate(returnDate as string) : undefined,
                numberOfDays, // Days between booking and travel
                travelDay, // Day of week for travel date
                passengers: {
                    total: adultCount + childCount + infantCount,
                    breakdown: {
                        adults: {
                            count: adultCount,
                            type: 'adult',
                            description: '12+ years'
                        },
                        children: {
                            count: childCount,
                            type: 'child',
                            description: '2-11 years'
                        },
                        infants: {
                            count: infantCount,
                            type: 'infant',
                            description: 'Under 2 years'
                        }
                    },
                    summary: `${adultCount} Adult${adultCount > 1 ? 's' : ''}${childCount > 0 ? `, ${childCount} Child${childCount > 1 ? 'ren' : ''}` : ''}${infantCount > 0 ? `, ${infantCount} Infant${infantCount > 1 ? 's' : ''}` : ''}`
                },
                tripType: tripType as string,
                cabinClass: cabinClass as string,
                travelPurpose: travelPurpose as string,
                paymentType: paymentType as string,
                immediate: true,
                originAirportName: originAirport?.name || 'Unknown Airport',
                destinationAirportName: destAirport?.name || 'Unknown Airport',
                originCity: originAirport?.city || 'Unknown',
                destinationCity: destAirport?.city || 'Unknown'
            };

            setSearchContext(context);
        }
    }, [originCode, destinationCode, date, returnDate, adults, children, infants, tripType, cabinClass, travelPurpose, paymentType]);

    // Track page view with search context once it's available
    useEffect(() => {
        if (searchContext) {
            trackPageView(
                {
                    pageType: 'searchResults',
                    pageName: 'Search Results',
                    pageCategory: 'booking',
                    searchType: 'flightResults',
                    sections: ['resultsList', 'filters', 'sorting']
                },
                { searchContext }
            );
        }
    }, [searchContext, trackPageView]);


    // Initialize search parameters from URL
    useEffect(() => {
        if (originCode && destinationCode && date) {
            const params: SearchParams = {
                originCode: originCode as string,
                destinationCode: destinationCode as string,
                date: new Date(date as string),
                returnDate: returnDate ? new Date(returnDate as string) : undefined,
                passengers: parseInt(passengers as string) || 1,
                tripType: tripType as string,
                cabinClass: cabinClass as string,
                paymentType: paymentType as string,
                travelPurpose: travelPurpose as string,
            };
            setSearchParams(params);
        }
    }, [originCode, destinationCode, date, returnDate, passengers, tripType, cabinClass, paymentType, travelPurpose]);

    // Get matching flights from data
    const getMatchingFlights = (origin: string, destination: string, searchDate: Date, cabin: string): Flight[] => {
        if (!origin || !destination || !searchDate || !cabin) return [];

        try {
            const allFlights = (flightsData as any).flights || [];

            return allFlights
                .filter((flight: any) => flight.origin === origin && flight.destination === destination)
                .map((flight: any) => {
                    // Calculate prices for different cabin classes
                    const basePrice = flight.price;
                    const prices = {
                        economy: basePrice,
                        premium_economy: Math.round(basePrice * 1.3),
                        business: Math.round(basePrice * 1.7),
                        first: Math.round(basePrice * 2.2)
                    };

                    // Create departure and arrival DateTimes
                    const departureDateTime = new Date(searchDate);
                    const [depHours, depMinutes] = flight.departureTime.split(':');
                    departureDateTime.setHours(parseInt(depHours), parseInt(depMinutes), 0, 0);

                    const arrivalDateTime = new Date(searchDate);
                    const [arrHours, arrMinutes] = flight.arrivalTime.split(':');
                    arrivalDateTime.setHours(parseInt(arrHours), parseInt(arrMinutes), 0, 0);

                    // If arrival is before departure, it's next day
                    if (arrivalDateTime < departureDateTime) {
                        arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
                    }

                    return {
                        ...flight,
                        prices,
                        currentPrice: (prices as any)[cabin] || basePrice,
                        departureDateTime,
                        arrivalDateTime,
                    };
                });
        } catch (err) {
            console.error('Error getting matching flights:', err);
            return [];
        }
    };

    // Update flights when search parameters change
    useEffect(() => {
        if (searchParams) {
            console.log('🔍 Search Parameters:', {
                origin: searchParams.originCode,
                destination: searchParams.destinationCode,
                date: searchParams.date,
                returnDate: searchParams.returnDate,
                tripType: searchParams.tripType,
                cabinClass: searchParams.cabinClass
            });

            const onward = getMatchingFlights(
                searchParams.originCode,
                searchParams.destinationCode,
                searchParams.date,
                searchParams.cabinClass
            );
            setOnwardFlights(onward);
            console.log(`✈️ Found ${onward.length} onward flights from ${searchParams.originCode} to ${searchParams.destinationCode}`);

            if (searchParams.tripType === 'roundtrip' && searchParams.returnDate) {
                const returnFlts = getMatchingFlights(
                    searchParams.destinationCode,
                    searchParams.originCode,
                    searchParams.returnDate,
                    searchParams.cabinClass
                );
                setReturnFlights(returnFlts);
                console.log(`🔙 Found ${returnFlts.length} return flights from ${searchParams.destinationCode} to ${searchParams.originCode}`);
            } else {
                setReturnFlights([]);
                console.log('ℹ️ No return flights needed (one-way trip)');
            }
        }
    }, [searchParams]);

    const handleSelectFlight = (flight: Flight, isReturn: boolean = false) => {
        if (isReturn) {
            setSelectedReturnFlight(flight);
        } else {
            setSelectedOnwardFlight(flight);
        }
    };

    const handleViewDetails = (flight: Flight, isReturn: boolean = false) => {
        setSelectedFlight(flight);
        setIsReturnModal(isReturn);
        setIsModalOpen(true);
    };

    const handleConfirmSelection = () => {
        if (selectedFlight) {
            if (isReturnModal) {
                setSelectedReturnFlight(selectedFlight);
            } else {
                setSelectedOnwardFlight(selectedFlight);
            }
        }
        setIsModalOpen(false);
        setSelectedFlight(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFlight(null);
    };

    const handleProceedToBooking = () => {
        if (!selectedOnwardFlight) {
            alert('Please select an onward flight');
            return;
        }

        if (searchParams?.tripType === 'roundtrip' && !selectedReturnFlight) {
            alert('Please select a return flight');
            return;
        }

        // Navigate to traveller details page with full page reload
        const queryParams = new URLSearchParams({
            onwardFlightId: selectedOnwardFlight.id,
            returnFlightId: selectedReturnFlight?.id || '',
            originCode: searchParams?.originCode || '',
            destinationCode: searchParams?.destinationCode || '',
            date: searchParams?.date.toISOString() || '',
            returnDate: searchParams?.returnDate?.toISOString() || '',
            passengers: searchParams?.passengers.toString() || '1',
            cabinClass: searchParams?.cabinClass || 'economy',
            tripType: searchParams?.tripType || 'oneway',
        });

        window.location.href = `/traveller-details?${queryParams.toString()}`;
    };

    const handleModifySearch = () => {
        window.location.href = '/search';
    };

    const originAirport = searchParams ? findAirportByCode(searchParams.originCode) : null;
    const destAirport = searchParams ? findAirportByCode(searchParams.destinationCode) : null;

    const renderFlightCard = (flight: Flight, isReturn: boolean = false) => {
        const isSelected = isReturn
            ? selectedReturnFlight?.id === flight.id
            : selectedOnwardFlight?.id === flight.id;

        return (
            <Card
                key={flight.id}
                sx={{
                    mb: 2,
                    border: isSelected ? '2px solid #00695c' : '1px solid #e0e0e0',
                    '&:hover': {
                        boxShadow: 3,
                        borderColor: '#00695c',
                    }
                }}
            >
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        {/* Airline & Flight Number */}
                        <Grid size={{ xs: 12, md: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                TL Airways
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {flight.flightNumber}
                            </Typography>
                        </Grid>

                        {/* Departure */}
                        <Grid size={{ xs: 4, md: 2 }}>
                            <Typography variant="h6">{flight.departureTime}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {flight.originCity}
                            </Typography>
                        </Grid>

                        {/* Duration */}
                        <Grid size={{ xs: 4, md: 2 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <AccessTimeIcon color="action" sx={{ fontSize: 20 }} />
                                <Typography variant="body2">{flight.duration}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {flight.stops.length === 0 ? 'Non-stop' : `${flight.stops.length} stop(s)`}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Arrival */}
                        <Grid size={{ xs: 4, md: 2 }}>
                            <Typography variant="h6">{flight.arrivalTime}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {flight.destinationCity}
                            </Typography>
                        </Grid>

                        {/* Price */}
                        <Grid size={{ xs: 6, md: 2 }}>
                            <Box sx={{ textAlign: { md: 'right' } }}>
                                <Typography variant="h5" color="primary" fontWeight="bold">
                                    ₹{flight.currentPrice?.toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    per person
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Select Button */}
                        <Grid size={{ xs: 6, md: 2 }}>
                            <Button
                                variant={isSelected ? "contained" : "outlined"}
                                color="primary"
                                fullWidth
                                onClick={() => handleSelectFlight(flight, isReturn)}
                            >
                                {isSelected ? 'Selected' : 'Select'}
                            </Button>
                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Typography
                                    variant="caption"
                                    color="primary"
                                    sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => handleViewDetails(flight, isReturn)}
                                >
                                    View More
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    };

    if (!searchParams) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                <Typography>Loading search results...</Typography>
            </Container>
        );
    }

    const totalPrice = (selectedOnwardFlight?.currentPrice || 0) + (selectedReturnFlight?.currentPrice || 0);
    const canProceed = selectedOnwardFlight && (searchParams.tripType === 'oneway' || selectedReturnFlight);

    return (
        <>
            <Head>
                <title>Search Results - {originAirport?.city} to {destAirport?.city} - TLAirways</title>
                <meta name="description" content={`Flights from ${originAirport?.city} to ${destAirport?.city}`} />
            </Head>



            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                {/* Search Summary */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Typography variant="h5" gutterBottom>
                                <FlightIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                {originAirport?.city} ({searchParams.originCode}) → {destAirport?.city} ({searchParams.destinationCode})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={format(searchParams.date, 'MMM dd, yyyy')} size="small" />
                                <Chip label={`${searchParams.passengers} Passenger${searchParams.passengers > 1 ? 's' : ''}`} size="small" />
                                <Chip label={searchParams.tripType === 'roundtrip' ? 'Round Trip' : 'One Way'} size="small" color="primary" />
                                <Chip label={searchParams.cabinClass.charAt(0).toUpperCase() + searchParams.cabinClass.slice(1)} size="small" />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
                            <Button
                                variant="outlined"
                                onClick={handleModifySearch}
                                startIcon={<FlightIcon />}
                            >
                                Modify Search
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Main Content Grid: Flights (left) + Booking Summary (right) */}
                <Grid container spacing={4}>
                    {/* Left Column - Flight Lists */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        {/* Onward Flights */}
                        <Paper sx={{ p: 3, mb: 4 }}>
                            <Typography variant="h6" gutterBottom sx={{ color: '#00695c', fontWeight: 600 }}>
                                {searchParams.tripType === 'roundtrip' ? 'Onward Journey' : 'Available Flights'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {onwardFlights.length} flights found
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            {onwardFlights.length === 0 ? (
                                <Alert severity="info">No flights found for this route. Please try different dates.</Alert>
                            ) : (
                                onwardFlights.map(flight => renderFlightCard(flight, false))
                            )}
                        </Paper>

                        {/* Return Flights */}
                        {searchParams.tripType === 'roundtrip' && (
                            <Paper sx={{ p: 3, mb: 4 }}>
                                <Typography variant="h6" gutterBottom sx={{ color: '#00695c', fontWeight: 600 }}>
                                    Return Journey
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {returnFlights.length} flights found
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                {returnFlights.length === 0 ? (
                                    <Alert severity="warning">
                                        No return flights found for this route. Please try different dates or check if this route has return flights available.
                                    </Alert>
                                ) : (
                                    returnFlights.map(flight => renderFlightCard(flight, true))
                                )}
                            </Paper>
                        )}
                    </Grid>

                    {/* Right Column - Sticky Booking Summary */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                            <Typography variant="h6" gutterBottom>
                                Selected Flights
                            </Typography>

                            {/* Onward Flight Summary */}
                            {selectedOnwardFlight && (
                                <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Onward Flight
                                    </Typography>
                                    <Divider sx={{ mb: 1.5 }} />
                                    <Grid container spacing={1}>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary">Airline</Typography>
                                            <Typography variant="body2" fontWeight="medium">TL Airways</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary">Flight</Typography>
                                            <Typography variant="body2" fontWeight="medium">{selectedOnwardFlight.flightNumber}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="caption" color="text.secondary">Route</Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {selectedOnwardFlight.originCity} ({selectedOnwardFlight.origin}) → {selectedOnwardFlight.destinationCity} ({selectedOnwardFlight.destination})
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary">Date</Typography>
                                            <Typography variant="body2">
                                                {selectedOnwardFlight.departureDateTime && format(selectedOnwardFlight.departureDateTime, 'MMM dd, yyyy')}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary">Time</Typography>
                                            <Typography variant="body2">
                                                {selectedOnwardFlight.departureTime} - {selectedOnwardFlight.arrivalTime}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary">Duration</Typography>
                                            <Typography variant="body2">{selectedOnwardFlight.duration}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary">Cabin</Typography>
                                            <Typography variant="body2">
                                                {searchParams.cabinClass.charAt(0).toUpperCase() + searchParams.cabinClass.slice(1)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                        ₹{((selectedOnwardFlight.currentPrice || 0) * searchParams.passengers).toLocaleString()}
                                    </Typography>
                                </Box>
                            )}

                            {/* Return Flight Summary */}
                            {selectedReturnFlight && (
                                <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Return Flight
                                    </Typography>
                                    <Divider sx={{ mb: 1.5 }} />
                                    <Grid container spacing={1}>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary">Airline</Typography>
                                            <Typography variant="body2" fontWeight="medium">TL Airways</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary">Flight</Typography>
                                            <Typography variant="body2" fontWeight="medium">{selectedReturnFlight.flightNumber}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="caption" color="text.secondary">Route</Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {selectedReturnFlight.originCity} ({selectedReturnFlight.origin}) → {selectedReturnFlight.destinationCity} ({selectedReturnFlight.destination})
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary">Date</Typography>
                                            <Typography variant="body2">
                                                {selectedReturnFlight.departureDateTime && format(selectedReturnFlight.departureDateTime, 'MMM dd, yyyy')}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary">Time</Typography>
                                            <Typography variant="body2">
                                                {selectedReturnFlight.departureTime} - {selectedReturnFlight.arrivalTime}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary">Duration</Typography>
                                            <Typography variant="body2">{selectedReturnFlight.duration}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary">Cabin</Typography>
                                            <Typography variant="body2">
                                                {searchParams.cabinClass.charAt(0).toUpperCase() + searchParams.cabinClass.slice(1)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                        ₹{((selectedReturnFlight.currentPrice || 0) * searchParams.passengers).toLocaleString()}
                                    </Typography>
                                </Box>
                            )}

                            {/* Total Price */}
                            {(selectedOnwardFlight || selectedReturnFlight) && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Total Price
                                    </Typography>
                                    <Typography variant="h5" color="primary">
                                        ₹{(totalPrice * searchParams.passengers).toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        for {searchParams.passengers} passenger{searchParams.passengers > 1 ? 's' : ''}
                                    </Typography>
                                </Box>
                            )}

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={!canProceed}
                                onClick={handleProceedToBooking}
                                sx={{
                                    mt: 2,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Continue to Traveller Details
                            </Button>

                            {/* Empty state message */}
                            {!selectedOnwardFlight && !selectedReturnFlight && (
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Select flights to see booking summary
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* Flight Details Modal */}
                <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Flight Details</Typography>
                            <IconButton onClick={handleCloseModal}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        {selectedFlight && (
                            <Box>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom>
                                            {selectedFlight.flightNumber} - TL Airways
                                        </Typography>
                                        <Chip label={selectedFlight.aircraftType} size="small" sx={{ mr: 1 }} />
                                        <Chip
                                            label={selectedFlight.stops.length === 0 ? 'Non-stop' : `${selectedFlight.stops.length} stop(s)`}
                                            size="small"
                                            color={selectedFlight.stops.length === 0 ? 'success' : 'default'}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Departure</Typography>
                                        <Typography variant="h5">{selectedFlight.departureTime}</Typography>
                                        <Typography variant="body1">{selectedFlight.originCity} ({selectedFlight.origin})</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedFlight.departureDateTime && format(selectedFlight.departureDateTime, 'MMM dd, yyyy')}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Arrival</Typography>
                                        <Typography variant="h5">{selectedFlight.arrivalTime}</Typography>
                                        <Typography variant="body1">{selectedFlight.destinationCity} ({selectedFlight.destination})</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedFlight.arrivalDateTime && format(selectedFlight.arrivalDateTime, 'MMM dd, yyyy')}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Divider sx={{ my: 2 }} />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccessTimeIcon color="action" />
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                                                <Typography variant="body1">{selectedFlight.duration}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LuggageIcon color="action" />
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary">Baggage</Typography>
                                                <Typography variant="body2">Cabin: {selectedFlight.baggage.cabin}</Typography>
                                                <Typography variant="body2">Checked: {selectedFlight.baggage.checked}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AirlineSeatReclineNormalIcon color="action" />
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary">Available Seats</Typography>
                                                <Typography variant="body1">{selectedFlight.availableSeats}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Meal Options</Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {selectedFlight.mealOptions.map(meal => (
                                                <Chip key={meal} label={meal} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Divider sx={{ my: 2 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6">Total Fare</Typography>
                                            <Typography variant="h4" color="primary" fontWeight="bold">
                                                ₹{selectedFlight.currentPrice?.toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Price per person for {searchParams.cabinClass} class
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleConfirmSelection} variant="contained" color="primary">
                            Select This Flight
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </>
    );
}
