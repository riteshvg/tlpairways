import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const getUniqueLocations = () => {
  const locations = airports.map(airport => ({
    value: airport.iata_code,
    label: `${airport.city}, ${airport.country}`,
    city: airport.city,
    country: airport.country,
    iata_code: airport.iata_code
  }));
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

const passengerTypes = [
  { value: 'adult', label: 'Adult' },
  { value: 'child', label: 'Child' },
  { value: 'infant', label: 'Infant' }
];

const FlightSearch = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [date, setDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [passengerType, setPassengerType] = useState('adult');
  const [passengerCounts, setPassengerCounts] = useState({ adult: 1, child: 0, infant: 0 });
  const [paymentType, setPaymentType] = useState('');
  const [tripType, setTripType] = useState('oneway');
  const [cabinClass, setCabinClass] = useState('economy');
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
    if (!origin || !destination || !date || !paymentType) {
      return;
    }
    if (tripType === 'roundtrip' && !returnDate) {
      return;
    }

    // Check if the selected route exists
    const routeExists = availableRoutes.includes(`${origin.iata_code}-${destination.iata_code}`);

    if (!routeExists) {
      alert('No flights available for the selected route.');
      return;
    }

    const totalPassengers = passengerCounts.adult + passengerCounts.child + passengerCounts.infant;
    const searchParams = {
      originCode: origin.iata_code,
      destinationCode: destination.iata_code,
      date: date.toISOString(),
      returnDate: returnDate ? returnDate.toISOString() : null,
      passengers: totalPassengers,
      passengerCounts,
      paymentType,
      tripType,
      cabinClass
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

  // Filter available destinations based on selected origin
  const getAvailableDestinations = () => {
    if (!origin) return getUniqueLocations();
    
    return getUniqueLocations().filter(location => {
      return availableRoutes.includes(`${origin.iata_code}-${location.iata_code}`);
    });
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
                    onClick={() => setTripType('oneway')}
                  >
                    One Way
                  </Button>
                  <Button
                    variant={tripType === 'roundtrip' ? 'contained' : 'outlined'}
                    onClick={() => setTripType('roundtrip')}
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
                      />
                    )}
                    minDate={date || new Date()}
                  />
                </LocalizationProvider>
              </Grid>
            )}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl fullWidth required sx={{ minWidth: 100 }}>
                  <InputLabel>Passenger Type</InputLabel>
                  <Select
                    value={passengerType}
                    label="Passenger Type"
                    onChange={e => setPassengerType(e.target.value)}
                  >
                    {passengerTypes.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  type="number"
                  label="Count"
                  value={passengerCounts[passengerType]}
                  onChange={e => {
                    const val = Math.max(0, Math.min(9, parseInt(e.target.value) || 0));
                    setPassengerCounts(prev => ({ ...prev, [passengerType]: val }));
                  }}
                  inputProps={{ min: 0, max: 9 }}
                  sx={{ width: 80 }}
                  required={passengerType === 'adult'}
                />
              </Box>
              <Box sx={{ mt: 1, fontSize: 14, color: 'grey.600' }}>
                {passengerTypes
                  .filter(type => passengerCounts[type.value] > 0)
                  .map(type => `${type.label}: ${passengerCounts[type.value]}`)
                  .join(', ') || 'No passengers selected'}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={!origin || !destination || !date || !paymentType || (tripType === 'roundtrip' && !returnDate)}
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