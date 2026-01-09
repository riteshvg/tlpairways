import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import usePageView from '../hooks/usePageView';
import airlinesDataLayer from '../services/AirlinesDataLayer';
import { sendBookingConfirmationWhatsApp } from '../services/whatsappService';
import { sendBookingConfirmationEmail } from '../services/emailService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  Card,
  CardContent,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Alert,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import EventSeat from '@mui/icons-material/EventSeat';
import LuggageIcon from '@mui/icons-material/Luggage';
import Luggage from '@mui/icons-material/Luggage';
import Restaurant from '@mui/icons-material/Restaurant';
import FlightTakeoff from '@mui/icons-material/FlightTakeoff';
import Deck from '@mui/icons-material/Deck';
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

  // Build version for tracking
  const BUILD_VERSION = {
    version: '2025-10-22-v9',
    commit: '38595d7',
    buildDate: '2025-10-22T13:15:38+05:30',
    features: [
      'Complimentary meals (free)',
      'Dynamic baggage pricing (₹800-₹3,500)',
      'Additional Services card with details',
      'Sustainability Impact metrics',
      'Booking duration tracking',
      'Enhanced airline details on all pages',
      'Fixed date selection across booking flow',
      'Technical Build Details modal'
    ],
    fixes: [
      'Date object rendering errors',
      'Undefined attributes in data layer',
      'Distance calculation for sustainability',
      'Meal and baggage detail display',
      'Ancillary total calculation accuracy'
    ]
  };

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
  const [techDetailsOpen, setTechDetailsOpen] = useState(false);

  // State for tracking user interactions
  const [bookingReference, setBookingReference] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [emailRequested, setEmailRequested] = useState(false);
  const [smsRequested, setSmsRequested] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [whatsappSending, setWhatsappSending] = useState(false);
  const hasSentWhatsApp = useRef(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const hasSentEmail = useRef(false);

  // State for haul types (for UI display)
  const [haulTypes, setHaulTypes] = useState({
    onward: 'short haul',
    return: null,
    overall: 'short haul'
  });

  const {
    selectedFlights,
    tripType,
    passengers,
    travellerDetails,
    selectedServices,
    paymentDetails,
    contactInfo,
    paymentType, // Payment mode: cash, points, cash_points
    pnr: passedPNR, // Get PNR from location state (generated in SearchResults)
    departureDate: userDepartureDate, // User-selected departure date
    returnDate: userReturnDate // User-selected return date
  } = location.state || {};

  // Find the number of passengers
  const numPassengers = (location.state?.passengers || travellerDetails?.length || 1);

  // Generate ticket numbers only (PNR comes from SearchResults)
  const generateTicketNumber = () => {
    const characters = '0123456789';
    let ticket = '';
    for (let i = 0; i < 13; i++) {
      ticket += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return ticket;
  };

  // Use the PNR passed from SearchResults, or generate one as fallback
  const [bookingDetails] = useState(() => ({
    pnr: passedPNR || airlinesDataLayer.generateBookingReference(), // Use passed PNR or generate as fallback
    onwardTicket: generateTicketNumber(),
    returnTicket: tripType === 'roundtrip' ? generateTicketNumber() : null
  }));

  // Use the stored PNR and ticket numbers
  const { pnr, onwardTicket, returnTicket } = bookingDetails;

  console.log('Using PNR in BookingConfirmation:', pnr, passedPNR ? '(from SearchResults)' : '(generated as fallback)');

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
                selectedFlights.onward.origin !== selectedFlights.onward.destination :
                selectedFlights.return.origin !== selectedFlights.return.destination;
              const baggagePrice = getBaggagePrice(baggage, isInternational);
              console.log(`Baggage price calculation for ${journey}:`, {
                baggage,
                baggageType: baggage,
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
  // Helper function to get baggage price
  const getBaggagePrice = (baggageType, isInternational) => {
    const baggagePricing = {
      '15kg': isInternational ? 1500 : 800,
      '20kg': isInternational ? 2000 : 1000,
      '25kg': isInternational ? 2500 : 1200,
      '30kg': isInternational ? 3000 : 1500,
      'sports-equipment': isInternational ? 3000 : 2000,
      'musical-instrument': isInternational ? 3500 : 2500,
      'fragile': isInternational ? 2500 : 1500
    };
    return baggagePricing[baggageType] || (isInternational ? 2000 : 1000);
  };

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

  // Helper function to determine if flight is long haul or short haul
  const calculateHaulType = (distance, duration) => {
    // Convert duration string (e.g., "0h 45m", "6h 30m") to hours
    const parseDuration = (durationStr) => {
      if (!durationStr) return 0;
      const hoursMatch = durationStr.match(/(\d+)h/);
      const minutesMatch = durationStr.match(/(\d+)m/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
      return hours + (minutes / 60);
    };

    const durationInHours = parseDuration(duration);

    // Short haul: distance < 4800 km OR duration < 6 hours
    // Long haul: distance >= 4800 km OR duration >= 6 hours
    if (distance >= 4800 || durationInHours >= 6) {
      return 'long haul';
    } else {
      return 'short haul';
    }
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
      const addCoordinatesIfMissing = (airportCode) => {
        if (!airportCode) return null;

        // If it's already an object with coordinates, return it
        if (typeof airportCode === 'object' && airportCode.coordinates) {
          return airportCode;
        }

        // If it's a string (airport code like "BOM"), get coordinates
        if (typeof airportCode === 'string') {
          const coords = getAirportWithCoordinates(airportCode);
          if (coords) {
            return { iata_code: airportCode, coordinates: coords };
          }
        }

        return null;
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
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(phi1) * Math.cos(phi2) *
          Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  // Send WhatsApp message if user opted in
  useEffect(() => {
    // Only send if WhatsApp notification is enabled and we haven't sent yet
    if (
      hasSentWhatsApp.current ||
      !contactInfo?.whatsappNotification ||
      !contactInfo?.phone ||
      !selectedFlights?.onward ||
      !pnr
    ) {
      return;
    }

    // Wait a bit for booking confirmation to complete
    const sendWhatsApp = async () => {
      hasSentWhatsApp.current = true;
      setWhatsappSending(true);

      try {
        // Format phone number - add country code if missing (default to 91 for India)
        let phoneNumber = contactInfo.phone.replace(/[+\s-]/g, '');
        if (!phoneNumber.startsWith('91') && phoneNumber.length === 10) {
          phoneNumber = '91' + phoneNumber; // Add India country code
        }

        // Get primary passenger name
        const primaryPassenger = travellerDetails?.[0];
        const passengerName = primaryPassenger
          ? `${primaryPassenger.firstName || ''} ${primaryPassenger.lastName || ''}`.trim()
          : 'Guest';

        // Format dates
        const formatDate = (dateStr) => {
          if (!dateStr) return 'N/A';
          try {
            const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
            return isValid(date) ? format(date, 'MMM dd, yyyy') : dateStr;
          } catch {
            return dateStr;
          }
        };

        const formatTime = (dateStr) => {
          if (!dateStr) return 'N/A';
          try {
            const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
            return isValid(date) ? format(date, 'HH:mm') : dateStr;
          } catch {
            return dateStr;
          }
        };

        // Calculate total amount
        const baseFare = (selectedFlights.onward.price.amount * numPassengers) + (selectedFlights.return?.price.amount ? selectedFlights.return.price.amount * numPassengers : 0);
        const taxes = Math.round(baseFare * 0.05);
        const convenienceFee = Math.round(baseFare * 0.02);
        const surcharge = Math.round(baseFare * 0.01);
        const ancillaryTotal = calculateAncillaryTotal();
        const totalAmount = baseFare + taxes + convenienceFee + surcharge + ancillaryTotal;

        // Format travel date for template (YYYY-MM-DD format)
        const formatTravelDate = (dateStr) => {
          if (!dateStr) return 'N/A';
          try {
            const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
            return isValid(date) ? format(date, 'yyyy-MM-dd') : dateStr;
          } catch {
            return dateStr;
          }
        };

        // Extract origin and destination airport codes
        // Handle multiple data structure formats
        const getAirportCode = (airport) => {
          if (!airport) return null;
          // If it's a string, return it directly
          if (typeof airport === 'string') return airport;
          // If it's an object, try different property names
          if (typeof airport === 'object') {
            return airport.iata_code || airport.code || airport.originCode || airport.destinationCode || null;
          }
          return null;
        };

        const originCode = getAirportCode(selectedFlights.onward.origin) || 
                          selectedFlights.onward.originCode || 
                          'N/A';
        const destinationCode = getAirportCode(selectedFlights.onward.destination) || 
                               selectedFlights.onward.destinationCode || 
                               'N/A';

        console.log('🔍 WhatsApp Route Debug:', {
          origin: selectedFlights.onward.origin,
          destination: selectedFlights.onward.destination,
          originCode,
          destinationCode,
          route: `${originCode}-${destinationCode}`
        });

        // Prepare booking data according to template structure
        const bookingData = {
          phoneNumber: phoneNumber,
          pnr: pnr,
          passengerName: passengerName,
          email: contactInfo?.email || travellerDetails?.[0]?.email || 'N/A',
          passengersCount: numPassengers,
          flight: {
            flightNumber: selectedFlights.onward.flightNumber,
            origin: originCode,
            destination: destinationCode,
            originCode: originCode, // Also pass as originCode for service
            destinationCode: destinationCode, // Also pass as destinationCode for service
            departureDate: formatTravelDate(selectedFlights.onward.departureTime || userDepartureDate),
            departureTime: formatTime(selectedFlights.onward.departureTime || userDepartureDate)
          },
          totalAmount: totalAmount
        };

        // Add return flight if exists
        const returnFlight = selectedFlights.return ? {
          flightNumber: selectedFlights.return.flightNumber,
          origin: selectedFlights.return.origin?.iata_code || selectedFlights.return.originCode,
          destination: selectedFlights.return.destination?.iata_code || selectedFlights.return.destinationCode,
          departureDate: formatDate(selectedFlights.return.departureTime || userReturnDate),
          departureTime: formatTime(selectedFlights.return.departureTime || userReturnDate)
        } : null;

        const result = await sendBookingConfirmationWhatsApp(bookingData, returnFlight);

        if (result.success) {
          setWhatsappSent(true);
          console.log('✅ WhatsApp message sent successfully:', result.messageId);
        } else {
          console.error('❌ Failed to send WhatsApp:', result.error);
          // Don't set error state - just log it, as WhatsApp is optional
        }
      } catch (error) {
        console.error('❌ Error sending WhatsApp:', error);
        // Don't set error state - just log it
      } finally {
        setWhatsappSending(false);
      }
    };

    // Delay sending to ensure booking is fully confirmed
    const timer = setTimeout(sendWhatsApp, 2000);
    return () => clearTimeout(timer);
  }, [contactInfo, selectedFlights, pnr, travellerDetails, userDepartureDate, userReturnDate]);

  // Send booking confirmation email
  useEffect(() => {
    // Only send if we haven't sent yet and have required data
    if (
      hasSentEmail.current ||
      !contactInfo?.email ||
      !selectedFlights?.onward ||
      !pnr
    ) {
      return;
    }

    // Wait a bit for booking confirmation to complete
    const sendEmail = async () => {
      hasSentEmail.current = true;
      setEmailSending(true);

      try {
        // Get primary passenger name
        const primaryPassenger = travellerDetails?.[0];
        const passengerName = primaryPassenger
          ? `${primaryPassenger.firstName || ''} ${primaryPassenger.lastName || ''}`.trim()
          : 'Guest';

        // Extract origin and destination
        const getAirportCode = (airport) => {
          if (!airport) return null;
          if (typeof airport === 'string') return airport;
          if (typeof airport === 'object') {
            return airport.iata_code || airport.code || airport.originCode || airport.destinationCode || null;
          }
          return null;
        };

        const originCode = getAirportCode(selectedFlights.onward.origin) || 
                          selectedFlights.onward.originCode || 
                          '';
        const destinationCode = getAirportCode(selectedFlights.onward.destination) || 
                               selectedFlights.onward.destinationCode || 
                               '';
        const route = originCode && destinationCode ? `${originCode}-${destinationCode}` : 'N/A';

        // Format travel date
        const formatTravelDate = (dateStr) => {
          if (!dateStr) return 'N/A';
          try {
            const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
            return isValid(date) ? format(date, 'yyyy-MM-dd') : dateStr;
          } catch {
            return dateStr;
          }
        };

        const travelDate = formatTravelDate(selectedFlights.onward.departureTime || userDepartureDate);

        // Format passengers string
        const formatPassengers = () => {
          if (passengers) {
            const parts = [];
            if (passengers.adult) parts.push(`${passengers.adult} Adult${passengers.adult > 1 ? 's' : ''}`);
            if (passengers.child) parts.push(`${passengers.child} Child${passengers.child > 1 ? 'ren' : ''}`);
            if (passengers.infant) parts.push(`${passengers.infant} Infant${passengers.infant > 1 ? 's' : ''}`);
            return parts.join(', ') || '1';
          }
          return String(numPassengers);
        };

        // Get airport details helper
        const getAirportDetails = (airport) => {
          if (!airport) return { code: '', city: '', name: '', terminal: 'TBD' };
          
          // Get airport code
          const code = typeof airport === 'string' 
            ? airport 
            : (airport.iata_code || airport.code || '');
          
          // Look up city name from airports.json using findAirportByCode
          const airportData = code ? findAirportByCode(code) : null;
          
          if (typeof airport === 'string') {
            return {
              code: code,
              city: airportData?.city || code, // Use city from lookup, fallback to code
              name: airportData?.name || '',
              terminal: 'TBD'
            };
          }
          
          return {
            code: code,
            city: airport.city || airportData?.city || '', // Prefer airport.city, then lookup, then empty
            name: airport.name || airport.airportName || airportData?.name || '',
            terminal: airport.terminal || 'TBD'
          };
        };

        const originDetails = getAirportDetails(selectedFlights.onward.origin);
        const destDetails = getAirportDetails(selectedFlights.onward.destination);

        // Calculate pricing breakdown
        const fees = calculateFeeBreakdown();

        // Format time from datetime
        const formatTimeFromDate = (dateStr) => {
          if (!dateStr) return '10:30';
          try {
            const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
            if (isValid(date)) {
              return format(date, 'HH:mm');
            }
            // Try parsing as time string
            if (typeof dateStr === 'string' && dateStr.includes(':')) {
              return dateStr.split(':').slice(0, 2).join(':');
            }
            return '10:30';
          } catch {
            return '10:30';
          }
        };

        // Get departure and arrival times for onward flight
        const departureTimeStr = formatTimeFromDate(selectedFlights.onward.departureTime || userDepartureDate);
        const arrivalTimeStr = selectedFlights.onward.arrivalTime 
          ? formatTimeFromDate(selectedFlights.onward.arrivalTime)
          : null; // Will be calculated on backend if not provided

        // Get return flight details if round trip
        let returnFlightData = null;
        if (tripType === 'roundtrip' && selectedFlights.return) {
          const returnOriginCode = getAirportCode(selectedFlights.return.origin) || 
                                  selectedFlights.return.originCode || '';
          const returnDestCode = getAirportCode(selectedFlights.return.destination) || 
                                selectedFlights.return.destinationCode || '';
          const returnOriginDetails = getAirportDetails(selectedFlights.return.origin);
          const returnDestDetails = getAirportDetails(selectedFlights.return.destination);
          const returnTravelDate = formatTravelDate(selectedFlights.return.departureTime || userReturnDate);
          const returnDepartureTime = formatTimeFromDate(selectedFlights.return.departureTime || userReturnDate);
          const returnArrivalTime = selectedFlights.return.arrivalTime 
            ? formatTimeFromDate(selectedFlights.return.arrivalTime)
            : null;

          returnFlightData = {
            flightNumber: selectedFlights.return.flightNumber || 'N/A',
            from: returnOriginCode,
            fromCity: returnOriginDetails.city || selectedFlights.return.originCity || '',
            fromAirport: returnOriginDetails.name || '',
            fromTerminal: returnOriginDetails.terminal,
            to: returnDestCode,
            toCity: returnDestDetails.city || selectedFlights.return.destinationCity || '',
            toAirport: returnDestDetails.name || '',
            toTerminal: returnDestDetails.terminal,
            route: returnOriginCode && returnDestCode ? `${returnOriginCode}-${returnDestCode}` : 'N/A',
            travelDate: returnTravelDate,
            departureTime: returnDepartureTime,
            arrivalTime: returnArrivalTime,
            duration: selectedFlights.return.duration || null,
            travelClass: selectedFlights.return.cabinClass || 'Economy'
          };
        }

        // Build passengers array with details
        const passengersArray = travellerDetails?.map((traveller, index) => ({
          name: `${traveller.firstName || ''} ${traveller.lastName || ''}`.trim() || 'Guest',
          type: index === 0 ? 'Adult' : (traveller.age && traveller.age < 18 ? 'Child' : 'Adult'),
          age: traveller.age || null,
          seatNumber: selectedServices?.onward?.seat?.[index] || null,
          mealPreference: selectedServices?.onward?.meal?.[index] || null
        })) || [];

        // Prepare comprehensive email data
        const emailData = {
          // Passenger Information
          passengerName: passengerName,
          email: contactInfo.email,
          phone: contactInfo?.phone || 'Not provided',
          
          // Booking Reference
          bookingId: pnr,
          pnr: pnr,
          bookingDate: new Date().toISOString(),
          bookingStatus: 'Confirmed',
          tripType: tripType || 'oneway', // oneway or roundtrip
          
          // Onward Flight Details
          flightNumber: selectedFlights.onward.flightNumber || 'N/A',
          airline: selectedFlights.onward.airline || 'TLP Airways',
          aircraftType: 'Boeing 737-800', // Default, can be enhanced
          
          // Onward Route Information
          from: originCode,
          fromCity: originDetails.city || selectedFlights.onward.originCity || '',
          fromAirport: originDetails.name || '',
          fromTerminal: originDetails.terminal,
          to: destinationCode,
          toCity: destDetails.city || selectedFlights.onward.destinationCity || '',
          toAirport: destDetails.name || '',
          toTerminal: destDetails.terminal,
          route: route,
          
          // Onward Timing
          travelDate: travelDate,
          departureTime: departureTimeStr,
          arrivalTime: arrivalTimeStr,
          duration: selectedFlights.onward.duration || null, // Will be calculated if not provided
          
          // Return Flight Details (if round trip)
          returnFlight: returnFlightData,
          
          // Passengers
          adults: passengers?.adult || numPassengers,
          children: passengers?.child || 0,
          infants: passengers?.infant || 0,
          totalPassengers: numPassengers,
          passengers: passengersArray,
          
          // Class & Fare
          travelClass: selectedFlights.onward.cabinClass || 'Economy',
          fareType: 'Regular',
          
          // Pricing
          baseFare: fees.baseFare,
          taxes: fees.taxes + fees.convenienceFee + fees.surcharge,
          totalAmount: fees.total,
          currency: 'INR',
          paymentMethod: paymentType || 'Credit Card',
          paymentStatus: 'Paid',
          
          // Baggage
          cabinBaggage: '7 kg',
          checkinBaggage: '15 kg', // Can be enhanced based on selected services
          
          // Check-in Information (will be calculated on backend)
          webCheckinOpens: null,
          reportingTime: null,
          gateClosingTime: null,
          
          // Links
          bookingUrl: null,
          checkinUrl: null,
          eTicketUrl: null,
          manageBookingUrl: null
        };

        const result = await sendBookingConfirmationEmail(emailData);

        if (result.success) {
          setEmailSent(true);
          console.log('✅ Booking confirmation email sent successfully:', result.messageId);
        } else {
          console.error('❌ Failed to send email:', result.error);
          // Don't set error state - just log it, as email is optional
        }
      } catch (error) {
        console.error('❌ Error sending email:', error);
        // Don't set error state - just log it
      } finally {
        setEmailSending(false);
      }
    };

    // Delay sending to ensure booking is fully confirmed
    const timer = setTimeout(sendEmail, 1500);
    return () => clearTimeout(timer);
  }, [contactInfo, selectedFlights, pnr, travellerDetails, userDepartureDate, userReturnDate, passengers, numPassengers, tripType, paymentType, selectedServices]);

  useEffect(() => {
    if (!selectedFlights?.onward || !travellerDetails) return;

    // Prevent duplicate purchase events
    if (hasFiredPurchaseEvent.current) return;
    hasFiredPurchaseEvent.current = true;

    // Use the PNR from bookingDetails (which was passed from SearchResults)
    // Generate transaction ID
    const bookingRef = pnr; // Use the PNR from bookingDetails
    const txnId = airlinesDataLayer.generateTransactionId();
    setBookingReference(bookingRef);
    setTransactionId(txnId);

    console.log('Using consistent PNR in Adobe Data Layer:', bookingRef);

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

      const onwardOriginCoords = getCoordinates(selectedFlights.onward?.origin);
      const onwardDestCoords = getCoordinates(selectedFlights.onward?.destination);
      const onwardDistance = onwardOriginCoords && onwardDestCoords
        ? calculateFlightDistance(onwardOriginCoords, onwardDestCoords)
        : 0;

      const returnOriginCoords = getCoordinates(selectedFlights.return?.origin);
      const returnDestCoords = getCoordinates(selectedFlights.return?.destination);
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

    // Calculate haul type for flights
    let onwardHaulType = 'short haul';
    let returnHaulType = null;
    try {
      const onwardFlightDistance = calculatedDistance / (tripType === 'roundtrip' ? 2 : 1);
      console.log('🔍 Calculating Haul Type - Onward flight distance:', onwardFlightDistance);
      console.log('🔍 Onward flight duration:', selectedFlights.onward?.duration);

      onwardHaulType = calculateHaulType(
        onwardFlightDistance,
        selectedFlights.onward?.duration
      );
      console.log('✅ Onward haul type calculated:', onwardHaulType);

      if (tripType === 'roundtrip' && selectedFlights.return) {
        const returnFlightDistance = calculatedDistance / 2;
        console.log('🔍 Return flight distance:', returnFlightDistance);
        console.log('🔍 Return flight duration:', selectedFlights.return?.duration);

        returnHaulType = calculateHaulType(
          returnFlightDistance,
          selectedFlights.return?.duration
        );
        console.log('✅ Return haul type calculated:', returnHaulType);
      }
    } catch (error) {
      console.error('❌ Error calculating haul type:', error);
      // Ensure defaults even if error occurs
      onwardHaulType = onwardHaulType || 'short haul';
    }

    // Calculate overall haul type
    const overallHaulType = returnHaulType ?
      (onwardHaulType === 'long haul' || returnHaulType === 'long haul' ? 'long haul' : 'short haul') :
      onwardHaulType;

    // Set haul types for UI display
    setHaulTypes({
      onward: onwardHaulType,
      return: returnHaulType,
      overall: overallHaulType
    });

    // Log haul type before creating purchase event
    console.log('📊 Final Haul Type Values:', {
      onward: onwardHaulType,
      return: returnHaulType,
      overall: overallHaulType
    });

    // Log payment mode for debugging
    console.log('🔍 Payment Mode Debug:', {
      paymentTypeFromState: paymentType,
      paymentModeInDataLayer: paymentType || 'cash',
      paymentMethod: paymentDetails?.method,
      tripType: tripType
    });

    const feeBreakdown = calculateFeeBreakdown();

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
              departureDate: userDepartureDate ? new Date(userDepartureDate).toISOString().split('T')[0] : null,
              arrivalTime: selectedFlights.onward?.arrivalTime,
              arrivalDate: userDepartureDate ? new Date(userDepartureDate).toISOString().split('T')[0] : null,
              cabinClass: selectedFlights.onward?.cabinClass || 'economy',
              price: selectedFlights.onward?.price?.amount || 0
            },
            return: selectedFlights.return ? {
              flightNumber: selectedFlights.return?.flightNumber,
              airline: selectedFlights.return?.airline,
              origin: selectedFlights.return?.origin?.iata_code,
              destination: selectedFlights.return?.destination?.iata_code,
              departureTime: selectedFlights.return?.departureTime,
              departureDate: userReturnDate ? new Date(userReturnDate).toISOString().split('T')[0] : null,
              arrivalTime: selectedFlights.return?.arrivalTime,
              arrivalDate: userReturnDate ? new Date(userReturnDate).toISOString().split('T')[0] : null,
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

    // Helper to normalize airport codes for data layer
    const getAirportCode = (airport) => {
      if (!airport) return null;
      if (typeof airport === 'string') return airport;
      if (typeof airport === 'object') {
        return airport.iata_code || airport.code || null;
      }
      return null;
    };

    // Build products array for revenue tracking
    const products = [];

    // Add flight products
    if (selectedFlights.onward) {
      products.push({
        productId: 'base fare',
        productName: `Flight ${selectedFlights.onward.flightNumber}`,
        category: 'flight',
        subCategory: 'onward',
        price: (selectedFlights.onward.price?.amount || 0) * numPassengers,
        quantity: numPassengers,
        currency: 'INR',
        origin: getAirportCode(selectedFlights.onward.origin),
        destination: getAirportCode(selectedFlights.onward.destination),
        departureDate: userDepartureDate ? new Date(userDepartureDate).toISOString().split('T')[0] : null,
        cabinClass: selectedFlights.onward.cabinClass || 'economy',
        journeyType: 'onward'
      });
    }

    if (selectedFlights.return) {
      products.push({
        productId: 'base fare',
        productName: `Flight ${selectedFlights.return.flightNumber}`,
        category: 'flight',
        subCategory: 'return',
        price: (selectedFlights.return.price?.amount || 0) * numPassengers,
        quantity: numPassengers,
        currency: 'INR',
        origin: getAirportCode(selectedFlights.return.origin),
        destination: getAirportCode(selectedFlights.return.destination),
        departureDate: userReturnDate ? new Date(userReturnDate).toISOString().split('T')[0] : null,
        cabinClass: selectedFlights.return.cabinClass || 'economy',
        journeyType: 'return'
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
                productName: `Seat ${seat} - Passenger ${index + 1} - ${journey}`,
                category: 'ancillary',
                subCategory: 'seat',
                price: seatPrice,
                quantity: 1,
                currency: 'INR',
                passengerIndex: index + 1,
                seatNumber: seat,
                journeyType: journey
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
                subCategory: 'baggage',
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
                subCategory: 'priorityBoarding',
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
                subCategory: 'loungeAccess',
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
          paymentMode: paymentType || 'cash', // Payment mode: cash, points, cash_points
          paymentStatus: 'completed',
          timestamp: new Date().toISOString()
        },
        paymentDetails: {
          paymentType: (paymentDetails?.method || 'credit card').replace(/_/g, ' ').replace(/-/g, ' '),
          paymentMode: paymentType || 'cash', // Payment mode: cash, points, cash_points
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
          ticketNumber: onwardTicket, // Simple string instead of object
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
          departureDate: userDepartureDate ? new Date(userDepartureDate).toISOString().split('T')[0] : null,
          returnDate: userReturnDate ? new Date(userReturnDate).toISOString().split('T')[0] : null,
          travelDay: userDepartureDate ? format(new Date(userDepartureDate), 'EEEE') : null,
          numberOfDays: userDepartureDate && userReturnDate
            ? Math.ceil((new Date(userReturnDate) - new Date(userDepartureDate)) / (1000 * 60 * 60 * 24))
            : (userDepartureDate ? Math.ceil((new Date(userDepartureDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0),
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
            departureDate: userDepartureDate ? new Date(userDepartureDate).toISOString().split('T')[0] : null,
            returnDate: userReturnDate ? new Date(userReturnDate).toISOString().split('T')[0] : null,
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
          departureDate: userDepartureDate ? new Date(userDepartureDate).toISOString().split('T')[0] : null,
          returnDate: userReturnDate ? new Date(userReturnDate).toISOString().split('T')[0] : null,
          haulType: {
            onward: onwardHaulType,
            ...(returnHaulType && { return: returnHaulType }),
            overall: returnHaulType ?
              (onwardHaulType === 'long haul' || returnHaulType === 'long haul' ? 'long haul' : 'short haul') :
              onwardHaulType
          }
        },
        sustainabilityImpact: {
          carbonFootprint: calculatedDistance > 0 ? Math.round(calculatedDistance * 0.255) : 0, // kg CO₂
          distance: Math.round(calculatedDistance), // km - rounded to nearest whole number
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
      // Verify haulType is present before pushing
      if (!purchaseEvent.eventData.booking.haulType) {
        console.error('⚠️ WARNING: haulType is missing from purchase event!');
      } else {
        console.log('✅ Purchase Event with haulType:', JSON.stringify(purchaseEvent.eventData.booking.haulType, null, 2));
      }

      window.adobeDataLayer.push(purchaseEvent);
      console.log('✅ Purchase event pushed to adobeDataLayer:', purchaseEvent);
      console.log('📋 Booking object in data layer:', JSON.stringify(purchaseEvent.eventData.booking, null, 2));
      console.log('🎯 Payment Mode Verification:', {
        revenuePaymentMode: purchaseEvent.eventData.revenue.paymentMode,
        paymentDetailsPaymentMode: purchaseEvent.eventData.paymentDetails.paymentMode,
        expectedPaymentMode: paymentType || 'cash',
        paymentTypeFromState: paymentType
      });
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

  const handleDownloadPDF = async () => {
    try {
      // Track PDF download
      if (bookingReference) {
        airlinesDataLayer.trackPrintConfirmation({
          printType: 'booking_confirmation',
          bookingReference: bookingReference,
          printFormat: 'pdf_download'
        });
      }

      // Get the confirmation content
      const element = document.getElementById('booking-confirmation-content');
      if (!element) {
        console.error('Booking confirmation content not found');
        return;
      }

      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`TLAirways-Booking-${pnr}-${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try using the Print Ticket option instead.');
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

    // Get the user-selected date for this flight
    const userSelectedDate = type === 'onward' ? userDepartureDate : userReturnDate;

    // Combine user-selected date with flight time
    const getFlightDateTime = (flightTime, userDate) => {
      console.log('getFlightDateTime called:', { flightTime, userDate, flightTimeType: typeof flightTime });

      if (!userDate || !flightTime) {
        console.warn('Missing userDate or flightTime:', { userDate, flightTime });
        return 'Date unavailable';
      }

      try {
        // Ensure flightTime is a string
        if (typeof flightTime !== 'string') {
          console.warn('flightTime is not a string:', flightTime, 'Type:', typeof flightTime);
          // Try to convert to string if it's a Date object
          if (flightTime instanceof Date) {
            const formattedTime = format(flightTime, 'HH:mm');
            flightTime = formattedTime;
          } else {
            return 'Time unavailable';
          }
        }

        const selectedDate = new Date(userDate);
        if (isNaN(selectedDate.getTime())) {
          console.warn('Invalid userDate:', userDate);
          return 'Invalid date';
        }

        // Split time and validate
        const timeParts = flightTime.split(':');
        if (timeParts.length !== 2) {
          console.warn('Invalid time format:', flightTime);
          return flightTime;
        }

        const [hours, minutes] = timeParts;
        selectedDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
        const result = format(selectedDate, 'MMM dd, yyyy hh:mm a');
        console.log('Formatted result:', result);
        return result;
      } catch (error) {
        console.error('Error formatting flight date time:', error, {
          flightTime,
          userDate,
          flightTimeType: typeof flightTime
        });
        return 'Error formatting date';
      }
    };

    console.log('Rendering flight details:', {
      type,
      flight,
      seats,
      selectedServices,
      userSelectedDate: userSelectedDate ? format(new Date(userSelectedDate), 'yyyy-MM-dd') : null,
      departureTime: flight.departureTime,
      departureTimeType: typeof flight.departureTime
    });

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {type === 'onward' ? 'Onward Flight' : 'Return Flight'}
        </Typography>
        <Paper elevation={2} sx={{ p: 2, bgcolor: 'action.hover' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold">
                {flight.originCity || flight.origin} → {flight.destinationCity || flight.destination}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">Airline</Typography>
              <Typography variant="body2" fontWeight="medium">{flight.airline || 'TL Airways'}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">Flight</Typography>
              <Typography variant="body2" fontWeight="medium">{flight.flightNumber}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">Aircraft</Typography>
              <Typography variant="body2">{flight.aircraftType || flight.aircraft || 'Aircraft'}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">Cabin</Typography>
              <Typography variant="body2">{flight.cabinClass?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Departure</Typography>
              <Typography variant="body2">{getFlightDateTime(flight.departureTime, userSelectedDate)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Flight Type</Typography>
              <Typography variant="body2">
                <Chip
                  label={(type === 'onward' ? haulTypes.onward : haulTypes.return || 'short haul').toUpperCase()}
                  size="small"
                  color={
                    (type === 'onward' ? haulTypes.onward : haulTypes.return) === 'long haul'
                      ? 'primary'
                      : 'success'
                  }
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                />
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Selected Seats</Typography>
              <Typography variant="body2">
                {seats.length > 0 ? seats.join(', ') : 'No seats selected'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
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
                {selectedServices.onward?.seat?.some(seat => seat !== null) && renderServiceChip(
                  <EventSeatIcon />,
                  'Seats',
                  selectedServices.onward.seat.filter(seat => seat !== null).reduce((total, seat) => total + calculateSeatPrice(seat), 0),
                  `Selected seats: ${selectedServices.onward.seat.map((seat, index) =>
                    seat ? `P${index + 1}: ${seat}` : null
                  ).filter(Boolean).join(', ')}`
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
                  {selectedServices.return?.seat?.some(seat => seat !== null) && renderServiceChip(
                    <EventSeatIcon />,
                    'Seats',
                    selectedServices.return.seat.filter(seat => seat !== null).reduce((total, seat) => total + calculateSeatPrice(seat), 0),
                    `Selected seats: ${selectedServices.return.seat.map((seat, index) =>
                      seat ? `P${index + 1}: ${seat}` : null
                    ).filter(Boolean).join(', ')}`
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <div id="booking-confirmation-content">
        {/* Success Header with Destination Image */}
        <Paper
          elevation={3}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            mb: 3,
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'success.light'
          }}
        >
          {/* Background Image - Placeholder for Adobe Target personalization */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.3,
              filter: 'blur(2px)'
            }}
            className="personalization-container"
            data-target-placeholder="destination-hero-image"
          />

          {/* Content overlay */}
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', p: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h3" gutterBottom fontWeight="bold" sx={{ color: 'success.dark' }}>
              Booking Confirmed!
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              PNR: <Box component="span" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '1.5rem' }}>{pnr}</Box>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              A confirmation email will be sent to {travellerDetails?.[0]?.email}
            </Typography>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Left Column - Travel & Payment Info */}
          <Grid item xs={12} md={5}>
            {/* Travel Dates Card */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Travel Dates
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Departure</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {userDepartureDate ? format(new Date(userDepartureDate), 'EEEE, MMM dd, yyyy') : 'N/A'}
                    </Typography>
                  </Box>
                  {(tripType === 'roundtrip' || selectedFlights.return) && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Return</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {userReturnDate ? format(new Date(userReturnDate), 'EEEE, MMM dd, yyyy') : 'N/A'}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            {renderFeeBreakdown()}

            {/* Additional Services Card */}
            {selectedServices && (selectedServices.onward || selectedServices.return) && (
              <Card elevation={2} sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Additional Services
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    {/* Onward Services */}
                    {selectedServices.onward && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                          Onward Flight
                        </Typography>
                        <Stack spacing={1}>
                          {selectedServices.onward.seat && selectedServices.onward.seat.some(seat => seat !== null) && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventSeat fontSize="small" color="action" />
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    Seats ({selectedServices.onward.seat.filter(seat => seat !== null).length})
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {selectedServices.onward.seat.map((seat, index) =>
                                      seat ? `P${index + 1}: ${seat}` : null
                                    ).filter(Boolean).join(', ')}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                ₹{selectedServices.onward.seat.filter(seat => seat !== null)
                                  .reduce((total, seat) => total + calculateSeatPrice(seat), 0).toLocaleString()}
                              </Typography>
                            </Box>
                          )}
                          {selectedServices.onward.meals && selectedServices.onward.meals.filter(m => m && m !== 'none' && m !== '').length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Restaurant fontSize="small" color="action" />
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    Meals ({selectedServices.onward.meals.filter(m => m && m !== 'none' && m !== '').length})
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {selectedServices.onward.meals.filter(m => m && m !== 'none' && m !== '').map(m => {
                                      const mealMap = {
                                        'veg': 'Vegetarian',
                                        'non-veg': 'Non-Vegetarian',
                                        'nonveg': 'Non-Vegetarian',
                                        'vegan': 'Vegan',
                                        'jain': 'Jain',
                                        'diabetic': 'Diabetic',
                                        'gluten-free': 'Gluten Free'
                                      };
                                      return mealMap[m.toLowerCase()] || m;
                                    }).join(', ')}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="success.main" fontWeight="medium">
                                Free
                              </Typography>
                            </Box>
                          )}
                          {selectedServices.onward.baggage && selectedServices.onward.baggage.filter(b => b && b !== 'included').length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Luggage fontSize="small" color="action" />
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    Extra Baggage ({selectedServices.onward.baggage.filter(b => b && b !== 'included').length})
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {selectedServices.onward.baggage.filter(b => b && b !== 'included').map(b => {
                                      const baggageMap = {
                                        '15kg': '15 kg',
                                        '20kg': '20 kg',
                                        '25kg': '25 kg',
                                        '30kg': '30 kg',
                                        'sports-equipment': 'Sports Equipment',
                                        'musical-instrument': 'Musical Instrument',
                                        'fragile': 'Fragile Items'
                                      };
                                      return baggageMap[b] || b;
                                    }).join(', ')}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                ₹{selectedServices.onward.baggage.filter(b => b && b !== 'included')
                                  .reduce((sum, b) => {
                                    const isInternational = selectedFlights.onward?.origin !== selectedFlights.onward?.destination;
                                    return sum + getBaggagePrice(b, isInternational);
                                  }, 0).toLocaleString()}
                              </Typography>
                            </Box>
                          )}
                          {selectedServices.onward.priorityBoarding && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FlightTakeoff fontSize="small" color="action" />
                                <Typography variant="body2">Priority Boarding</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">₹500</Typography>
                            </Box>
                          )}
                          {selectedServices.onward.loungeAccess && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Deck fontSize="small" color="action" />
                                <Typography variant="body2">Lounge Access</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">₹1,500</Typography>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Return Services */}
                    {selectedServices.return && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                          Return Flight
                        </Typography>
                        <Stack spacing={1}>
                          {selectedServices.return.seat && selectedServices.return.seat.some(seat => seat !== null) && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventSeat fontSize="small" color="action" />
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    Seats ({selectedServices.return.seat.filter(seat => seat !== null).length})
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {selectedServices.return.seat.map((seat, index) =>
                                      seat ? `P${index + 1}: ${seat}` : null
                                    ).filter(Boolean).join(', ')}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                ₹{selectedServices.return.seat.filter(seat => seat !== null)
                                  .reduce((total, seat) => total + calculateSeatPrice(seat), 0).toLocaleString()}
                              </Typography>
                            </Box>
                          )}
                          {selectedServices.return.meals && selectedServices.return.meals.filter(m => m && m !== 'none' && m !== '').length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Restaurant fontSize="small" color="action" />
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    Meals ({selectedServices.return.meals.filter(m => m && m !== 'none' && m !== '').length})
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {selectedServices.return.meals.filter(m => m && m !== 'none' && m !== '').map(m => {
                                      const mealMap = {
                                        'veg': 'Vegetarian',
                                        'non-veg': 'Non-Vegetarian',
                                        'nonveg': 'Non-Vegetarian',
                                        'vegan': 'Vegan',
                                        'jain': 'Jain',
                                        'diabetic': 'Diabetic',
                                        'gluten-free': 'Gluten Free'
                                      };
                                      return mealMap[m.toLowerCase()] || m;
                                    }).join(', ')}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="success.main" fontWeight="medium">
                                Free
                              </Typography>
                            </Box>
                          )}
                          {selectedServices.return.baggage && selectedServices.return.baggage.filter(b => b && b !== 'included').length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Luggage fontSize="small" color="action" />
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    Extra Baggage ({selectedServices.return.baggage.filter(b => b && b !== 'included').length})
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {selectedServices.return.baggage.filter(b => b && b !== 'included').map(b => {
                                      const baggageMap = {
                                        '15kg': '15 kg',
                                        '20kg': '20 kg',
                                        '25kg': '25 kg',
                                        '30kg': '30 kg',
                                        'sports-equipment': 'Sports Equipment',
                                        'musical-instrument': 'Musical Instrument',
                                        'fragile': 'Fragile Items'
                                      };
                                      return baggageMap[b] || b;
                                    }).join(', ')}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                ₹{selectedServices.return.baggage.filter(b => b && b !== 'included')
                                  .reduce((sum, b) => {
                                    const isInternational = selectedFlights.return?.origin !== selectedFlights.return?.destination;
                                    return sum + getBaggagePrice(b, isInternational);
                                  }, 0).toLocaleString()}
                              </Typography>
                            </Box>
                          )}
                          {selectedServices.return.priorityBoarding && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FlightTakeoff fontSize="small" color="action" />
                                <Typography variant="body2">Priority Boarding</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">₹500</Typography>
                            </Box>
                          )}
                          {selectedServices.return.loungeAccess && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Deck fontSize="small" color="action" />
                                <Typography variant="body2">Lounge Access</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">₹1,500</Typography>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Sustainability Impact Card - Compact */}
            <Card elevation={2} sx={{ mt: 3, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.dark">
                  <ForestIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Sustainability Impact
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {totalDistance > 0 ? (
                  <Grid container spacing={2}>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="h6" fontWeight="bold" color="success.dark">
                        {Math.round(totalDistance).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        km
                      </Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="h6" fontWeight="bold" color="error.main">
                        {Math.round(totalDistance * 0.255)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        kg CO₂
                      </Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="h6" fontWeight="bold" color="success.dark">
                        {treesPlanted}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Trees
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      We're committed to reducing our carbon footprint. Your journey contributes to our sustainability efforts.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Flight & Booking Details */}
          <Grid item xs={12} md={7}>
            {/* Flight Details */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Flight Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {selectedFlights?.onward && renderFlightDetails(selectedFlights.onward, 'onward')}
                {selectedFlights?.return && renderFlightDetails(selectedFlights.return, 'return')}
              </CardContent>
            </Card>

            {/* Booking & Payment Details Combined */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Booking & Payment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">PNR Number</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">{pnr}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Onward Ticket Number</Typography>
                    <Typography variant="body1" fontWeight="medium">{onwardTicket}</Typography>
                  </Box>
                  {returnTicket && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Return Ticket Number</Typography>
                      <Typography variant="body1" fontWeight="medium">{returnTicket}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary">Number of Passengers</Typography>
                    <Typography variant="body1" fontWeight="medium">{numPassengers}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {paymentDetails?.method?.replace(/_/g, ' ').replace(/-/g, ' ') || 'N/A'}
                    </Typography>
                  </Box>
                  {paymentDetails?.transactionId && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                      <Typography variant="body1" fontWeight="medium">{paymentDetails.transactionId}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary">Payment Date</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {paymentDetails?.paymentDate ? format(new Date(paymentDetails.paymentDate), 'MMM dd, yyyy HH:mm') : format(new Date(), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>


        {/* Action Buttons */}
        <Paper elevation={2} sx={{ mt: 3, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom align="center" color="primary">
            What would you like to do next?
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleDownloadPDF}
                startIcon={<DownloadIcon />}
                size="large"
              >
                Download PDF
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handlePrintConfirmation}
                startIcon={<PrintIcon />}
                size="large"
              >
                Print Ticket
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleEmailConfirmation}
                disabled={emailRequested}
                startIcon={<EmailIcon />}
                size="large"
              >
                {emailRequested ? 'Sent' : 'Email'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleSMSNotification}
                disabled={smsRequested}
                startIcon={<SmsIcon />}
                size="large"
              >
                {smsRequested ? 'Sent' : 'SMS'}
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={handleNewBooking}
              size="large"
            >
              Book Another Flight
            </Button>
          </Box>

          {/* Technical Details Link */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link
              component="button"
              variant="caption"
              onClick={() => setTechDetailsOpen(true)}
              sx={{
                color: 'text.secondary',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Technical Build Details
            </Link>
          </Box>
        </Paper>

        {/* Technical Details Modal */}
        <Dialog
          open={techDetailsOpen}
          onClose={() => setTechDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" component="div">
              Technical Build Information
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Production deployment status and recent changes
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              {/* Build Version Info */}
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Current Build Version
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Version:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" fontFamily="monospace">{BUILD_VERSION.version}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Commit:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" fontFamily="monospace">{BUILD_VERSION.commit}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Build Date:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" fontFamily="monospace">
                      {new Date(BUILD_VERSION.buildDate).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Railway Deployment Status */}
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Railway Deployment Status
                </Typography>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Current Serving:</strong> Commit {BUILD_VERSION.commit}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Latest changes have been pushed to production via GitHub auto-deploy.
                    Railway is serving the most recent commit from the main branch.
                  </Typography>
                </Alert>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <strong>Deployment Method:</strong> GitHub Auto-Deploy (main branch)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <strong>Environment:</strong> Production (Railway)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <strong>Build System:</strong> Nixpacks
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Recent Features */}
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Recent Features Added
                </Typography>
                <Stack spacing={0.5} sx={{ pl: 2 }}>
                  {BUILD_VERSION.features.map((feature, index) => (
                    <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box component="span" sx={{ mr: 1, color: 'success.main', fontWeight: 'bold' }}>✓</Box>
                      {feature}
                    </Typography>
                  ))}
                </Stack>
              </Box>

              <Divider />

              {/* Recent Fixes */}
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Recent Fixes
                </Typography>
                <Stack spacing={0.5} sx={{ pl: 2 }}>
                  {BUILD_VERSION.fixes.map((fix, index) => (
                    <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box component="span" sx={{ mr: 1, color: 'warning.main', fontWeight: 'bold' }}>⚡</Box>
                      {fix}
                    </Typography>
                  ))}
                </Stack>
              </Box>

              {/* Git Sync Status */}
              <Divider />
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Repository Sync Status
                </Typography>
                <Alert severity="success" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>✓ Local and Remote in Sync</strong>
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    All changes from the enhancements branch have been successfully merged to main
                    and pushed to GitHub. Railway is automatically deploying from the main branch.
                  </Typography>
                </Alert>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTechDetailsOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Container>
  );
};

export default BookingConfirmation; 