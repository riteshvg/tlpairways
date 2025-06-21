import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tooltip,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LuggageIcon from '@mui/icons-material/Luggage';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LocalAirportIcon from '@mui/icons-material/LocalAirport';
import ForestIcon from '@mui/icons-material/Forest';
import analytics from '../services/analytics';
import airports from '../data/airports.json';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [assignedSeats, setAssignedSeats] = useState({
    onward: [],
    return: []
  });
  const [bookingData, setBookingData] = useState(null);
  const hasFiredBookingConfirmed = useRef(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [treesPlanted, setTreesPlanted] = useState(0);

  const {
    selectedFlights,
    tripType,
    passengers,
    travellerDetails,
    selectedServices,
    paymentDetails
  } = location.state || {};

  // Find the number of passengers
  const numPassengers = (location.state?.passengers || travellerDetails?.length || 1);

  // Generate PNR and ticket numbers
  const generatePNR = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    for (let i = 0; i < 6; i++) {
      pnr += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return pnr;
  };

  const generateTicketNumber = () => {
    const characters = '0123456789';
    let ticket = '';
    for (let i = 0; i < 13; i++) {
      ticket += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return ticket;
  };

  // Generate PNR and ticket numbers once and store them
  const [bookingDetails] = useState(() => ({
    pnr: generatePNR(),
    onwardTicket: generateTicketNumber(),
    returnTicket: tripType === 'roundtrip' ? generateTicketNumber() : null
  }));

  // Use the stored PNR and ticket numbers
  const { pnr, onwardTicket, returnTicket } = bookingDetails;

  // Calculate ancillary services total
  const calculateAncillaryTotal = () => {
    let total = 0;
    console.log('Calculating ancillary total for services:', selectedServices);
    
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
              const seatPrice = (isPremiumRow || isWindowSeat) ? 500 : 100;
              console.log(`Seat price calculation for ${journey}:`, {
                seat,
                row,
                seatType,
                isPremiumRow,
                isWindowSeat,
                seatPrice
              });
              total += seatPrice;
            }
          });
        }
        
        // Baggage cost
        if (selectedServices[journey].baggage) {
          selectedServices[journey].baggage.forEach(baggage => {
            if (baggage && baggage !== 'included') {
              const isInternational = journey === 'onward' ? 
                selectedFlights.onward.origin.iata_code !== selectedFlights.onward.destination.iata_code :
                selectedFlights.return.origin.iata_code !== selectedFlights.return.destination.iata_code;
              const baggagePrice = isInternational ? 2000 : 1000;
              console.log(`Baggage price calculation for ${journey}:`, {
                baggage,
                isInternational,
                baggagePrice
              });
              total += baggagePrice;
            }
          });
        }
        
        // Priority boarding costs
        if (selectedServices[journey].priorityBoarding) {
          selectedServices[journey].priorityBoarding.forEach(priority => {
            if (priority) {
              console.log(`Priority boarding added for ${journey}: 500`);
              total += 500;
            }
          });
        }
        
        // Lounge access costs
        if (selectedServices[journey].loungeAccess) {
          selectedServices[journey].loungeAccess.forEach(lounge => {
            if (lounge) {
              console.log(`Lounge access added for ${journey}: 1500`);
              total += 1500;
            }
          });
        }
      }
    });
    
    console.log('Final ancillary total:', total);
    return total;
  };

  // Calculate fee breakdown
  const calculateFeeBreakdown = () => {
    const baseFare = (selectedFlights.onward.price.amount * numPassengers) + (selectedFlights.return?.price.amount ? selectedFlights.return.price.amount * numPassengers : 0);
    const taxes = Math.round(baseFare * 0.05); // 5% tax
    const convenienceFee = Math.round(baseFare * 0.02); // 2% convenience fee
    const surcharge = Math.round(baseFare * 0.01); // 1% surcharge
    const ancillaryTotal = calculateAncillaryTotal();
    
    return {
      baseFare,
      taxes,
      convenienceFee,
      surcharge,
      ancillaryTotal,
      total: baseFare + taxes + convenienceFee + surcharge + ancillaryTotal
    };
  };

  // Render fee breakdown
  const renderFeeBreakdown = () => {
    const fees = calculateFeeBreakdown();
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Fee Breakdown
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Base Fare</TableCell>
                <TableCell align="right">₹{fees.baseFare.toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Taxes</TableCell>
                <TableCell align="right">₹{fees.taxes.toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Convenience Fee</TableCell>
                <TableCell align="right">₹{fees.convenienceFee.toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Surcharge</TableCell>
                <TableCell align="right">₹{fees.surcharge.toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Ancillary Services</TableCell>
                <TableCell align="right">₹{fees.ancillaryTotal.toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total Amount
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold">
                    ₹{fees.total.toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const getAirportWithCoordinates = (iata_code) => {
    const airport = airports.find(a => a.iata_code === iata_code);
    if (!airport) return null;
    return airport.coordinates ? airport.coordinates : null;
  };

  useEffect(() => {
    if (hasFiredBookingConfirmed.current) return;
    hasFiredBookingConfirmed.current = true;
    // Log the received state for debugging
    console.log('BookingConfirmation received state:', location.state);

    if (!location.state) {
      setError('No booking data found. Please start your booking again.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
      return;
    }

    if (!selectedFlights?.onward) {
      setError('Invalid booking details. Please start your booking again.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
      return;
    }

    // Track booking confirmation
    try {
      // Debug logs for flight data
      console.log('Original flight data:', selectedFlights);
      console.log('Onward flight origin:', selectedFlights.onward.origin);
      console.log('Onward flight destination:', selectedFlights.onward.destination);

      // Inject coordinates from airports.json if missing
      const addCoordinatesIfMissing = (airportObj) => {
        if (airportObj.coordinates && airportObj.coordinates.latitude && airportObj.coordinates.longitude) {
          return airportObj;
        }
        const coords = getAirportWithCoordinates(airportObj.iata_code);
        if (coords) {
          return { ...airportObj, coordinates: coords };
        }
        return airportObj;
      };

      const flightsWithCoordinates = {
        onward: {
          ...selectedFlights.onward,
          origin: addCoordinatesIfMissing(selectedFlights.onward.origin),
          destination: addCoordinatesIfMissing(selectedFlights.onward.destination)
        }
      };
      if (selectedFlights.return) {
        flightsWithCoordinates.return = {
          ...selectedFlights.return,
          origin: addCoordinatesIfMissing(selectedFlights.return.origin),
          destination: addCoordinatesIfMissing(selectedFlights.return.destination)
        };
      }

      // Debug logs for processed flight data
      console.log('Processed flight data with coordinates:', flightsWithCoordinates);
      console.log('Onward flight coordinates:', {
        origin: flightsWithCoordinates.onward.origin.coordinates,
        destination: flightsWithCoordinates.onward.destination.coordinates
      });
      if (flightsWithCoordinates.return) {
        console.log('Return flight coordinates:', {
          origin: flightsWithCoordinates.return.origin.coordinates,
          destination: flightsWithCoordinates.return.destination.coordinates
        });
      }

      analytics.bookingConfirmed({
        flights: flightsWithCoordinates,
        passengers: travellerDetails,
        services: selectedServices,
        payment: {
          method: paymentDetails?.method || 'cash',
          amount: calculateFeeBreakdown().total,
          currency: 'INR',
          status: 'completed'
        },
        totalPrice: calculateFeeBreakdown().total,
        pnr,
        tickets: {
          onward: onwardTicket,
          return: returnTicket
        }
      });

      // Calculate distance using Haversine formula (same as analytics.js)
      const toRad = (value) => (value * Math.PI) / 180;
      const calculateDistance = (origin, destination) => {
        if (!origin?.coordinates || !destination?.coordinates) return 0;
        const lat1 = parseFloat(origin.coordinates.latitude);
        const lon1 = parseFloat(origin.coordinates.longitude);
        const lat2 = parseFloat(destination.coordinates.latitude);
        const lon2 = parseFloat(destination.coordinates.longitude);
        const R = 6371;
        const phi1 = toRad(lat1);
        const phi2 = toRad(lat2);
        const deltaLat = toRad(lat2 - lat1);
        const deltaLon = toRad(lon2 - lon1);
        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                  Math.cos(phi1) * Math.cos(phi2) *
                  Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c);
      };
      const onwardDistance = calculateDistance(
        flightsWithCoordinates.onward.origin,
        flightsWithCoordinates.onward.destination
      );
      const returnDistance = flightsWithCoordinates.return
        ? calculateDistance(
            flightsWithCoordinates.return.origin,
            flightsWithCoordinates.return.destination
          )
        : 0;
      const total = onwardDistance + returnDistance;
      setTotalDistance(total);
      setTreesPlanted(Math.floor(total / 100));
    } catch (error) {
      console.error('Error tracking booking confirmation:', error);
    }
  }, [selectedFlights, tripType, passengers, selectedServices, navigate, pnr, onwardTicket, returnTicket, paymentDetails, location.state]);

  // Helper function to calculate seat price
  const calculateSeatPrice = (seat) => {
    if (!seat) return 0;
    try {
                  const row = parseInt(seat);
                  const seatType = seat.slice(-1);
                  const isPremiumRow = row <= 5;
                  const isWindowSeat = seatType === 'W';
      return (isPremiumRow || isWindowSeat) ? 1500 : 100;
    } catch (error) {
      console.warn('Error calculating seat price:', error);
      return 0;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    return format(date, 'MMM dd, yyyy hh:mm a');
  };

  const renderFlightDetails = (flight, type) => {
    if (!flight) return null;
    
    // Get assigned seats for this flight type
    const seats = type === 'onward' 
      ? selectedServices?.onward?.seat?.filter(Boolean) || []
      : selectedServices?.return?.seat?.filter(Boolean) || [];
    
    console.log('Rendering flight details:', {
      type,
      flight,
      seats,
      selectedServices
    });
    
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {type === 'onward' ? 'Onward Flight' : 'Return Flight'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">
              {flight.origin?.city} → {flight.destination?.city}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(flight.departureTime)} - {flight.flightNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cabin Class: {flight.cabinClass?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">
              Selected Seats
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {seats.length > 0 ? seats.join(', ') : 'No seats selected'}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderAncillaryServices = () => {
    if (!selectedServices) return null;

    const renderServiceChip = (icon, label, price, tooltip) => (
      <Tooltip title={tooltip} arrow>
        <Chip
          icon={icon}
          label={`${label} - ₹${price}`}
          sx={{
            m: 0.5,
            '& .MuiChip-icon': { color: 'primary.main' },
            '& .MuiChip-label': { fontWeight: 'medium' }
          }}
        />
      </Tooltip>
    );

    const calculateSeatPrice = (seat) => {
      if (!seat) return 0;
      try {
        const row = parseInt(seat);
        const seatType = seat.slice(-1);
        const isPremiumRow = row <= 5;
        const isWindowSeat = seatType === 'W';
        return (isPremiumRow || isWindowSeat) ? 500 : 100;
      } catch (error) {
        console.warn('Error calculating seat price:', error);
        return 0;
      }
    };

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Additional Services
        </Typography>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Grid container spacing={2}>
            {/* Onward Flight Services */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Onward Flight
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedServices.onward?.seat?.length > 0 && renderServiceChip(
                  <EventSeatIcon />,
                  'Seats',
                  selectedServices.onward.seat.reduce((total, seat) => total + calculateSeatPrice(seat), 0),
                  `Selected seats: ${selectedServices.onward.seat.join(', ')}`
                )}
                {selectedServices.onward?.baggage?.length > 0 && renderServiceChip(
                  <LuggageIcon />,
                  'Baggage',
                  selectedServices.onward.baggage.reduce((total, baggage) => {
                    if (baggage && baggage !== 'included') {
                      const isInternational = selectedFlights?.onward?.origin?.iata_code !== selectedFlights?.onward?.destination?.iata_code;
                      return total + (isInternational ? 2000 : 1000);
                    }
                    return total;
                  }, 0),
                  `Selected baggage: ${selectedServices.onward.baggage.filter(b => b && b !== 'included').join(', ')}`
                )}
                {selectedServices.onward?.priorityBoarding?.length > 0 && renderServiceChip(
                  <PriorityHighIcon />,
                  'Priority',
                  selectedServices.onward.priorityBoarding.filter(Boolean).length * 500,
                  'Priority Boarding'
                )}
                {selectedServices.onward?.loungeAccess?.length > 0 && renderServiceChip(
                  <LocalAirportIcon />,
                  'Lounge',
                  selectedServices.onward.loungeAccess.filter(Boolean).length * 1500,
                  'Lounge Access'
                )}
              </Box>
            </Grid>

            {/* Return Flight Services */}
            {selectedServices.return && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Return Flight
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedServices.return?.seat?.length > 0 && renderServiceChip(
                    <EventSeatIcon />,
                    'Seats',
                    selectedServices.return.seat.reduce((total, seat) => total + calculateSeatPrice(seat), 0),
                    `Selected seats: ${selectedServices.return.seat.join(', ')}`
                  )}
                  {selectedServices.return?.baggage?.length > 0 && renderServiceChip(
                    <LuggageIcon />,
                    'Baggage',
                    selectedServices.return.baggage.reduce((total, baggage) => {
                      if (baggage && baggage !== 'included') {
                        const isInternational = selectedFlights?.return?.origin?.iata_code !== selectedFlights?.return?.destination?.iata_code;
                        return total + (isInternational ? 2000 : 1000);
                      }
                      return total;
                    }, 0),
                    `Selected baggage: ${selectedServices.return.baggage.filter(b => b && b !== 'included').join(', ')}`
                  )}
                  {selectedServices.return?.priorityBoarding?.length > 0 && renderServiceChip(
                    <PriorityHighIcon />,
                    'Priority',
                    selectedServices.return.priorityBoarding.filter(Boolean).length * 500,
                    'Priority Boarding'
                  )}
                  {selectedServices.return?.loungeAccess?.length > 0 && renderServiceChip(
                    <LocalAirportIcon />,
                    'Lounge',
                    selectedServices.return.loungeAccess.filter(Boolean).length * 1500,
                    'Lounge Access'
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    );
  };

  const renderPaymentDetails = () => {
    console.log('Payment Details:', paymentDetails);
    
    if (!paymentDetails) {
      console.warn('No payment details available');
      return null;
    }

    const getPaymentMethodDisplay = () => {
      if (!paymentDetails.method) {
        console.warn('No payment method specified');
        return 'Not specified';
      }
      
      const method = paymentDetails.method.toLowerCase();
      console.log('Payment method:', method);
      
      switch (method) {
        case 'credit':
          return 'Credit Card';
        case 'debit':
          return 'Debit Card';
        case 'upi':
          return 'UPI';
        case 'netbanking':
          return 'Net Banking';
        default:
          return paymentDetails.method;
      }
    };

    // Get the total from calculateFeeBreakdown
    const { total } = calculateFeeBreakdown();

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Details
        </Typography>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Payment Method</Typography>
              <Typography variant="body2" color="text.secondary">
                {getPaymentMethodDisplay()}
              </Typography>
              {paymentDetails.method?.toLowerCase() === 'upi' && paymentDetails.upiId && (
                <Typography variant="body2" color="text.secondary">
                  UPI ID: {paymentDetails.upiId}
                </Typography>
              )}
              {paymentDetails.method?.toLowerCase() === 'netbanking' && paymentDetails.bank && (
                <Typography variant="body2" color="text.secondary">
                  Bank: {paymentDetails.bank}
                </Typography>
              )}
              {(paymentDetails.method?.toLowerCase() === 'credit' || paymentDetails.method?.toLowerCase() === 'debit') && paymentDetails.cardNumber && (
                <Typography variant="body2" color="text.secondary">
                  Card: {paymentDetails.cardNumber}
                </Typography>
              )}
              {paymentDetails.transactionId && (
                <Typography variant="body2" color="text.secondary">
                  Transaction ID: {paymentDetails.transactionId}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Amount Paid</Typography>
              <Typography variant="h6" color="primary">
                ₹{total.toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paid on: {formatDate(paymentDetails.paymentDate || new Date())}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

  const handleNewBooking = () => {
    navigate('/');
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Typography>Redirecting to home page...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
          <Typography variant="h4" gutterBottom>
            Booking Confirmed!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your booking has been successfully confirmed
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Booking Reference
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">PNR Number</Typography>
              <Typography variant="h5" color="primary">
                {pnr}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Ticket Number</Typography>
              <Typography variant="h5" color="primary">
                {onwardTicket}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Trees Planted and Distance Section */}
        <Box sx={{ mb: 4, textAlign: 'center', bgcolor: 'success.light', borderRadius: 2, p: 3, color: 'success.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            <ForestIcon sx={{ verticalAlign: 'middle', color: 'success.main', mr: 1 }} />
            Sustainability Impact
          </Typography>
          <Typography variant="body1">
            Your journey covers <b>{totalDistance.toLocaleString()} km</b> and will help plant <b>{treesPlanted}</b> tree{treesPlanted !== 1 ? 's' : ''}!
          </Typography>
        </Box>

        {selectedFlights?.onward && renderFlightDetails(selectedFlights.onward, 'onward')}
        {selectedFlights?.return && renderFlightDetails(selectedFlights.return, 'return')}

        {renderAncillaryServices()}
        {renderPaymentDetails()}

        {renderFeeBreakdown()}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => window.print()}
            startIcon={<PrintIcon />}
          >
            Print Ticket
          </Button>
          <Button
            variant="outlined"
            onClick={handleNewBooking}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingConfirmation; 