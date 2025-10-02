import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSearchPageDataLayer from '../hooks/useSearchPageDataLayer';
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
} from '@mui/material';
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

// Passenger types are now handled by PassengerSelector component

const FlightSearch = () => {
  const navigate = useNavigate();
  
  // Initialize search page data layer
  const { trackFieldInteraction, trackSearchInitiated } = useSearchPageDataLayer();
  
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

    // Track search initiation BEFORE navigation
    trackSearchInitiated({
      origin: origin.iata_code,
      destination: destination.iata_code,
      departureDate: date.toISOString().split('T')[0],
      returnDate: returnDate ? returnDate.toISOString().split('T')[0] : null,
      passengers: {
        adults: passengerCounts.adult,
        children: passengerCounts.child,
        infants: passengerCounts.infant,
        total: totalPassengers
      },
      cabinClass,
      tripType
    });

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

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Search Flights
        </Typography>
        <form onSubmit={handleSearch}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                <Button
  variant={tripType === 'oneway' ? 'contained' : 'outlined'}
  onClick={() => {
    setTripType('oneway');
    trackFieldInteraction('trip-type', 'oneway', 'button-click');
  }}
>
  One Way
</Button>
<Button
  variant={tripType === 'roundtrip' ? 'contained' : 'outlined'}
  onClick={() => {
    setTripType('roundtrip');
    trackFieldInteraction('trip-type', 'roundtrip', 'button-click');
  }}
>
  Round Trip
</Button>
                </Box>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={getUniqueLocations()}
                getOptionLabel={(option) => option.label}
                value={origin}
                onChange={(event, newValue) => {
                  setOrigin(newValue);
                  setDestination(null); // Reset destination when origin changes
                  
                  // Track origin selection
                  if (newValue) {
                    trackFieldInteraction('origin', newValue.iata_code, 'autocomplete-selected');
                  }
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
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={getAvailableDestinations()}
                getOptionLabel={(option) => option.label}
                value={destination}
                onChange={(event, newValue) => {
                  setDestination(newValue);
                  
                  // Track destination selection
                  if (newValue) {
                    trackFieldInteraction('destination', newValue.iata_code, 'autocomplete-selected');
                  }
                }}
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
            <Grid item xs={12} md={tripType === 'roundtrip' ? 6 : 12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Departure Date"
                  value={date}
                  onChange={(newValue) => {
                    setDate(newValue);
                    
                    // Track departure date selection
                    if (newValue) {
                      trackFieldInteraction('departure-date', newValue.toISOString().split('T')[0], 'date-picker-selected');
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
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
                    onChange={(newValue) => {
                      setReturnDate(newValue);
                      
                      // Track return date selection
                      if (newValue) {
                        trackFieldInteraction('return-date', newValue.toISOString().split('T')[0], 'date-picker-selected');
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                      />
                    )}
                    minDate={date || new Date()}
                  />
                </LocalizationProvider>
              </Grid>
            )}
            <Grid item xs={12} md={4}>
              <PassengerSelector
                passengerCounts={passengerCounts}
                onPassengerCountsChange={(newCounts) => {
                  setPassengerCounts(newCounts);
                  
                  // Track passenger count changes
                  // Track passenger count changes
trackFieldInteraction('passengers', JSON.stringify(newCounts), 'selector-changed');
                }}
              />
              {/* Debug info */}
              <Box sx={{ mt: 1, fontSize: 12, color: 'grey.600' }}>
                Debug: Adults: {passengerCounts.adult}, Children: {passengerCounts.child}, Infants: {passengerCounts.infant}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={paymentType}
                  label="Payment Type"
                  onChange={(e) => {
                    setPaymentType(e.target.value);
                    trackFieldInteraction('payment-type', e.target.value, 'dropdown-selected');
                  }}
                >
                  {paymentTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Cabin Class</InputLabel>
                <Select
                  value={cabinClass}
                  label="Cabin Class"
                  onChange={(e) => {
                    setCabinClass(e.target.value);
                    trackFieldInteraction('cabin-class', e.target.value, 'dropdown-selected');
                  }}
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
              <FormControl fullWidth required>
                <InputLabel>Travel Purpose</InputLabel>
                <Select
                  value={travelPurpose}
                  label="Travel Purpose"
                  onChange={(e) => {
                    setTravelPurpose(e.target.value);
                    trackFieldInteraction('travel-purpose', e.target.value, 'dropdown-selected');
                  }}
                >
                  {travelPurposes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={!origin || !destination || !date || !paymentType || (tripType === 'roundtrip' && !returnDate) || passengerCounts.adult < 1}
              >
                Search Flights
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default FlightSearch; 