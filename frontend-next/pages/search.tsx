import { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Autocomplete,
    Card,
    CardContent,
    CardActions,
    Chip,
    IconButton,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Head from 'next/head';
import FlightIcon from '@mui/icons-material/Flight';
import PassengerSelector from '../components/PassengerSelector';
import airportsData from '../data/airports.json';

interface Airport {
    value: string;
    label: string;
    city: string;
    country: string;
    iata_code: string;
    airport_name: string;
    airport_type: string;
    coordinates?: { lat: number; lng: number };
}

interface PassengerCounts {
    adult: number;
    child: number;
    infant: number;
}

const getUniqueLocations = (): Airport[] => {
    const locations: Airport[] = [];

    airportsData.airports.forEach((cityData: any) => {
        cityData.airports.forEach((airport: any) => {
            locations.push({
                value: airport.code,
                label: `${airport.name} (${airport.code}) - ${cityData.city}, ${cityData.country}`,
                city: cityData.city,
                country: cityData.country,
                iata_code: airport.code,
                airport_name: airport.name,
                airport_type: airport.type,
                coordinates: airport.coordinates
            });
        });
    });

    return locations;
};

const paymentTypes = [
    { value: 'cash', label: 'Cash' },
    { value: 'cash_points', label: 'Cash + Points' },
    { value: 'points', label: 'Points' }
];

const cabinClasses = [
    { value: 'economy', label: 'Economy' },
    { value: 'premium_economy', label: 'Premium Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First' }
];

const travelPurposes = [
    { value: 'business', label: 'Business' },
    { value: 'personal', label: 'Personal' },
    { value: 'official', label: 'Official' },
    { value: 'diplomat', label: 'Diplomat' }
];

const quickBookings = [
    {
        id: 1,
        origin: 'Mumbai',
        destination: 'Dubai',
        originCode: 'BOM',
        destinationCode: 'DXB',
        price: '₹25,000',
        duration: '3h 15m',
        departure: '14:30',
        arrival: '17:45',
        airline: 'TL Airways',
        popular: true
    },
    {
        id: 2,
        origin: 'Delhi',
        destination: 'London',
        originCode: 'DEL',
        destinationCode: 'LHR',
        price: '₹45,000',
        duration: '8h 30m',
        departure: '02:15',
        arrival: '06:45',
        airline: 'TL Airways',
        popular: true
    },
    {
        id: 3,
        origin: 'Bangalore',
        destination: 'Singapore',
        originCode: 'BLR',
        destinationCode: 'SIN',
        price: '₹18,000',
        duration: '4h 45m',
        departure: '09:20',
        arrival: '14:05',
        airline: 'TL Airways',
        popular: false
    },
    {
        id: 4,
        origin: 'Chennai',
        destination: 'Bangkok',
        originCode: 'MAA',
        destinationCode: 'BKK',
        price: '₹22,000',
        duration: '3h 55m',
        departure: '11:10',
        arrival: '15:05',
        airline: 'TL Airways',
        popular: false
    },
    {
        id: 5,
        origin: 'Mumbai',
        destination: 'Singapore',
        originCode: 'BOM',
        destinationCode: 'SIN',
        price: '₹28,000',
        duration: '5h 20m',
        departure: '16:45',
        arrival: '22:05',
        airline: 'TL Airways',
        popular: true
    },
    {
        id: 6,
        origin: 'Delhi',
        destination: 'Dubai',
        originCode: 'DEL',
        destinationCode: 'DXB',
        price: '₹26,000',
        duration: '3h 45m',
        departure: '20:30',
        arrival: '00:15',
        airline: 'TL Airways',
        popular: false
    }
];

export default function SearchPage() {
    const [origin, setOrigin] = useState<Airport | null>(null);
    const [destination, setDestination] = useState<Airport | null>(null);
    const [date, setDate] = useState<Date | null>(null);
    const [returnDate, setReturnDate] = useState<Date | null>(null);
    const [passengerCounts, setPassengerCounts] = useState<PassengerCounts>({ adult: 1, child: 0, infant: 0 });
    const [paymentType, setPaymentType] = useState('');
    const [tripType, setTripType] = useState('oneway');
    const [cabinClass, setCabinClass] = useState('economy');
    const [travelPurpose, setTravelPurpose] = useState('personal');
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (!origin || !destination || !date || !paymentType) {
            return;
        }
        if (tripType === 'roundtrip' && !returnDate) {
            return;
        }
        if (passengerCounts.adult < 1) {
            return;
        }

        const totalPassengers = passengerCounts.adult + passengerCounts.child + passengerCounts.infant;

        const params = new URLSearchParams({
            originCode: origin.iata_code,
            destinationCode: destination.iata_code,
            date: date.toISOString(),
            passengers: totalPassengers.toString(),
            paymentType,
            tripType,
            cabinClass,
            travelPurpose,
        });

        if (returnDate) {
            params.append('returnDate', returnDate.toISOString());
        }

        // MPA: Full page reload
        window.location.href = `/results?${params.toString()}`;
    };

    const getAvailableDestinations = (): Airport[] => {
        if (!origin) return getUniqueLocations();

        const allAirports = getUniqueLocations();

        // Filter out the origin airport
        return allAirports.filter(location => location.iata_code !== origin.iata_code);
    };

    const nextCarousel = () => {
        setCurrentCarouselIndex((prev) => (prev + 1) % quickBookings.length);
    };

    const prevCarousel = () => {
        setCurrentCarouselIndex((prev) => (prev - 1 + quickBookings.length) % quickBookings.length);
    };

    const handleQuickBooking = (booking: typeof quickBookings[0]) => {
        const originLocation = getUniqueLocations().find(loc => loc.iata_code === booking.originCode);
        const destinationLocation = getUniqueLocations().find(loc => loc.iata_code === booking.destinationCode);

        if (originLocation && destinationLocation) {
            setOrigin(originLocation);
            setDestination(destinationLocation);
            setTripType('oneway');

            // Scroll to search form
            document.getElementById('search-form')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <Head>
                <title>Search Flights - TLAirways</title>
                <meta name="description" content="Search for flights across India and worldwide" />
            </Head>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                {/* Full-Width Search Widget */}
                <Paper elevation={3} sx={{ p: 4, mb: 4 }} id="search-form">
                    <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 500 }}>
                        Search Flights
                    </Typography>

                    {/* Trip Type Selection */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
                        <Button
                            variant={tripType === 'oneway' ? 'contained' : 'outlined'}
                            onClick={() => setTripType('oneway')}
                            size="large"
                            sx={{ minWidth: 140, textTransform: 'none', fontSize: '1rem' }}
                        >
                            One Way
                        </Button>
                        <Button
                            variant={tripType === 'roundtrip' ? 'contained' : 'outlined'}
                            onClick={() => setTripType('roundtrip')}
                            size="large"
                            sx={{ minWidth: 140, textTransform: 'none', fontSize: '1rem' }}
                        >
                            Round Trip
                        </Button>
                    </Box>

                    <form onSubmit={handleSearch}>
                        <Grid container spacing={3}>
                            {/* First Row - Origin, Destination, Departure Date, Return Date */}
                            <Grid item xs={12} md={2}>
                                <Autocomplete
                                    options={getUniqueLocations()}
                                    getOptionLabel={(option) => option.label}
                                    value={origin}
                                    onChange={(event, newValue) => {
                                        setOrigin(newValue);
                                        setDestination(null);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="From"
                                            required
                                            fullWidth
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option.iata_code === value.iata_code}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Autocomplete
                                    options={getAvailableDestinations()}
                                    getOptionLabel={(option) => option.label}
                                    value={destination}
                                    onChange={(event, newValue) => setDestination(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="To"
                                            required
                                            fullWidth
                                            disabled={!origin}
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option.iata_code === value.iata_code}
                                    disabled={!origin}
                                />
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="Departure Date"
                                        value={date}
                                        onChange={(newValue) => setDate(newValue)}
                                        minDate={new Date()}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                required: true,
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="Return Date"
                                        value={returnDate}
                                        onChange={(newValue) => setReturnDate(newValue)}
                                        minDate={date || new Date()}
                                        disabled={tripType === 'oneway'}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                required: tripType === 'roundtrip',
                                                disabled: tripType === 'oneway',
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            {/* Second Row - Passengers, Class, Payment, Purpose */}
                            <Grid item xs={12} md={1.5}>
                                <PassengerSelector
                                    passengerCounts={passengerCounts}
                                    onPassengerCountsChange={setPassengerCounts}
                                />
                            </Grid>

                            <Grid item xs={12} md={1.5}>
                                <FormControl fullWidth required>
                                    <InputLabel>Cabin Class</InputLabel>
                                    <Select
                                        value={cabinClass}
                                        label="Cabin Class"
                                        onChange={(e) => setCabinClass(e.target.value)}
                                    >
                                        {cabinClasses.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={1.5}>
                                <FormControl fullWidth required>
                                    <InputLabel>Payment Type</InputLabel>
                                    <Select
                                        value={paymentType}
                                        label="Payment Type"
                                        onChange={(e) => setPaymentType(e.target.value)}
                                    >
                                        {paymentTypes.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={1.5}>
                                <FormControl fullWidth required size="medium">
                                    <InputLabel>Travel Purpose</InputLabel>
                                    <Select
                                        value={travelPurpose}
                                        label="Travel Purpose"
                                        onChange={(e) => setTravelPurpose(e.target.value)}
                                    >
                                        {travelPurposes.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Search Button */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        disabled={!origin || !destination || !date || !paymentType || (tripType === 'roundtrip' && !returnDate) || passengerCounts.adult < 1}
                                        sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
                                    >
                                        Search Flights
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>

                {/* Quick Booking Carousel */}
                <Paper elevation={2} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Quick Bookings
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton onClick={prevCarousel}>
                                <ChevronLeft />
                            </IconButton>
                            <IconButton onClick={nextCarousel}>
                                <ChevronRight />
                            </IconButton>
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        {quickBookings.slice(currentCarouselIndex, currentCarouselIndex + 3).map((booking) => (
                            <Grid item xs={12} md={4} key={booking.id}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-4px)' }
                                    }}
                                    onClick={() => handleQuickBooking(booking)}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="h6" color="primary">
                                                {booking.origin} → {booking.destination}
                                            </Typography>
                                            {booking.popular && (
                                                <Chip label="Popular" color="secondary" size="small" />
                                            )}
                                        </Box>

                                        <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                                            {booking.price}
                                        </Typography>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Duration: {booking.duration}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {booking.airline}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="body2">
                                                Departure: {booking.departure}
                                            </Typography>
                                            <Typography variant="body2">
                                                Arrival: {booking.arrival}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" color="primary" fullWidth>
                                            Book Now
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Carousel Indicators */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
                        {quickBookings.map((_, index) => (
                            <Box
                                key={index}
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: index === currentCarouselIndex ? 'primary.main' : 'grey.300',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onClick={() => setCurrentCarouselIndex(index)}
                            />
                        ))}
                    </Box>
                </Paper>
            </Container>
        </>
    );
}
