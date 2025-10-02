import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageView from '../hooks/usePageView';
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
import airports from '../data/airports.json';
import flightRoutes from '../data/flight_routes.json';
import PassengerSelector from './PassengerSelector';

const getUniqueLocations = () => {
  const locations = [];
  
  // Flatten the new airport structure
  airports.airports.forEach(cityData => {
    cityData.airports.forEach(airport => {
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

// Quick booking combinations
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

// Passenger types are now handled by PassengerSelector component

const FlightSearch = () => {
  const navigate = useNavigate();
  
  // Track page view with search-specific context
  usePageView({
    pageCategory: 'booking',
    searchType: 'flight',
    sections: ['search-form', 'filters', 'quick-actions']
  });
  
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [date, setDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [passengerCounts, setPassengerCounts] = useState({ adult: 1, child: 0, infant: 0 });

  // Debug passenger counts changes
  React.useEffect(() => {
    console.log('Passenger counts updated:', passengerCounts);
  }, [passengerCounts]);
  const [paymentType, setPaymentType] = useState('');
  const [tripType, setTripType] = useState('oneway');
  const [cabinClass, setCabinClass] = useState('economy');
  const [travelPurpose, setTravelPurpose] = useState('personal');
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Get available routes on component mount
  React.useEffect(() => {
    const routes = new Set();
    Object.entries(flightRoutes.routes).forEach(([routeKey, routeData]) => {
      // Add direct routes from onward flights
      routeData.onward.forEach(flight => {
        routes.add(`${flight.origin.iata_code}-${flight.destination.iata_code}`);
      });
      
      // Add direct routes from return flights
      routeData.return.forEach(flight => {
        routes.add(`${flight.origin.iata_code}-${flight.destination.iata_code}`);
      });
    });
    setAvailableRoutes(Array.from(routes));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search form submitted with:', {
      origin: origin?.iata_code,
      destination: destination?.iata_code,
      date,
      returnDate,
      paymentType,
      tripType,
      passengerCounts
    });
    
    if (!origin || !destination || !date || !paymentType) {
      console.log('Missing required fields');
      return;
    }
    if (tripType === 'roundtrip' && !returnDate) {
      console.log('Missing return date for round trip');
      return;
    }
    if (passengerCounts.adult < 1) {
      console.log('At least one adult required');
      return;
    }

    // Check if the selected route exists
    const routeExists = availableRoutes.includes(`${origin.iata_code}-${destination.iata_code}`);
    
    // Allow search even if route doesn't exist (will show "no flights found" on results page)
    if (!routeExists) {
      console.log(`Route ${origin.iata_code}-${destination.iata_code} not found in existing routes, but allowing search to proceed`);
    }

    const totalPassengers = passengerCounts.adult + passengerCounts.child + passengerCounts.infant;
    const searchDateTime = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const searchParams = {
      originCode: origin.iata_code,
      destinationCode: destination.iata_code,
      date: date.toISOString(),
      returnDate: returnDate ? returnDate.toISOString() : null,
      passengers: totalPassengers,
      passengerCounts,
      paymentType,
      tripType,
      cabinClass,
      travelPurpose,
      searchDateTime
    };

    // Track search initiation
    // Analytics call removed

    // Navigate to search results
    navigate('/search-results', {
      state: {
        ...searchParams,
        previousPage: 'Flight Search'
      }
    });
  };

  // Smart destination filtering - breaks route limitations
  const getAvailableDestinations = () => {
    if (!origin) return getUniqueLocations();
    
    const allAirports = getUniqueLocations();
    const existingRoutes = availableRoutes;
    
    // Priority 1: Existing direct routes
    const directRoutes = allAirports.filter(location => 
      existingRoutes.includes(`${origin.iata_code}-${location.iata_code}`)
    );
    
    // Priority 2: Major international hubs (realistic connections)
    const majorHubs = ['LHR', 'JFK', 'CDG', 'FRA', 'DXB', 'SIN', 'HKG', 'ICN', 'AMS', 'MUC'];
    const hubRoutes = allAirports.filter(location => 
      majorHubs.includes(location.iata_code) && 
      !directRoutes.some(route => route.iata_code === location.iata_code)
    );
    
    // Priority 3: Regional connections (same country)
    const regionalRoutes = allAirports.filter(location => {
      const isSameCountry = location.country === origin.country;
      const isNotOrigin = location.iata_code !== origin.iata_code;
      const notAlreadyIncluded = !directRoutes.some(route => route.iata_code === location.iata_code) &&
                                 !hubRoutes.some(route => route.iata_code === location.iata_code);
      
      return isSameCountry && isNotOrigin && notAlreadyIncluded;
    });
    
    // Priority 4: Other international destinations (with distance limit)
    const otherInternational = allAirports.filter(location => {
      const isInternational = location.country !== origin.country;
      const isNotOrigin = location.iata_code !== origin.iata_code;
      const notAlreadyIncluded = !directRoutes.some(route => route.iata_code === location.iata_code) &&
                                 !hubRoutes.some(route => route.iata_code === location.iata_code);
      
      // Only include if it's a reasonable distance (simplified check)
      const isReasonableDistance = !['PEK', 'GRU', 'SYD'].includes(location.iata_code) || 
                                   ['DEL', 'BOM', 'BLR', 'MAA'].includes(origin.iata_code);
      
      return isInternational && isNotOrigin && notAlreadyIncluded && isReasonableDistance;
    });
    
    return [...directRoutes, ...hubRoutes, ...regionalRoutes, ...otherInternational];
  };

  // Carousel navigation functions
  const nextCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev + 1) % quickBookings.length);
  };

  const prevCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev - 1 + quickBookings.length) % quickBookings.length);
  };

  // Handle quick booking selection
  const handleQuickBooking = (booking) => {
    // Find the origin and destination locations
    const originLocation = getUniqueLocations().find(loc => loc.iata_code === booking.originCode);
    const destinationLocation = getUniqueLocations().find(loc => loc.iata_code === booking.destinationCode);
    
    if (originLocation && destinationLocation) {
      setOrigin(originLocation);
      setDestination(destinationLocation);
      setTripType('oneway'); // Default to one way for quick bookings
      
      // Scroll to search form
      document.getElementById('search-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Main Search Form - Left Side */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }} id="search-form">
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
              Search Flights
            </Typography>
            
            {/* Trip Type Selection */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
              <Button
                variant={tripType === 'oneway' ? 'contained' : 'outlined'}
                onClick={() => setTripType('oneway')}
                size="large"
                sx={{ minWidth: 120 }}
              >
                One Way
              </Button>
              <Button
                variant={tripType === 'roundtrip' ? 'contained' : 'outlined'}
                onClick={() => setTripType('roundtrip')}
                size="large"
                sx={{ minWidth: 120 }}
              >
                Round Trip
              </Button>
            </Box>

            <form onSubmit={handleSearch}>
              <Grid container spacing={3}>
                {/* Origin and Destination */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={getUniqueLocations()}
                    getOptionLabel={(option) => option.label}
                    value={origin}
                    onChange={(event, newValue) => {
                      setOrigin(newValue);
                      setDestination(null); // Reset destination when origin changes
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="From"
                        required
                        fullWidth
                        size="large"
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.iata_code === value.iata_code}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
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
                        size="large"
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.iata_code === value.iata_code}
                    disabled={!origin}
                  />
                </Grid>

                {/* Dates */}
                <Grid item xs={12} md={tripType === 'roundtrip' ? 6 : 12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Departure Date"
                      value={date}
                      onChange={(newValue) => setDate(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          required
                          size="large"
                        />
                      )}
                      minDate={new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
                {tripType === 'roundtrip' && (
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Return Date"
                        value={returnDate}
                        onChange={(newValue) => setReturnDate(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            required
                            size="large"
                          />
                        )}
                        minDate={date || new Date()}
                      />
                    </LocalizationProvider>
                  </Grid>
                )}

                {/* Passengers, Cabin Class, Payment Type - Single Row */}
                <Grid item xs={12} md={4}>
                  <PassengerSelector
                    passengerCounts={passengerCounts}
                    onPassengerCountsChange={setPassengerCounts}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required size="large">
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
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required size="large">
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

                {/* Search Button */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={!origin || !destination || !date || !paymentType || (tripType === 'roundtrip' && !returnDate) || passengerCounts.adult < 1}
                    sx={{ py: 2, fontSize: '1.1rem' }}
                  >
                    Search Flights
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Promotional Sidebar - Right Side */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            {/* Quick Booking Carousel */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Quick Bookings
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={prevCarousel}>
                    <ChevronLeft />
                  </IconButton>
                  <IconButton size="small" onClick={nextCarousel}>
                    <ChevronRight />
                  </IconButton>
                </Box>
              </Box>
              
              <Card 
                sx={{ 
                  mb: 2, 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
                onClick={() => handleQuickBooking(quickBookings[currentCarouselIndex])}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" color="primary">
                      {quickBookings[currentCarouselIndex].origin} → {quickBookings[currentCarouselIndex].destination}
                    </Typography>
                    {quickBookings[currentCarouselIndex].popular && (
                      <Chip label="Popular" color="secondary" size="small" />
                    )}
                  </Box>
                  
                  <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                    {quickBookings[currentCarouselIndex].price}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {quickBookings[currentCarouselIndex].duration}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {quickBookings[currentCarouselIndex].airline}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      Departure: {quickBookings[currentCarouselIndex].departure}
                    </Typography>
                    <Typography variant="body2">
                      Arrival: {quickBookings[currentCarouselIndex].arrival}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ pt: 0 }}>
                  <Button size="small" color="primary" fullWidth>
                    Book Now
                  </Button>
                </CardActions>
              </Card>
              
              {/* Carousel Indicators */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {quickBookings.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 8,
                      height: 8,
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

            {/* Promotional Banner */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                mb: 3, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center'
              }}
            >
              <Typography variant="h6" gutterBottom>
                ✈️ Premium Travel Experience
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enjoy luxury amenities, priority boarding, and exclusive lounge access
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                size="small"
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' } }}
              >
                Learn More
              </Button>
            </Paper>

            {/* Quick Actions */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="outlined" fullWidth>
                  Manage Booking
                </Button>
                <Button variant="outlined" fullWidth>
                  Check-in Online
                </Button>
                <Button variant="outlined" fullWidth>
                  Seat Selection
                </Button>
              </Box>
            </Paper>

            {/* Popular Destinations */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Popular Destinations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { route: 'Mumbai → Dubai', price: '₹25,000' },
                  { route: 'Delhi → London', price: '₹45,000' },
                  { route: 'Bangalore → Singapore', price: '₹18,000' },
                  { route: 'Chennai → Bangkok', price: '₹22,000' }
                ].map((dest, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                    <Typography variant="body2">{dest.route}</Typography>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {dest.price}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FlightSearch; 