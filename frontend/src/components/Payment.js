import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import usePageView from '../hooks/usePageView';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Button,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  CircularProgress,
  Snackbar,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  FormLabel,
} from '@mui/material';
import { format, isValid, parseISO } from 'date-fns';
import CURRENCY_CONFIG from '../config/currencyConfig';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Track page view with payment-specific context
  usePageView({
    pageCategory: 'booking',
    bookingStep: 'payment',
    sections: ['payment-form', 'price-breakdown', 'security-info']
  });

  // Add pageView event to data layer
  useEffect(() => {
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push({
        event: 'pageView',
        pageName: 'Payment',
        pageCategory: 'booking',
        bookingStep: 'payment',
        pageType: 'payment',
        sections: ['payment-form', 'price-breakdown', 'security-info'],
        timestamp: new Date().toISOString()
      });
    }
  }, []);

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

  // Extract all required data from booking state with defaults
  const { 
    selectedFlights: initialFlights,
    travellerDetails: initialTravellerDetails = [],
    contactInfo: initialContactInfo = null,
    selectedServices: initialSelectedServices = {},
    flightTotal: initialFlightTotal = 0,
    ancillaryTotal: initialAncillaryTotal = 0,
    totalAmount: initialTotalAmount = 0,
    paymentType: initialPaymentType = 'oneway',
    cabinClass: initialCabinClass = 'economy',
    departureDate: initialDepartureDate = null,
    returnDate: initialReturnDate = null
  } = bookingState || {};

  // State management
  const [selectedFlights, setSelectedFlights] = useState(initialFlights || {
    onward: null,
    return: null
  });
  const [travellerDetails, setTravellerDetails] = useState(initialTravellerDetails);
  const [contactInfo, setContactInfo] = useState(initialContactInfo);
  const [selectedServices, setSelectedServices] = useState(initialSelectedServices);
  const [flightTotal, setFlightTotal] = useState(initialFlightTotal);
  const [ancillaryTotal, setAncillaryTotal] = useState(initialAncillaryTotal);
  const [totalAmount, setTotalAmount] = useState(initialTotalAmount);
  const [paymentType, setPaymentType] = useState(initialPaymentType);
  const [cabinClass, setCabinClass] = useState(initialCabinClass);
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingName, setBillingName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZipCode, setBillingZipCode] = useState('');
  const [billingCountry, setBillingCountry] = useState('');
  
  // UI state
  const [paymentError, setPaymentError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize component and track page view
  useEffect(() => {
    if (bookingState) {
      // Clear restored state after using it
      if (!location.state && sessionStorage.getItem('restored_booking_state')) {
        sessionStorage.removeItem('restored_booking_state');
      }
      
      const { previousPage } = bookingState;
      
      // Track page view with complete booking details
      // analytics.pageView('Payment', previousPage, {
      //   flights: selectedFlights,
      //   passengers: travellerDetails,
      //   contactInfo,
      //   services: selectedServices,
      //   flightTotal,
      //   ancillaryTotal,
      //   totalAmount,
      //   paymentType,
      //   cabinClass
      // });

      // Log the received state for debugging
      console.log('Payment page received state:', {
        selectedFlights,
        flightTotal,
        ancillaryTotal,
        totalAmount
      });
    } else {
      console.error('No booking state found in location or sessionStorage');
      console.error('Redirecting to search due to missing state');
      navigate('/search');
    }
  }, [bookingState, selectedFlights, travellerDetails, contactInfo, selectedServices, 
      flightTotal, ancillaryTotal, totalAmount, paymentType, cabinClass, navigate]);

  const validateForm = () => {
    const errors = {};
    if (paymentMethod === 'credit' || paymentMethod === 'debit') {
      if (!cardNumber || !/^\d{16}$/.test(cardNumber)) {
        errors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      if (!billingName || billingName.trim().length < 3) {
        errors.billingName = 'Please enter a valid billing name';
      }
      if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      }
      if (!cvv || !/^\d{3,4}$/.test(cvv)) {
        errors.cvv = 'Please enter a valid CVV';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentData = {
        method: paymentMethod,
        paymentMethod: paymentMethod,
        cardDetails: {
          cardNumber,
          expiryDate,
          cvv
        },
        billingAddress: {
          name: billingName,
          address: billingAddress,
          city: billingCity,
          state: billingState,
          zipCode: billingZipCode,
          country: billingCountry
        },
        amount: totalAmount,
        paymentDate: new Date().toISOString(),
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };

      // Track payment completion
      // Analytics call removed

      // Navigate to confirmation
      navigate('/confirmation', {
        state: {
          selectedFlights,
          travellerDetails,
          contactInfo,
          selectedServices,
          paymentDetails: paymentData,
          totalAmount,
          cabinClass,
          departureDate: initialDepartureDate,
          returnDate: initialReturnDate,
          tripType: paymentType,
          passengers: bookingState?.passengers,
          previousPage: 'Payment',
          pnr: bookingState?.pnr // Pass the PNR to confirmation page
        }
      });
    } catch (error) {
      console.error('Payment processing failed:', error);
      setPaymentError('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderFlightDetails = (flight, type) => {
    if (!flight) return null;

    const numPassengers = travellerDetails.length || 1;
    const isInternational = flight.isInternational;
    const displayPrice = flight.displayPrices?.[cabinClass] || flight.prices?.[cabinClass] || flight.price.amount;
    const originalPrice = flight.originalPrices?.[cabinClass] || flight.prices?.[cabinClass] || flight.price.amount;
    const totalDisplayPrice = displayPrice * numPassengers;
    const totalOriginalPrice = originalPrice * numPassengers;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {type === 'onward' ? 'Onward Flight' : 'Return Flight'}
        </Typography>
        <Typography>
          {flight.airline} {flight.flightNumber}
        </Typography>
        <Typography>
          {(() => {
            let dateToShow = flight.departureTime;
            if (type === 'onward' && initialDepartureDate) {
              dateToShow = initialDepartureDate;
            } else if (type === 'return' && initialReturnDate) {
              dateToShow = initialReturnDate;
            }
            return `${format(new Date(dateToShow), 'MMM dd, yyyy')} ${format(new Date(flight.departureTime), 'HH:mm')} - ${format(new Date(flight.arrivalTime), 'HH:mm')}`;
          })()}
        </Typography>
        <Typography>
          {flight.origin?.iata_code || 'N/A'} → {flight.destination?.iata_code || 'N/A'}
        </Typography>
        <Typography>
          Cabin Class: {flight.cabinClass || cabinClass}
        </Typography>
        <Typography>
          {isInternational ? (
            <>
              Display Price: {CURRENCY_CONFIG.formatPrice(totalDisplayPrice, flight.displayCurrency)}
              <br />
              <Typography component="span" variant="body2" color="textSecondary">
                Payment Amount: ₹{totalOriginalPrice.toLocaleString()}
              </Typography>
            </>
          ) : (
            `Fare: ₹${totalOriginalPrice.toLocaleString()}`
          )}
        </Typography>
      </Box>
    );
  };

  // Calculate ancillary services total
  const calculateAncillaryTotal = () => {
    let total = 0;
    ['onward', 'return'].forEach(journey => {
      if (selectedServices?.[journey]) {
        // Seat costs
        if (selectedServices[journey].seat) {
        selectedServices[journey].seat.forEach(seat => {
          if (seat) {
            const row = parseInt(seat);
            const seatType = seat.slice(-1);
            const isPremiumRow = row <= 5;
            const isWindowSeat = seatType === 'W';
              total += (isPremiumRow || isWindowSeat) ? 500 : 100;
          }
        });
      }

        // Baggage cost
        if (selectedServices[journey].baggage) {
        selectedServices[journey].baggage.forEach(baggage => {
          if (baggage && baggage !== 'included') {
              const flight = selectedFlights[journey];
              if (flight?.origin?.iata_code && flight?.destination?.iata_code) {
                const isInternational = flight.origin.iata_code !== flight.destination.iata_code;
                total += isInternational ? 2000 : 1000;
              } else {
                // Default to domestic if flight data is missing
                total += 1000;
              }
          }
        });
      }

        // Priority boarding costs
        if (selectedServices[journey].priorityBoarding) {
        selectedServices[journey].priorityBoarding.forEach(priority => {
            if (priority) total += 500;
        });
      }

        // Lounge access costs
        if (selectedServices[journey].loungeAccess) {
        selectedServices[journey].loungeAccess.forEach(lounge => {
            if (lounge) total += 1500;
          });
          }
      }
    });
    return total;
  };

  // Calculate total price including flight fares and ancillary services
  const calculateTotalPrice = () => {
    let total = 0;
    const numPassengers = travellerDetails.length || 1;

    // Calculate flight costs
    if (selectedFlights.onward) {
      // Use original INR prices for payment calculation
      const onwardPrice = selectedFlights.onward.originalPrices?.[cabinClass] || 
                         selectedFlights.onward.prices?.[cabinClass] || 
                         selectedFlights.onward.price.amount;
      total += onwardPrice * numPassengers;
    }

    if (selectedFlights.return) {
      // Use original INR prices for payment calculation
      const returnPrice = selectedFlights.return.originalPrices?.[cabinClass] || 
                         selectedFlights.return.prices?.[cabinClass] || 
                         selectedFlights.return.price.amount;
      total += returnPrice * numPassengers;
    }

    // Calculate ancillary costs
    const ancillaryTotal = calculateAncillaryTotal();
    
    // Calculate fees and taxes on base fare only (matching Ancillary Services page)
    const baseFare = total;
    const taxes = Math.round(baseFare * 0.05);
    const convenienceFee = Math.round(baseFare * 0.02);
    const surcharge = Math.round(baseFare * 0.01);
    const totalFees = taxes + convenienceFee + surcharge;
    
    // Add ancillary costs and fees
    total += ancillaryTotal + totalFees;

    return {
      baseFare: (selectedFlights.onward ? (selectedFlights.onward.originalPrices?.[cabinClass] || selectedFlights.onward.prices?.[cabinClass] || selectedFlights.onward.price.amount) * numPassengers : 0) +
                (selectedFlights.return ? (selectedFlights.return.originalPrices?.[cabinClass] || selectedFlights.return.prices?.[cabinClass] || selectedFlights.return.price.amount) * numPassengers : 0),
      ancillaryTotal,
      taxes,
      convenienceFee,
      surcharge,
      totalFees,
      total
    };
  };

  // Get price breakdown
  const priceBreakdown = calculateTotalPrice();

  // Update total amount whenever relevant values change
  useEffect(() => {
    const newTotal = calculateTotalPrice().total;
    setTotalAmount(newTotal);
  }, [flightTotal, selectedServices]);

  // Log price calculations for debugging
  useEffect(() => {
    console.log('Price calculations:', {
      flightTotal,
      ancillaryTotal: calculateAncillaryTotal(),
      totalAmount,
      priceBreakdown
    });
  }, [flightTotal, selectedServices, totalAmount]);

  // Find the number of passengers
  const numPassengers = travellerDetails.length || 1;

  // Check if any flight is international for display purposes
  const hasInternationalFlight = selectedFlights.onward?.isInternational || selectedFlights.return?.isInternational;

  if (paymentError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{paymentError}</Typography>
        <Typography>Redirecting to home page...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Payment Summary - Display on RIGHT */}
        <Grid item xs={12} md={4} sx={{ order: { xs: 1, md: 2 } }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Payment Summary
            </Typography>
            {selectedFlights.onward && renderFlightDetails(selectedFlights.onward, 'onward')}
            {paymentType === 'roundtrip' && selectedFlights.return && renderFlightDetails(selectedFlights.return, 'return')}

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Price Breakdown
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Base Fare</Typography>
                <Typography>
                  ₹{(priceBreakdown.baseFare || 0).toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Taxes (5%)</Typography>
                <Typography>
                  ₹{(priceBreakdown.taxes || 0).toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Convenience Fee (2%)</Typography>
                <Typography>
                  ₹{(priceBreakdown.convenienceFee || 0).toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Surcharge (1%)</Typography>
                <Typography>
                  ₹{(priceBreakdown.surcharge || 0).toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Ancillary Services</Typography>
                <Typography>
                  ₹{(priceBreakdown.ancillaryTotal || 0).toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">Total Amount</Typography>
                <Typography variant="subtitle1">
                  ₹{priceBreakdown.total.toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Payment Form - Display on LEFT */}
        <Grid item xs={12} md={8} sx={{ order: { xs: 2, md: 1 } }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              Payment Details
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Choose your preferred payment method
            </Typography>

            <form onSubmit={handlePaymentSubmit}>
              <Box sx={{ mb: 4 }}>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <FormControlLabel
                      value="credit"
                      control={<Radio />}
                      label="Credit Card"
                    />
                    <FormControlLabel
                      value="debit"
                      control={<Radio />}
                      label="Debit Card"
                    />
                    <FormControlLabel
                      value="upi"
                      control={<Radio />}
                      label="UPI"
                    />
                    <FormControlLabel
                      value="netbanking"
                      control={<Radio />}
                      label="Net Banking"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>

              {paymentMethod === 'credit' || paymentMethod === 'debit' ? (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      error={!!validationErrors.cardNumber}
                      helperText={validationErrors.cardNumber}
                      inputProps={{ maxLength: 16 }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Billing Name"
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      error={!!validationErrors.billingName}
                      helperText={validationErrors.billingName}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      error={!!validationErrors.expiryDate}
                      helperText={validationErrors.expiryDate}
                      inputProps={{ maxLength: 5 }}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      error={!!validationErrors.cvv}
                      helperText={validationErrors.cvv}
                      inputProps={{ maxLength: 4 }}
                      required
                    />
                  </Grid>
                </Grid>
              ) : paymentMethod === 'upi' ? (
                <TextField
                  fullWidth
                  label="Billing Name"
                  placeholder="example@upi"
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  error={!!validationErrors.billingName}
                  helperText={validationErrors.billingName || "Enter your UPI ID (e.g., name@upi)"}
                  required
                />
              ) : (
                <FormControl fullWidth required error={!!validationErrors.billingName}>
                  <InputLabel>Billing Name</InputLabel>
                  <Select
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value)}
                    label="Select Bank"
                  >
                    <MenuItem value="sbi">State Bank of India</MenuItem>
                    <MenuItem value="hdfc">HDFC Bank</MenuItem>
                    <MenuItem value="icici">ICICI Bank</MenuItem>
                    <MenuItem value="axis">Axis Bank</MenuItem>
                  </Select>
                </FormControl>
              )}

              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/ancillary-services')}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading
                    ? 'Processing...'
                    : `Pay ₹${priceBreakdown.total.toLocaleString()}`}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={!!paymentError}
        autoHideDuration={6000}
        onClose={() => setPaymentError('')}
        message={paymentError}
      />
    </Container>
  );
};

export default Payment; 