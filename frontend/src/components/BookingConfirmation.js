import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import usePageView from '../hooks/usePageView';
import airlinesDataLayer from '../services/AirlinesDataLayer';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip,
  Tooltip,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LuggageIcon from '@mui/icons-material/Luggage';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LocalAirportIcon from '@mui/icons-material/LocalAirport';
import ForestIcon from '@mui/icons-material/Forest';
import airports from '../data/airports.json';

// Helper function to find airport by code in the new structure
const findAirportByCode = (code) => {
  for (const cityData of airports.airports) {
    const airport = cityData.airports.find(a => a.code === code);
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

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Track page view with confirmation-specific context
  usePageView({
    pageCategory: 'booking',
    bookingStep: 'confirmation',
    sections: ['confirmation-details', 'booking-summary', 'next-steps'],
    bookingId: location.state?.bookingId || null
  });
  
  const [error, setError] = useState('');
  const hasFiredBookingConfirmed = useRef(false);
  const hasFiredPurchaseEvent = useRef(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [treesPlanted, setTreesPlanted] = useState(0);
  
  // State for tracking user interactions
  const [bookingReference, setBookingReference] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [emailRequested, setEmailRequested] = useState(false);
  const [smsRequested, setSmsRequested] = useState(false);

  const {
    selectedFlights,
    tripType,
    passengers,
    travellerDetails,
    selectedServices,
    paymentDetails,
    contactInfo
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
    const airport = findAirportByCode(iata_code);
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

      // analytics.bookingConfirmed({
      //   flights: flightsWithCoordinates,
      //   passengers: travellerDetails,
      //   services: selectedServices,
      //   payment: {
      //     method: paymentDetails?.method || 'cash',
      //     amount: calculateFeeBreakdown().total,
      //     currency: 'INR',
      //     status: 'completed'
      //   },
      //   totalPrice: calculateFeeBreakdown().total,
      //   pnr,
      //   tickets: {
      //     onward: onwardTicket,
      //     return: returnTicket
      //   }
      // });

      // Calculate distance using Haversine formula (same as // analytics.js)
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

  // Comprehensive data layer implementation for confirmation page
  useEffect(() => {
    if (!selectedFlights?.onward || !travellerDetails) return;
    
    // Prevent duplicate purchase events
    if (hasFiredPurchaseEvent.current) return;
    hasFiredPurchaseEvent.current = true;

    // Generate booking reference and transaction ID
    const bookingRef = airlinesDataLayer.generateBookingReference();
    const txnId = airlinesDataLayer.generateTransactionId();
    setBookingReference(bookingRef);
    setTransactionId(txnId);

    // Calculate distance and sustainability first
    let calculatedDistance = 0;
    let calculatedTrees = 0;
    try {
      const calculateFlightDistance = (origin, destination) => {
        if (!origin || !destination) return 0;
        const R = 6371; // Earth's radius in km
        const lat1 = origin[0] * Math.PI / 180;
        const lat2 = destination[0] * Math.PI / 180;
        const dLat = (destination[0] - origin[0]) * Math.PI / 180;
        const dLon = (destination[1] - origin[1]) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      const getCoordinates = (airportCode) => {
        const airport = findAirportByCode(airportCode);
        if (airport?.coordinates) {
          return [airport.coordinates.latitude, airport.coordinates.longitude];
        }
        return null;
      };

      const onwardOriginCoords = getCoordinates(selectedFlights.onward?.origin?.iata_code);
      const onwardDestCoords = getCoordinates(selectedFlights.onward?.destination?.iata_code);
      const onwardDistance = onwardOriginCoords && onwardDestCoords 
        ? calculateFlightDistance(onwardOriginCoords, onwardDestCoords) 
        : 0;

      const returnOriginCoords = getCoordinates(selectedFlights.return?.origin?.iata_code);
      const returnDestCoords = getCoordinates(selectedFlights.return?.destination?.iata_code);
      const returnDistance = tripType === 'roundtrip' && returnOriginCoords && returnDestCoords
        ? calculateFlightDistance(returnOriginCoords, returnDestCoords)
        : 0;

      calculatedDistance = onwardDistance + returnDistance;
      calculatedTrees = Math.floor(calculatedDistance / 100);
      
      console.log('✅ Distance calculated:', {
        onwardDistance,
        returnDistance,
        calculatedDistance,
        calculatedTrees,
        onwardOriginCoords,
        onwardDestCoords,
        returnOriginCoords,
        returnDestCoords
      });
      
      // Update state for UI display
      setTotalDistance(calculatedDistance);
      setTreesPlanted(calculatedTrees);
    } catch (error) {
      console.error('Error calculating distance:', error);
    }

    // Calculate revenue data
    const feeBreakdown = calculateFeeBreakdown();
    const ancillaryTotal = calculateAncillaryTotal();

    // Set page data with confirmation page type
    airlinesDataLayer.setPageDataWithView({
      pageType: 'confirmation',
      pageName: 'Booking Confirmation',
      pageCategory: 'booking',
      bookingStep: 'confirmation',
      sections: ['booking-details', 'passenger-info', 'price-breakdown', 'next-steps'],
      bookingReference: bookingRef,
      transactionId: txnId
    });

    // PageView event is handled by usePageView hook
    // Removed manual pageView push to prevent duplicates
    if (false && typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push({
        event: 'pageView',
        pageData: {
          pageType: 'confirmation',
          pageName: 'Booking Confirmation - TLP Airways',
          pageURL: window.location.href,
          referrer: document.referrer,
          previousPage: 'Payment',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
          pageCategory: 'booking',
          bookingStep: 'confirmation',
          bookingStepNumber: 4,
          totalBookingSteps: 4,
          sections: ['booking-summary', 'passenger-details', 'flight-details', 'ancillary-services', 'payment-summary', 'confirmation-actions']
        },
        bookingContext: {
          bookingId: txnId,
          pnr: bookingRef,
          bookingStatus: 'confirmed',
          bookingStep: 'confirmation',
          bookingStepNumber: 4,
          totalSteps: 4,
          bookingSteps: ['passenger-details', 'ancillary-services', 'payment', 'confirmation'],
          bookingStartTime: new Date().toISOString(),
          selectedFlights: {
            outbound: {
              flightNumber: selectedFlights.onward?.flightNumber,
              airline: selectedFlights.onward?.airline,
              origin: selectedFlights.onward?.origin?.iata_code,
              destination: selectedFlights.onward?.destination?.iata_code,
              departureTime: selectedFlights.onward?.departureTime,
              departureDate: selectedFlights.onward?.departureTime ? new Date(selectedFlights.onward.departureTime).toISOString().split('T')[0] : null,
              arrivalTime: selectedFlights.onward?.arrivalTime,
              arrivalDate: selectedFlights.onward?.arrivalTime ? new Date(selectedFlights.onward.arrivalTime).toISOString().split('T')[0] : null,
              cabinClass: selectedFlights.onward?.cabinClass || 'economy',
              price: selectedFlights.onward?.price?.amount || 0
            },
            return: selectedFlights.return ? {
              flightNumber: selectedFlights.return?.flightNumber,
              airline: selectedFlights.return?.airline,
              origin: selectedFlights.return?.origin?.iata_code,
              destination: selectedFlights.return?.destination?.iata_code,
              departureTime: selectedFlights.return?.departureTime,
              departureDate: selectedFlights.return?.departureTime ? new Date(selectedFlights.return.departureTime).toISOString().split('T')[0] : null,
              arrivalTime: selectedFlights.return?.arrivalTime,
              arrivalDate: selectedFlights.return?.arrivalTime ? new Date(selectedFlights.return.arrivalTime).toISOString().split('T')[0] : null,
              cabinClass: selectedFlights.return?.cabinClass || 'economy',
              price: selectedFlights.return?.price?.amount || 0
            } : null
          },
          passengers: travellerDetails || [],
          contactInfo: contactInfo || {},
          tripType: tripType || 'oneWay',
          pricing: {
            baseFare: feeBreakdown.baseFare,
            ancillaryTotal: feeBreakdown.ancillaryTotal,
            taxes: feeBreakdown.taxes,
            convenienceFee: feeBreakdown.convenienceFee,
            surcharge: feeBreakdown.surcharge,
            total: feeBreakdown.total,
            currency: 'INR'
          }
        },
        userContext: {
          userAuthenticated: true,
          userId: travellerDetails[0]?.email || null,
          userEmail: travellerDetails[0]?.email || null,
          userLoyaltyTier: 'standard',
          sessionId: `session_${Date.now()}`
        }
      });
      console.log('✅ Confirmation PageView event pushed to adobeDataLayer');
    }
    
    // Build products array for revenue tracking
    const products = [];
    
    // Add flight products
    if (selectedFlights.onward) {
      products.push({
        productId: 'flight',
        productName: `Flight ${selectedFlights.onward.flightNumber}`,
        category: 'flight',
        subcategory: 'onward',
        price: (selectedFlights.onward.price?.amount || 0) * numPassengers,
        quantity: numPassengers,
        currency: 'INR',
        origin: selectedFlights.onward.origin?.iata_code,
        destination: selectedFlights.onward.destination?.iata_code,
        departureDate: selectedFlights.onward.departureTime ? new Date(selectedFlights.onward.departureTime).toISOString().split('T')[0] : null,
        cabinClass: selectedFlights.onward.cabinClass || 'economy'
      });
    }
    
    if (selectedFlights.return) {
      products.push({
        productId: 'flight',
        productName: `Flight ${selectedFlights.return.flightNumber}`,
        category: 'flight',
        subcategory: 'return',
        price: (selectedFlights.return.price?.amount || 0) * numPassengers,
        quantity: numPassengers,
        currency: 'INR',
        origin: selectedFlights.return.origin?.iata_code,
        destination: selectedFlights.return.destination?.iata_code,
        departureDate: selectedFlights.return.departureTime ? new Date(selectedFlights.return.departureTime).toISOString().split('T')[0] : null,
        cabinClass: selectedFlights.return.cabinClass || 'economy'
      });
    }

    // Add ancillary service products
    ['onward', 'return'].forEach(journey => {
      if (selectedServices?.[journey]) {
        // Seats
        if (selectedServices[journey].seat) {
          selectedServices[journey].seat.forEach((seat, index) => {
            if (seat) {
              const seatPrice = calculateSeatPrice(seat);
              products.push({
                productId: 'seat',
                productName: `Seat ${seat} - ${journey}`,
                category: 'ancillary',
                subcategory: 'seat',
                price: seatPrice,
                quantity: 1,
                currency: 'INR',
                seatNumber: seat,
                journey: journey
              });
            }
          });
        }

        // Baggage
        if (selectedServices[journey].baggage) {
          selectedServices[journey].baggage.forEach((baggage, index) => {
            if (baggage && baggage !== 'included') {
              const baggagePrice = calculateBaggagePrice(baggage, journey);
              products.push({
                productId: 'baggage',
                productName: `Baggage ${baggage} - ${journey}`,
                category: 'ancillary',
                subcategory: 'baggage',
                price: baggagePrice,
                quantity: 1,
                currency: 'INR',
                baggageType: baggage,
                journey: journey
              });
            }
          });
        }

        // Priority Boarding
        if (selectedServices[journey].priorityBoarding) {
          selectedServices[journey].priorityBoarding.forEach((priority, index) => {
            if (priority) {
              products.push({
                productId: 'priorityBoarding',
                productName: `Priority Boarding - ${journey}`,
                category: 'ancillary',
                subcategory: 'priorityBoarding',
                price: 500,
                quantity: 1,
                currency: 'INR',
                journey: journey
              });
            }
          });
        }

        // Lounge Access
        if (selectedServices[journey].loungeAccess) {
          selectedServices[journey].loungeAccess.forEach((lounge, index) => {
            if (lounge) {
              products.push({
                productId: 'loungeAccess',
                productName: `Lounge Access - ${journey}`,
                category: 'ancillary',
                subcategory: 'loungeAccess',
                price: 1500,
                quantity: 1,
                currency: 'INR',
                journey: journey
              });
            }
          });
        }
      }
    });

    // Set comprehensive Purchase event with all purchase parameters
    const purchaseEvent = {
      event: 'purchase',
      eventData: {
        revenue: {
          transactionId: txnId,
          totalRevenue: feeBreakdown.total,
          currency: 'INR',
          products: products,
          bookingReference: bookingRef,
          paymentMethod: (paymentDetails?.method || 'credit card').replace(/_/g, ' ').replace(/-/g, ' '),
          paymentStatus: 'completed',
          timestamp: new Date().toISOString()
        },
        paymentDetails: {
          paymentType: (paymentDetails?.method || 'credit card').replace(/_/g, ' ').replace(/-/g, ' '),
          paymentCurrency: 'INR',
          paymentCategories: {
            baseFare: feeBreakdown.baseFare,
            ancillaryFare: feeBreakdown.ancillaryTotal,
            taxes: feeBreakdown.taxes,
            convenienceFee: feeBreakdown.convenienceFee,
            surcharge: feeBreakdown.surcharge,
            totalFees: feeBreakdown.taxes + feeBreakdown.convenienceFee + feeBreakdown.surcharge,
            totalAmount: feeBreakdown.total
          },
          pnr: bookingRef,
          bookingId: txnId,
          passengers: numPassengers,
          tripType: tripType || 'oneWay'
        },
        customer: {
          userId: travellerDetails[0]?.email || null,
          email: travellerDetails[0]?.email || null,
          phone: travellerDetails[0]?.phone || null,
          loyaltyTier: 'standard'
        },
        searchContext: {
          searchId: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          origin: selectedFlights.onward?.origin?.iata_code || null,
          destination: selectedFlights.onward?.destination?.iata_code || null,
          originDestination: (selectedFlights.onward?.origin?.iata_code && selectedFlights.onward?.destination?.iata_code) 
            ? `${selectedFlights.onward.origin.iata_code}-${selectedFlights.onward.destination.iata_code}`
            : null,
          departureDate: selectedFlights.onward?.departureTime ? new Date(selectedFlights.onward.departureTime).toISOString().split('T')[0] : null,
          returnDate: selectedFlights.return?.departureTime ? new Date(selectedFlights.return.departureTime).toISOString().split('T')[0] : null,
          travelDay: selectedFlights.onward?.departureTime ? format(new Date(selectedFlights.onward.departureTime), 'EEEE') : null,
          numberOfDays: selectedFlights.onward?.departureTime && selectedFlights.return?.departureTime 
            ? Math.ceil((new Date(selectedFlights.return.departureTime) - new Date(selectedFlights.onward.departureTime)) / (1000 * 60 * 60 * 24))
            : (selectedFlights.onward?.departureTime ? Math.ceil((new Date(selectedFlights.onward.departureTime) - new Date()) / (1000 * 60 * 60 * 24)) : 0),
          passengers: {
            total: numPassengers,
            breakdown: {
              adults: {
                count: passengers?.adult || numPassengers,
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
            summary: passengers 
              ? Object.entries(passengers)
                  .filter(([type, count]) => count > 0)
                  .map(([type, count]) => `${type}: ${count}`)
                  .join(', ')
              : `adult: ${numPassengers}`
          },
          cabinClass: selectedFlights.onward?.cabinClass || 'economy',
          tripType: tripType || 'oneWay',
          travelPurpose: 'personal',
          searchDateTime: new Date().toISOString().split('T')[0],
          searchCriteria: {
            originAirport: selectedFlights.onward?.origin?.iata_code || null,
            originAirportName: (() => {
              const originAirport = findAirportByCode(selectedFlights.onward?.origin?.iata_code);
              console.log('Origin airport lookup:', {
                code: selectedFlights.onward?.origin?.iata_code,
                foundAirport: originAirport,
                existingName: selectedFlights.onward?.origin?.name
              });
              return originAirport?.name || selectedFlights.onward?.origin?.name || null;
            })(),
            originCity: selectedFlights.onward?.origin?.city || (() => {
              const originAirport = findAirportByCode(selectedFlights.onward?.origin?.iata_code);
              return originAirport?.city || null;
            })(),
            originCountry: selectedFlights.onward?.origin?.country || (() => {
              const originAirport = findAirportByCode(selectedFlights.onward?.origin?.iata_code);
              return originAirport?.country || null;
            })(),
            destinationAirport: selectedFlights.onward?.destination?.iata_code || null,
            destinationAirportName: (() => {
              const destAirport = findAirportByCode(selectedFlights.onward?.destination?.iata_code);
              console.log('Destination airport lookup:', {
                code: selectedFlights.onward?.destination?.iata_code,
                foundAirport: destAirport,
                existingName: selectedFlights.onward?.destination?.name
              });
              return destAirport?.name || selectedFlights.onward?.destination?.name || null;
            })(),
            destinationCity: selectedFlights.onward?.destination?.city || (() => {
              const destAirport = findAirportByCode(selectedFlights.onward?.destination?.iata_code);
              return destAirport?.city || null;
            })(),
            destinationCountry: selectedFlights.onward?.destination?.country || (() => {
              const destAirport = findAirportByCode(selectedFlights.onward?.destination?.iata_code);
              return destAirport?.country || null;
            })(),
            departureDate: selectedFlights.onward?.departureTime ? new Date(selectedFlights.onward.departureTime).toISOString().split('T')[0] : null,
            returnDate: selectedFlights.return?.departureTime ? new Date(selectedFlights.return.departureTime).toISOString().split('T')[0] : null,
            tripType: tripType || 'oneWay',
            passengers: {
              adults: passengers?.adult || numPassengers,
              children: passengers?.child || 0,
              infants: passengers?.infant || 0,
              total: numPassengers
            },
            cabinClass: selectedFlights.onward?.cabinClass || 'economy',
            travelPurpose: 'personal',
            searchDateTime: new Date().toISOString().split('T')[0],
            flexibleDates: false,
            directFlightsOnly: false
          },
          distanceKm: Math.round(calculatedDistance),
          specialDays: {
            onward: {
              is_special: false,
              special_day: null,
              special_type: null,
              country: null
            },
            return: selectedFlights.return ? {
              is_special: false,
              special_day: null,
              special_type: null,
              country: null
            } : null,
            hasSpecialDays: false
          },
          revenueData: {
            potential_revenue: feeBreakdown.total,
            avg_revenue_per_user: Math.round(feeBreakdown.total / numPassengers),
            booking_probability_score: 1.0, // Already booked
            estimated_conversion_value: feeBreakdown.total,
            revenue_bucket: feeBreakdown.total < 10000 ? 'low_value' : feeBreakdown.total < 50000 ? 'medium_value' : 'high_value',
            currency: {
              code: 'INR',
              symbol: '₹',
              name: 'Indian Rupee'
            }
          },
          geography: {
            userLocation: {
              country: 'India',
              state: 'Unknown',
              city: 'Unknown',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              ipCountry: 'India',
              currency: 'INR',
              language: navigator.language || 'en-US'
            }
          },
          searchPerformance: {
            searchDurationMs: 0,
            resultsLoadedAt: new Date().toISOString(),
            searchAbandoned: false
          }
        },
        booking: {
          tripType: tripType || 'oneWay',
          cabinClass: selectedFlights.onward?.cabinClass || 'economy',
          passengers: numPassengers,
          origin: selectedFlights.onward?.origin?.iata_code,
          destination: selectedFlights.onward?.destination?.iata_code,
          departureDate: selectedFlights.onward?.departureTime ? new Date(selectedFlights.onward.departureTime).toISOString().split('T')[0] : null,
          returnDate: selectedFlights.return?.departureTime ? new Date(selectedFlights.return.departureTime).toISOString().split('T')[0] : null
        },
        sustainabilityImpact: {
          carbonFootprint: calculatedDistance > 0 ? Math.round(calculatedDistance * 0.255) : 0, // kg CO₂
          distance: calculatedDistance, // km
          treesPlanted: calculatedTrees,
          carbonOffset: calculatedDistance > 0 ? Math.round(calculatedDistance * 0.255) : 0,
          sustainabilityContribution: calculatedTrees > 0 ? calculatedTrees * 50 : 0, // INR contribution
          impactType: 'carbonFootprint',
          contributionType: 'treesPlanted',
          timestamp: new Date().toISOString()
        }
      },
      timestamp: new Date().toISOString()
    };

    // Push Purchase event to data layer
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push(purchaseEvent);
      console.log('✅ Purchase event pushed to adobeDataLayer:', purchaseEvent);
    }



  }, [selectedFlights, travellerDetails, tripType, numPassengers, selectedServices, paymentDetails]);

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

  // Helper function to calculate baggage price
  const calculateBaggagePrice = (baggage, journey) => {
    if (!baggage || baggage === 'included') return 0;
    try {
      const flight = journey === 'onward' ? selectedFlights?.onward : selectedFlights?.return;
      if (flight?.origin?.iata_code && flight?.destination?.iata_code) {
        const isInternational = flight.origin.iata_code !== flight.destination.iata_code;
        return isInternational ? 2000 : 1000;
      }
      return 1000; // Default domestic price
    } catch (error) {
      console.warn('Error calculating baggage price:', error);
      return 1000;
    }
  };

  // Interactive functions for data layer tracking
  const handleEmailConfirmation = () => {
    if (!emailRequested && bookingReference) {
      airlinesDataLayer.trackConfirmationEmailRequest({
        emailType: 'booking_confirmation',
        recipientEmail: travellerDetails[0]?.email || '',
        bookingReference: bookingReference,
        requestStatus: 'requested'
      });
      setEmailRequested(true);
      console.log('Email confirmation requested');
    }
  };

  const handleSMSNotification = () => {
    if (!smsRequested && bookingReference) {
      airlinesDataLayer.trackSMSNotification({
        notificationType: 'booking_confirmation',
        phoneNumber: travellerDetails[0]?.phone || '',
        bookingReference: bookingReference,
        requestStatus: 'requested'
      });
      setSmsRequested(true);
      console.log('SMS notification requested');
    }
  };

  const handlePrintConfirmation = () => {
    if (bookingReference) {
      airlinesDataLayer.trackPrintConfirmation({
        printType: 'booking_confirmation',
        bookingReference: bookingReference,
        printFormat: 'pdf'
      });
      console.log('Print confirmation triggered');
      // Trigger actual print
      window.print();
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

        {/* Travel Dates Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Travel Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Departure Date</Typography>
              <Typography variant="body1">
                {location.state?.departureDate ? format(new Date(location.state.departureDate), 'EEEE, MMMM dd, yyyy') : 
                 selectedFlights.onward?.departureTime ? format(new Date(selectedFlights.onward.departureTime), 'EEEE, MMMM dd, yyyy') : 'N/A'}
              </Typography>
            </Grid>
            {(tripType === 'roundtrip' || selectedFlights.return) && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Return Date</Typography>
                <Typography variant="body1">
                  {location.state?.returnDate ? format(new Date(location.state.returnDate), 'EEEE, MMMM dd, yyyy') :
                   selectedFlights.return?.departureTime ? format(new Date(selectedFlights.return.departureTime), 'EEEE, MMMM dd, yyyy') : 'N/A'}
                </Typography>
              </Grid>
            )}
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

        {/* Sustainability Impact Section */}
        {totalDistance > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              <ForestIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Sustainability Impact
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Carbon Footprint:</strong> {Math.round(totalDistance * 0.255)} kg CO₂
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Distance: {totalDistance.toFixed(0)} km
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    <strong>Trees Planted:</strong> {treesPlanted} trees
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Equivalent to offsetting your flight's carbon footprint
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handlePrintConfirmation}
            startIcon={<PrintIcon />}
          >
            Print Ticket
          </Button>
          <Button
            variant="outlined"
            onClick={handleEmailConfirmation}
            disabled={emailRequested}
            startIcon={<EmailIcon />}
          >
            {emailRequested ? 'Email Sent' : 'Email Confirmation'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleSMSNotification}
            disabled={smsRequested}
            startIcon={<SmsIcon />}
          >
            {smsRequested ? 'SMS Sent' : 'SMS Notification'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.print()}
            startIcon={<DownloadIcon />}
          >
            Download Ticket (PDF)
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