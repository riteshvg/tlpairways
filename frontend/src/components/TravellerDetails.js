import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import analytics from '../services/analytics';
import withAnalytics from './withAnalytics';

const TravellerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { onwardFlight, returnFlight, tripType, passengers } = location.state || {};

  console.log('TravellerDetails received state:', {
    onwardFlight,
    returnFlight,
    tripType,
    passengers
  });

  // Move getCabinPrice function before state initialization
  const getCabinPrice = (basePrice, cabinClass) => {
    switch (cabinClass?.toLowerCase()) {
      case 'business':
        return basePrice * 2.5; // Business class is 2.5x economy
      case 'premium economy':
        return basePrice * 1.5; // Premium economy is 1.5x economy
      default:
        return basePrice; // Economy class
    }
  };

  const [travellers, setTravellers] = useState([
    {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      passportNumber: '',
      nationality: '',
    }
  ]);

  const [selectedFlights, setSelectedFlights] = useState(() => {
    if (location.state) {
      const { onwardFlight, returnFlight } = location.state;
      
      // Helper function to get price based on cabin class
      const getPriceForCabinClass = (flight) => {
        if (!flight) return null;
        const cabinClass = flight.cabinClass?.toLowerCase() || 'economy';
        return flight.prices?.[cabinClass] || flight.currentPrice || flight.price.amount;
      };

      const onwardPrice = getPriceForCabinClass(onwardFlight);
      const returnPrice = returnFlight ? getPriceForCabinClass(returnFlight) : null;

      return {
        onward: {
          ...onwardFlight,
          price: {
            amount: onwardPrice,
            currency: onwardFlight.price.currency
          },
          cabinClass: onwardFlight.cabinClass || 'economy',
          basePrice: onwardFlight.basePrice || onwardFlight.price.amount,
          prices: onwardFlight.prices || {
            economy: onwardFlight.price.amount,
            premium_economy: onwardFlight.price.amount * 1.3,
            business: onwardFlight.price.amount * 1.7,
            first: onwardFlight.price.amount * 2.2
          }
        },
        return: returnFlight ? {
          ...returnFlight,
          price: {
            amount: returnPrice,
            currency: returnFlight.price.currency
          },
          cabinClass: returnFlight.cabinClass || 'economy',
          basePrice: returnFlight.basePrice || returnFlight.price.amount,
          prices: returnFlight.prices || {
            economy: returnFlight.price.amount,
            premium_economy: returnFlight.price.amount * 1.3,
            business: returnFlight.price.amount * 1.7,
            first: returnFlight.price.amount * 2.2
          }
        } : null
      };
    }
    return { onward: null, return: null };
  });
  const [passengerCount, setPassengerCount] = useState(passengers);
  const [paymentType, setPaymentType] = useState(tripType === 'roundtrip' ? 'roundtrip' : 'oneway');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [validationErrors, setValidationErrors] = useState({
    email: '',
    phone: '',
    travellers: []
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  useEffect(() => {
    console.log('TravellerDetails - Initializing state from location:', location.state);
    console.log('Raw flight data:', {
      onwardFlight,
      returnFlight,
      tripType,
      passengers
    });
    
    try {
      if (!location.state) {
        console.error('No state found in location');
        setSnackbar({
          open: true,
          message: 'No flight data found. Please search for flights again.',
          severity: 'error'
        });
        navigate('/search');
      }
    } catch (error) {
      console.error('Error initializing state:', error);
      setSnackbar({
        open: true,
        message: 'Error loading flight details. Please try again.',
        severity: 'error'
      });
      navigate('/search');
    }
  }, [location.state, navigate, onwardFlight, returnFlight, passengers, tripType]);

  // Add a new useEffect to monitor selectedFlights changes
  useEffect(() => {
    console.log('selectedFlights state updated:', selectedFlights);
    if (selectedFlights?.onward) {
      console.log('Current price details:', {
        onwardPrice: selectedFlights.onward.price?.amount,
        returnPrice: selectedFlights.return?.price?.amount,
        totalPrice: selectedFlights.onward.price?.amount + (selectedFlights.return?.price?.amount || 0)
      });
    }
  }, [selectedFlights]);

  // Update handleCabinClassChange to use the prices object
  const handleCabinClassChange = (journey, newCabinClass) => {
    console.log('Cabin class change:', { journey, newCabinClass });
    
    setSelectedFlights(prevFlights => {
      const updatedFlights = { ...prevFlights };
      const flight = updatedFlights[journey];
      
      if (flight) {
        const newPrice = flight.prices?.[newCabinClass.toLowerCase()] || 
                        getCabinPrice(flight.basePrice, newCabinClass);
        
        console.log('Price update:', {
          journey,
          oldPrice: flight.price.amount,
          newPrice,
          oldCabinClass: flight.cabinClass,
          newCabinClass
        });

        updatedFlights[journey] = {
          ...flight,
          price: {
            ...flight.price,
            amount: newPrice
          },
          cabinClass: newCabinClass
        };

        return { ...updatedFlights };
      }

      return prevFlights;
    });
  };

  const handleAddTraveller = () => {
    setTravellers([
      ...travellers,
      {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        passportNumber: '',
        nationality: '',
      }
    ]);
  };

  const handleRemoveTraveller = (index) => {
    const newTravellers = travellers.filter((_, i) => i !== index);
    setTravellers(newTravellers);
  };

  const handleTravellerChange = (index, field, value) => {
    const newTravellers = [...travellers];
    newTravellers[index] = {
      ...newTravellers[index],
      [field]: value
    };
    setTravellers(newTravellers);
  };

  const validateForm = () => {
    const errors = {
      email: '',
      phone: '',
      travellers: []
    };

    // Validate email
    if (!email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Validate phone
    if (!phone) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Validate travellers
    if (travellers.length === 0) {
      errors.travellers.push('Please add at least one traveller');
    } else {
      travellers.forEach((traveller, index) => {
        const travellerErrors = {};
        if (!traveller.firstName) travellerErrors.firstName = 'First name is required';
        if (!traveller.lastName) travellerErrors.lastName = 'Last name is required';
        if (!traveller.dateOfBirth) travellerErrors.dateOfBirth = 'Date of birth is required';
        if (!traveller.gender) travellerErrors.gender = 'Gender is required';
        if (!traveller.passportNumber) travellerErrors.passportNumber = 'Passport number is required';
        if (!traveller.nationality) travellerErrors.nationality = 'Nationality is required';
        
        if (Object.keys(travellerErrors).length > 0) {
          errors.travellers[index] = travellerErrors;
        }
      });
    }

    setValidationErrors(errors);
    return !errors.email && !errors.phone && errors.travellers.length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('TravellerDetails - handleSubmit called');
    console.log('Current state at submission:', {
      selectedFlights,
      travellers,
      contactInfo: {
        email,
        phone
      }
    });
    console.log('Price details at submission:', {
      onwardPrice: selectedFlights?.onward?.price?.amount,
      returnPrice: selectedFlights?.return?.price?.amount,
      totalPrice: selectedFlights?.onward?.price?.amount + (selectedFlights?.return?.price?.amount || 0)
    });

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      // Track passenger details added with proper flight data
      if (selectedFlights?.onward) {
        const flightData = {
          passengers: travellers,
          flight: {
            originCode: selectedFlights.onward.origin?.iata_code || selectedFlights.onward.originCode,
            destinationCode: selectedFlights.onward.destination?.iata_code || selectedFlights.onward.destinationCode,
            flightNumber: selectedFlights.onward.flightNumber,
            departureTime: selectedFlights.onward.departureTime,
            arrivalTime: selectedFlights.onward.arrivalTime,
            price: selectedFlights.onward.price,
            cabinClass: selectedFlights.onward.cabinClass
          }
        };
        console.log('Tracking analytics with flight data:', flightData);
        try {
          analytics.passengerDetailsAdded(flightData);
        } catch (analyticsError) {
          console.error('Analytics error:', analyticsError);
        }
      }

      const navigationState = {
        selectedFlights: {
          onward: {
            ...selectedFlights.onward,
            originCode: selectedFlights.onward.origin?.iata_code || selectedFlights.onward.originCode,
            destinationCode: selectedFlights.onward.destination?.iata_code || selectedFlights.onward.destinationCode,
            price: selectedFlights.onward.price,
            cabinClass: selectedFlights.onward.cabinClass
          },
          return: selectedFlights.return ? {
            ...selectedFlights.return,
            originCode: selectedFlights.return.origin?.iata_code || selectedFlights.return.originCode,
            destinationCode: selectedFlights.return.destination?.iata_code || selectedFlights.return.destinationCode,
            price: selectedFlights.return.price,
            cabinClass: selectedFlights.return.cabinClass
          } : null
        },
      travellerDetails: travellers,
        contactInfo: {
          email,
          phone
        },
        paymentType: selectedFlights.return ? 'roundtrip' : 'oneway',
        previousPage: 'Traveller Details'
    };
    
      console.log('Navigating to ancillary services with state:', navigationState);
      console.log('Final price details being passed:', {
        onwardPrice: navigationState.selectedFlights.onward.price.amount,
        returnPrice: navigationState.selectedFlights.return?.price?.amount,
        totalPrice: navigationState.selectedFlights.onward.price.amount + 
                   (navigationState.selectedFlights.return?.price?.amount || 0)
      });

      // Navigate to ancillary services page
    navigate('/ancillary-services', {
        state: navigationState,
        replace: true
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting form. Please try again.',
        severity: 'error'
    });
    }
  };

  const renderFlightPreview = (flight, isReturn = false) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isReturn ? 'Return Flight' : 'Onward Flight'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1">
              {format(new Date(flight.departureTime), 'HH:mm')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {flight.origin.iata_code}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(flight.departureTime), 'MMM dd, yyyy')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {flight.duration}
              </Typography>
              <Divider sx={{ my: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  →
                </Typography>
              </Divider>
              <Typography variant="body2" color="text.secondary">
                {flight.segments ? 'Connecting Flight' : 'Direct Flight'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1">
              {format(new Date(flight.arrivalTime), 'HH:mm')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {flight.destination.iata_code}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(flight.arrivalTime), 'MMM dd, yyyy')}
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Flight: {flight.flightNumber} | {flight.airline}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aircraft: {flight.aircraft}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Traveller Details Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              Traveller Details
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Please provide details for all passengers
            </Typography>

            {/* Flight Preview Section */}
            {selectedFlights?.onward && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Selected Flight
                </Typography>
                {renderFlightPreview(selectedFlights.onward)}
                {selectedFlights.return && renderFlightPreview(selectedFlights.return, true)}
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={!!validationErrors.email}
                      helperText={validationErrors.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      error={!!validationErrors.phone}
                      helperText={validationErrors.phone}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>

              {travellers.map((traveller, index) => (
                <Box key={index} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Passenger {index + 1}
                    </Typography>
                    {index > 0 && (
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveTraveller(index)}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={traveller.firstName}
                        onChange={(e) => handleTravellerChange(index, 'firstName', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={traveller.lastName}
                        onChange={(e) => handleTravellerChange(index, 'lastName', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        value={traveller.dateOfBirth}
                        onChange={(e) => handleTravellerChange(index, 'dateOfBirth', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Gender</InputLabel>
                        <Select
                          value={traveller.gender}
                          label="Gender"
                          onChange={(e) => handleTravellerChange(index, 'gender', e.target.value)}
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Passport Number"
                        value={traveller.passportNumber}
                        onChange={(e) => handleTravellerChange(index, 'passportNumber', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nationality"
                        value={traveller.nationality}
                        onChange={(e) => handleTravellerChange(index, 'nationality', e.target.value)}
                        required
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {travellers.length < passengers && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddTraveller}
                  sx={{ mb: 4 }}
                >
                  Add Another Passenger
                </Button>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/search')}
                >
                  Back to Search
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Proceed to Ancillary Services
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Flight Preview */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Flight Summary
            </Typography>
            {renderFlightPreview(onwardFlight)}
            {tripType === 'roundtrip' && renderFlightPreview(returnFlight, true)}
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Price Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                <Typography>Onward Flight</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedFlights?.onward?.cabinClass ? 
                      selectedFlights.onward.cabinClass.charAt(0).toUpperCase() + 
                      selectedFlights.onward.cabinClass.slice(1).toLowerCase() : 
                      'Economy'} Class
                  </Typography>
                </Box>
                <Typography>
                  ₹{selectedFlights?.onward?.price?.amount?.toLocaleString() || '0'}
                </Typography>
              </Box>
              {tripType === 'roundtrip' && selectedFlights?.return && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                  <Typography>Return Flight</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedFlights.return.cabinClass ? 
                        selectedFlights.return.cabinClass.charAt(0).toUpperCase() + 
                        selectedFlights.return.cabinClass.slice(1).toLowerCase() : 
                        'Economy'} Class
                    </Typography>
                  </Box>
                  <Typography>
                    ₹{selectedFlights.return.price.amount.toLocaleString()}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">Total Price</Typography>
                <Typography variant="subtitle1">
                  ₹{(
                    (selectedFlights?.onward?.price?.amount || 0) + 
                    (tripType === 'roundtrip' && selectedFlights?.return ? (selectedFlights.return.price.amount || 0) : 0)
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/search')}
              >
                Change Flight/Cabin Class
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default withAnalytics(TravellerDetails, 'Traveller Details'); 