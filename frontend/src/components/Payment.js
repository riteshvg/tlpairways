import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import usePageView from '../hooks/usePageView';
import { createHashedCustomerObject } from '../utils/hashingUtils';
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
import BookingSteps from './BookingSteps';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Track page view with payment-specific context
  usePageView({
    pageCategory: 'booking',
    bookingStep: 'payment',
    sections: ['payment-form', 'price-breakdown', 'security-info']
  });

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
    paymentType: initialPaymentType = 'cash', // Payment mode: cash, points, cash_points
    tripType: initialTripType = 'oneway', // Trip type: oneway, roundtrip
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
  const [tripType, setTripType] = useState(initialTripType);
  const [cabinClass, setCabinClass] = useState(initialCabinClass);
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [paymentVendor, setPaymentVendor] = useState('');
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

  // Payment vendors/networks by type
  const paymentVendors = {
    credit: ['Visa', 'Mastercard', 'American Express', 'Diners Club', 'RuPay'],
    debit: ['Visa Debit', 'Mastercard Debit', 'RuPay Debit', 'Maestro'],
    netbanking: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank', 
                  'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank', 'IDBI Bank'],
    upi: ['UPI']
  };

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
      flightTotal, ancillaryTotal, totalAmount, paymentType, tripType, cabinClass, navigate]);

  // Reset vendor when payment method changes
  useEffect(() => {
    setPaymentVendor('');
  }, [paymentMethod]);

  const validateForm = () => {
    const errors = {};
    
    // Vendor validation for all payment methods
    if (!paymentVendor || paymentVendor.trim() === '') {
      errors.paymentVendor = 'Please select a payment vendor';
    }
    
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
    } else if (paymentMethod === 'upi') {
      if (!billingName || billingName.trim().length < 3) {
        errors.billingName = 'Please enter a valid UPI ID';
      }
    }
    // Net Banking only requires vendor selection (no billing name needed)
    
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
        vendor: paymentVendor,
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

      // Push payment details to Adobe Data Layer
      if (typeof window !== 'undefined' && window.adobeDataLayer) {
        const paymentDetails = {
          paymentMethod: paymentMethod,
          paymentVendor: paymentVendor,
          cardNetwork: paymentMethod === 'credit' || paymentMethod === 'debit' ? paymentVendor : null,
          bankName: paymentMethod === 'netbanking' ? paymentVendor : null,
          upiId: paymentMethod === 'upi' ? billingName : null,
          cardLast4: cardNumber ? cardNumber.slice(-4) : null,
          expiryDate: expiryDate || null,
          amount: totalAmount,
          currency: 'INR',
          transactionId: paymentData.transactionId,
          paymentDate: paymentData.paymentDate
        };

        window.adobeDataLayer.push({
          event: 'paymentSubmitted',
          paymentDetails: paymentDetails,
          customer: createHashedCustomerObject({
            userId: travellerDetails[0]?.email || null,
            email: travellerDetails[0]?.email || null,
            phone: travellerDetails[0]?.phone || null,
            loyaltyTier: 'standard'
          }),
          timestamp: new Date().toISOString()
        });

        console.log('✅ Payment details pushed to adobeDataLayer:', paymentDetails);
      }

      // Debug: Log what we're passing to confirmation
      console.log('🔍 Payment - Navigation State Debug:', {
        paymentTypeBeingPassed: initialPaymentType,
        tripTypeBeingPassed: tripType,
        paymentMethod: paymentData.method,
        bookingStatePaymentType: bookingState?.paymentType
      });

      // Navigate to confirmation
      navigate('/confirmation', {
        state: {
          selectedFlights,
          travellerDetails,
          contactInfo,
          selectedServices,
          paymentDetails: paymentData,
          paymentType: initialPaymentType, // Payment mode: cash, points, cash_points
          totalAmount,
          cabinClass,
          departureDate: initialDepartureDate,
          returnDate: initialReturnDate,
          tripType: tripType, // Trip type: oneway, roundtrip
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

    // Get user-selected date
    const userDate = type === 'onward' ? initialDepartureDate : initialReturnDate;

    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {type === 'onward' ? 'Onward Flight' : 'Return Flight'}
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Airline</Typography>
            <Typography variant="body2" fontWeight="medium">{flight.airline || 'TL Airways'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Flight</Typography>
            <Typography variant="body2" fontWeight="medium">{flight.flightNumber}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">Route</Typography>
            <Typography variant="body2" fontWeight="medium">
              {flight.originCity || flight.origin} ({flight.origin}) → {flight.destinationCity || flight.destination} ({flight.destination})
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Date</Typography>
            <Typography variant="body2">{userDate ? format(new Date(userDate), 'MMM dd, yyyy') : 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Time</Typography>
            <Typography variant="body2">
              {typeof flight.departureTime === 'string' 
                ? flight.departureTime 
                : (flight.departureTime ? format(new Date(flight.departureTime), 'HH:mm') : 'N/A')}
              {' - '}
              {typeof flight.arrivalTime === 'string' 
                ? flight.arrivalTime 
                : (flight.arrivalTime ? format(new Date(flight.arrivalTime), 'HH:mm') : 'N/A')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Duration</Typography>
            <Typography variant="body2">{flight.duration}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Cabin</Typography>
            <Typography variant="body2">{(flight.cabinClass || cabinClass)?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Aircraft</Typography>
            <Typography variant="body2">{flight.aircraftType || flight.aircraft || 'Aircraft'}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 1.5 }} />
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
    <>
      <BookingSteps activeStep={2} />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
        {/* Payment Summary - Display on RIGHT */}
        <Grid item xs={12} md={4} sx={{ order: { xs: 1, md: 2 } }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Payment Summary
            </Typography>
            {selectedFlights.onward && renderFlightDetails(selectedFlights.onward, 'onward')}
            {tripType === 'roundtrip' && selectedFlights.return && renderFlightDetails(selectedFlights.return, 'return')}

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

              {/* Payment Vendor/Network Selection */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth required error={!!validationErrors.paymentVendor}>
                  <InputLabel>
                    {paymentMethod === 'credit' ? 'Card Network' :
                     paymentMethod === 'debit' ? 'Card Network' :
                     paymentMethod === 'netbanking' ? 'Select Bank' :
                     'Payment Method'}
                  </InputLabel>
                  <Select
                    value={paymentVendor}
                    label={
                      paymentMethod === 'credit' ? 'Card Network' :
                      paymentMethod === 'debit' ? 'Card Network' :
                      paymentMethod === 'netbanking' ? 'Select Bank' :
                      'Payment Method'
                    }
                    onChange={(e) => setPaymentVendor(e.target.value)}
                  >
                    {paymentVendors[paymentMethod]?.map((vendor) => (
                      <MenuItem key={vendor} value={vendor}>
                        {vendor}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.paymentVendor && (
                    <FormHelperText>{validationErrors.paymentVendor}</FormHelperText>
                  )}
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
                  label="UPI ID"
                  placeholder="example@upi"
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  error={!!validationErrors.billingName}
                  helperText={validationErrors.billingName || "Enter your UPI ID (e.g., name@upi)"}
                  required
                />
              ) : paymentMethod === 'netbanking' ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    You will be redirected to your selected bank's secure payment gateway to complete the transaction.
                  </Typography>
                </Alert>
              ) : null}

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
    </>
  );
};

export default Payment; 