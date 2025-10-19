import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useTravellerDetailsDataLayer from '../hooks/useTravellerDetailsDataLayer';
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
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import CURRENCY_CONFIG from '../config/currencyConfig';
import BookingSteps from './BookingSteps';

const TravellerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get state from location or restored from sessionStorage
  const getBookingState = () => {
    if (location.state) {
      return location.state;
    }
    
    // Try to restore from sessionStorage (after auth redirect)
    const restoredState = sessionStorage.getItem('restored_booking_state');
    if (restoredState) {
      try {
        return JSON.parse(restoredState);
      } catch (error) {
        console.error('Error parsing restored booking state:', error);
      }
    }
    
    return null;
  };

  const bookingState = getBookingState();
  const { onwardFlight, returnFlight, tripType, passengers } = bookingState || {};
  
  // Debug: Log the dates we received
  console.log('TravellerDetails - Received dates:', {
    departureDate: bookingState?.departureDate,
    returnDate: bookingState?.returnDate,
    fromOnwardFlight: onwardFlight?.departureTime,
    fromReturnFlight: returnFlight?.departureTime
  });
  
  // Initialize data layer tracking (includes pageView)
  useTravellerDetailsDataLayer({
    pageCategory: 'booking',
    bookingStep: 'traveller-details',
    sections: ['passengerForm', 'contactDetails', 'specialRequests'],
    passengerCount: (passengers?.adult || 1) + (passengers?.child || 0) + (passengers?.infant || 0)
  });

  console.log('TravellerDetails received state:', {
    onwardFlight,
    returnFlight,
    tripType,
    passengers
  });


  const [travellers, setTravellers] = useState(() => {
    const state = getBookingState();
    const passengerCount = (state?.passengers?.adult || 1) + (state?.passengers?.child || 0) + (state?.passengers?.infant || 0);
    
    return Array.from({ length: passengerCount }, () => ({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      passportNumber: '',
      nationality: '',
    }));
  });

  const [selectedFlights] = useState(() => {
    const state = getBookingState();
    if (state) {
      const { onwardFlight, returnFlight } = state;
      
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

  // Random data generators
  const generateRandomName = () => {
    const firstNames = [
      'Aarav', 'Aditya', 'Akshay', 'Arjun', 'Deepak', 'Gaurav', 'Harsh', 'Karan', 'Manish', 'Nikhil',
      'Priya', 'Sneha', 'Anita', 'Kavya', 'Meera', 'Pooja', 'Riya', 'Sakshi', 'Tanya', 'Vidya'
    ];
    const lastNames = [
      'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Jain', 'Agarwal', 'Malhotra', 'Chopra',
      'Reddy', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Rao', 'Joshi', 'Mehta', 'Agarwal', 'Bansal'
    ];
    return {
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)]
    };
  };

  const generateRandomEmail = (firstName, lastName) => {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${domain}`;
  };

  const generateRandomPhone = () => {
    const prefixes = ['6', '7', '8', '9'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const remaining = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + remaining;
  };

  const generateRandomDateOfBirth = () => {
    const start = new Date(1950, 0, 1);
    const end = new Date(2005, 11, 31);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return format(randomDate, 'yyyy-MM-dd');
  };

  const generateRandomGender = () => {
    const genders = ['male', 'female', 'other'];
    return genders[Math.floor(Math.random() * genders.length)];
  };

  const generateRandomNationality = () => {
    const nationalities = [
      'Indian', 'American', 'British', 'Canadian', 'Australian', 'German', 'French', 'Italian', 'Spanish', 'Japanese',
      'Chinese', 'Korean', 'Brazilian', 'Mexican', 'Russian', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish'
    ];
    return nationalities[Math.floor(Math.random() * nationalities.length)];
  };

  const generateRandomPassportNumber = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let passport = '';
    for (let i = 0; i < 2; i++) {
      passport += letters[Math.floor(Math.random() * letters.length)];
    }
    for (let i = 0; i < 7; i++) {
      passport += numbers[Math.floor(Math.random() * numbers.length)];
    }
    return passport;
  };

  // Handler functions
  const handleFillRandomDetails = () => {
    const totalPassengers = (passengers?.adult || 1) + (passengers?.child || 0) + (passengers?.infant || 0);
    
    // Fill passenger details
    const updatedTravellers = travellers.map(() => {
      const { firstName, lastName } = generateRandomName();
      return {
        firstName,
        lastName,
        email: generateRandomEmail(firstName, lastName),
        phone: generateRandomPhone(),
        dateOfBirth: generateRandomDateOfBirth(),
        gender: generateRandomGender(),
        passportNumber: generateRandomPassportNumber(),
        nationality: generateRandomNationality(),
      };
    });

    // Ensure we have the correct number of travellers
    while (updatedTravellers.length < totalPassengers) {
      const { firstName, lastName } = generateRandomName();
      updatedTravellers.push({
        firstName,
        lastName,
        email: generateRandomEmail(firstName, lastName),
        phone: generateRandomPhone(),
        dateOfBirth: generateRandomDateOfBirth(),
        gender: generateRandomGender(),
        passportNumber: generateRandomPassportNumber(),
        nationality: generateRandomNationality(),
      });
    }

    setTravellers(updatedTravellers);

    // Fill contact information
    const { firstName, lastName } = generateRandomName();
    setEmail(generateRandomEmail(firstName, lastName));
    setPhone(generateRandomPhone());

    // Show success message
    setSnackbar({
      open: true,
      message: `Filled random details for ${totalPassengers} passenger${totalPassengers > 1 ? 's' : ''}`,
      severity: 'success'
    });
  };

  const handleClearAllDetails = () => {
    const totalPassengers = (passengers?.adult || 1) + (passengers?.child || 0) + (passengers?.infant || 0);
    
    // Clear passenger details
    const clearedTravellers = Array.from({ length: totalPassengers }, () => ({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      passportNumber: '',
      nationality: '',
    }));

    setTravellers(clearedTravellers);

    // Clear contact information
    setEmail('');
    setPhone('');

    // Clear validation errors
    setValidationErrors({
      email: '',
      phone: '',
    });

    // Show success message
    setSnackbar({
      open: true,
      message: 'Cleared all passenger details',
      severity: 'info'
    });
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
      // Check if we have valid booking state
      if (!bookingState) {
        console.error('No booking state found');
        setSnackbar({
          open: true,
          message: 'No flight data found. Please search for flights again.',
          severity: 'error'
        });
        navigate('/search');
        return;
      }
      
      console.log('Using booking state:', bookingState);
      
    } catch (error) {
      console.error('Error initializing state:', error);
      setSnackbar({
        open: true,
        message: 'Error loading flight details. Please try again.',
        severity: 'error'
      });
      navigate('/search');
    }
  }, [bookingState, navigate, location.state, onwardFlight, returnFlight, tripType, passengers]);

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
      // Track proceed to ancillary services event
      if (typeof window !== 'undefined' && window.adobeDataLayer) {
        window.adobeDataLayer.push({
          event: 'proceedToAncillaryServices',
          bookingContext: {
            bookingId: `booking_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            bookingStep: 'traveller-details',
            nextStep: 'ancillary-services',
            bookingStepNumber: 1,
            totalSteps: 4
          },
          selectedFlights: {
            onward: {
              flightNumber: selectedFlights.onward.flightNumber,
              airline: selectedFlights.onward.airline,
              origin: selectedFlights.onward.origin?.iata_code || selectedFlights.onward.originCode,
              destination: selectedFlights.onward.destination?.iata_code || selectedFlights.onward.destinationCode,
              departureTime: selectedFlights.onward.departureTime,
              price: selectedFlights.onward.price?.amount || 0,
              cabinClass: selectedFlights.onward.cabinClass
            },
            return: selectedFlights.return ? {
              flightNumber: selectedFlights.return.flightNumber,
              airline: selectedFlights.return.airline,
              origin: selectedFlights.return.origin?.iata_code || selectedFlights.return.originCode,
              destination: selectedFlights.return.destination?.iata_code || selectedFlights.return.destinationCode,
              departureTime: selectedFlights.return.departureTime,
              price: selectedFlights.return.price?.amount || 0,
              cabinClass: selectedFlights.return.cabinClass
            } : null
          },
          passengersBreakdown: {
            totalPassengers: (passengers?.adult || 1) + (passengers?.child || 0) + (passengers?.infant || 0),
            breakdown: {
              adults: {
                count: passengers?.adult || 1,
                type: 'adult',
                description: '12+ years'
              },
              children: {
                count: passengers?.child || 0,
                type: 'child',
                description: '2-11 years'
              },
              infants: {
                count: passengers?.infant || 0,
                type: 'infant',
                description: 'Under 2 years'
              }
            },
            passengerDetails: travellers.map(traveller => ({
              firstName: traveller.firstName,
              lastName: traveller.lastName,
              email: traveller.email,
              phone: traveller.phone
            }))
          },
          contactInfo: {
            email,
            phone
          },
          tripType: selectedFlights.return ? 'roundtrip' : 'oneway',
          timestamp: new Date().toISOString()
        });
      }

      // Ensure travellerDetails array matches the number of passengers
      const totalPassengers = (passengers?.adult || 1) + (passengers?.child || 0) + (passengers?.infant || 0);

      // Track passenger details added with proper flight data
      if (selectedFlights?.onward) {
        // Prepare passenger details for analytics
        const passengerDetails = {
          passengers: travellers,
          contactInfo: {
            email,
            phone
          }
        };

        // Prepare search parameters for analytics
        const searchParams = {
          originCode: selectedFlights.onward.origin?.iata_code || selectedFlights.onward.originCode,
          destinationCode: selectedFlights.onward.destination?.iata_code || selectedFlights.onward.destinationCode,
          date: selectedFlights.onward.departureTime,
          returnDate: selectedFlights.return?.departureTime || null,
          tripType: selectedFlights.return ? 'roundtrip' : 'oneway',
          passengers: totalPassengers
        };

        console.log('Tracking analytics with passenger details:', passengerDetails);
        console.log('Tracking analytics with search params:', searchParams);
        
        // Analytics tracking removed
      }
      let filledTravellers = [...travellers];
      while (filledTravellers.length < totalPassengers) {
        filledTravellers.push({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          passportNumber: '',
          nationality: '',
        });
      }

      // Convert all prices to INR for booking confirmation
      const convertToINR = (flight) => {
        if (!flight) return null;
        
        // Get the price for the selected cabin class
        const cabinClassPrice = flight.displayPrices?.[flight.cabinClass] || flight.price?.amount || 0;
        
        // Convert to INR if not already in INR
        let inrPrice = cabinClassPrice;
        if (flight.displayCurrency && flight.displayCurrency !== 'INR') {
          inrPrice = Math.round(CURRENCY_CONFIG.convertPrice(cabinClassPrice, flight.displayCurrency, 'INR'));
        }
        
        return {
          ...flight,
          price: {
            amount: inrPrice,
            currency: 'INR'
          },
          originalDisplayPrice: cabinClassPrice,
          originalDisplayCurrency: flight.displayCurrency,
          cabinClass: flight.cabinClass
        };
      };

      const navigationState = {
        selectedFlights: {
          onward: {
            ...convertToINR(selectedFlights.onward),
            originCode: selectedFlights.onward.origin?.iata_code || selectedFlights.onward.originCode,
            destinationCode: selectedFlights.onward.destination?.iata_code || selectedFlights.onward.destinationCode,
          },
          return: selectedFlights.return ? {
            ...convertToINR(selectedFlights.return),
            originCode: selectedFlights.return.origin?.iata_code || selectedFlights.return.originCode,
            destinationCode: selectedFlights.return.destination?.iata_code || selectedFlights.return.destinationCode,
          } : null
        },
        travellerDetails: filledTravellers,
        contactInfo: {
          email,
          phone
        },
        paymentType: selectedFlights.return ? 'roundtrip' : 'oneway',
        departureDate: bookingState.departureDate || selectedFlights.onward?.departureTime,
        returnDate: bookingState.returnDate || selectedFlights.return?.departureTime,
        previousPage: 'Traveller Details',
        pnr: bookingState.pnr // Pass the PNR through the booking flow
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

  const renderFlightPreview = (flight, isReturn = false) => {
    // Get the user-selected date (not the hardcoded date from JSON)
    const userSelectedDate = isReturn 
      ? (bookingState.returnDate || flight.departureTime)
      : (bookingState.departureDate || flight.departureTime);
    
    // Debug logging
    console.log(`renderFlightPreview (${isReturn ? 'Return' : 'Onward'}):`, {
      userSelectedDate,
      flightDepartureTime: flight.departureTime,
      bookingStateDepartureDate: bookingState?.departureDate,
      bookingStateReturnDate: bookingState?.returnDate
    });
    
    // Extract time from flight.departureTime and combine with user-selected date
    const getDateTimeWithUserDate = (flightDateTime, userDate) => {
      const flightTime = new Date(flightDateTime);
      const selectedDate = new Date(userDate);
      
      // Combine user-selected date with flight time
      selectedDate.setHours(flightTime.getHours());
      selectedDate.setMinutes(flightTime.getMinutes());
      selectedDate.setSeconds(0);
      
      return selectedDate;
    };
    
    const departureDateTime = getDateTimeWithUserDate(flight.departureTime, userSelectedDate);
    const arrivalDateTime = getDateTimeWithUserDate(flight.arrivalTime, userSelectedDate);
    
    console.log(`Final dates for ${isReturn ? 'Return' : 'Onward'}:`, {
      departure: format(departureDateTime, 'MMM dd, yyyy HH:mm'),
      arrival: format(arrivalDateTime, 'MMM dd, yyyy HH:mm')
    });
    
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isReturn ? 'Return Flight' : 'Onward Flight'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">
                {format(departureDateTime, 'HH:mm')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {flight.originCity || flight.origin}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(departureDateTime, 'MMM dd, yyyy')}
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
                {format(arrivalDateTime, 'HH:mm')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {flight.destinationCity || flight.destination}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(arrivalDateTime, 'MMM dd, yyyy')}
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
  };

  const numPassengers = (passengers?.adult || 1) + (passengers?.child || 0) + (passengers?.infant || 0) || travellers.length || 1;

  return (
    <>
      <BookingSteps activeStep={0} />
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
              {/* Random Passenger Details Button */}
              <Box sx={{ mb: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom>
                  Quick Fill
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Fill all passenger details with random data for testing
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleFillRandomDetails}
                  sx={{ mr: 2 }}
                >
                  Fill Random Details
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearAllDetails}
                >
                  Clear All
                </Button>
              </Box>

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
                      inputProps={{ maxLength: 10 }}
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
                      <FormControl fullWidth required error={!!validationErrors.travellers?.[index]?.gender}>
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
                        {validationErrors.travellers?.[index]?.gender && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                            {validationErrors.travellers[index].gender}
                          </Typography>
                        )}
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

              {travellers.length < numPassengers && (
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
                  {selectedFlights?.onward?.isInternational ? (
                    <>
                      {CURRENCY_CONFIG.formatPrice((selectedFlights.onward.displayPrices?.[selectedFlights.onward.cabinClass] || selectedFlights.onward.price.amount) * numPassengers, selectedFlights.onward.displayCurrency)}
                      <Typography component="span" variant="body2" color="textSecondary">
                        ({CURRENCY_CONFIG.formatPrice(selectedFlights.onward.displayPrices?.[selectedFlights.onward.cabinClass] || selectedFlights.onward.price.amount, selectedFlights.onward.displayCurrency)} x {numPassengers} passenger{numPassengers > 1 ? 's' : ''})
                      </Typography>
                    </>
                  ) : (
                    <>
                      ₹{(selectedFlights?.onward?.price?.amount * numPassengers).toLocaleString()}
                      <Typography component="span" variant="body2" color="textSecondary">
                        (₹{selectedFlights?.onward?.price?.amount?.toLocaleString()} x {numPassengers} passenger{numPassengers > 1 ? 's' : ''})
                      </Typography>
                    </>
                  )}
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
                    {selectedFlights?.return?.isInternational ? (
                      <>
                        {CURRENCY_CONFIG.formatPrice((selectedFlights.return.displayPrices?.[selectedFlights.return.cabinClass] || selectedFlights.return.price.amount) * numPassengers, selectedFlights.return.displayCurrency)}
                        <Typography component="span" variant="body2" color="textSecondary">
                          ({CURRENCY_CONFIG.formatPrice(selectedFlights.return.displayPrices?.[selectedFlights.return.cabinClass] || selectedFlights.return.price.amount, selectedFlights.return.displayCurrency)} x {numPassengers} passenger{numPassengers > 1 ? 's' : ''})
                        </Typography>
                      </>
                    ) : (
                      <>
                        ₹{(selectedFlights.return.price.amount * numPassengers).toLocaleString()}
                        <Typography component="span" variant="body2" color="textSecondary">
                          (₹{selectedFlights.return.price.amount?.toLocaleString()} x {numPassengers} passenger{numPassengers > 1 ? 's' : ''})
                        </Typography>
                      </>
                    )}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">Total Price</Typography>
                <Typography variant="subtitle1">
                  {(selectedFlights?.onward?.isInternational || selectedFlights?.return?.isInternational) ? (
                    <>
                      {CURRENCY_CONFIG.formatPrice(
                        ((selectedFlights?.onward?.displayPrices?.[selectedFlights?.onward?.cabinClass] || selectedFlights?.onward?.price?.amount || 0) * numPassengers +
                        (tripType === 'roundtrip' && selectedFlights?.return ? (selectedFlights.return.displayPrices?.[selectedFlights.return.cabinClass] || selectedFlights.return.price.amount || 0) * numPassengers : 0)),
                        selectedFlights?.onward?.displayCurrency || 'USD'
                      )}
                      <Typography component="span" variant="body2" color="textSecondary">
                        ({CURRENCY_CONFIG.formatPrice(
                          ((selectedFlights?.onward?.displayPrices?.[selectedFlights?.onward?.cabinClass] || selectedFlights?.onward?.price?.amount || 0) +
                          (tripType === 'roundtrip' && selectedFlights?.return ? (selectedFlights.return.displayPrices?.[selectedFlights.return.cabinClass] || selectedFlights.return.price.amount || 0) : 0)),
                          selectedFlights?.onward?.displayCurrency || 'USD'
                        )} x {numPassengers} passenger{numPassengers > 1 ? 's' : ''})
                      </Typography>
                    </>
                  ) : (
                    <>
                      ₹{
                        ((selectedFlights?.onward?.price?.amount || 0) * numPassengers +
                        (tripType === 'roundtrip' && selectedFlights?.return ? (selectedFlights.return.price.amount || 0) * numPassengers : 0))
                        .toLocaleString()
                      }
                      <Typography component="span" variant="body2" color="textSecondary">
                        (₹{
                          ((selectedFlights?.onward?.price?.amount || 0) +
                          (tripType === 'roundtrip' && selectedFlights?.return ? (selectedFlights.return.price.amount || 0) : 0))
                          .toLocaleString()} x {numPassengers} passenger{numPassengers > 1 ? 's' : ''})
                      </Typography>
                    </>
                  )}
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
    </>
  );
};

export default TravellerDetails; 