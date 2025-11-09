import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import enhancedAirlinesDataLayer from '../services/EnhancedAirlinesDataLayer';
import pageDataLayerManager from '../services/PageDataLayerManager';
import { format, parseISO, isValid } from 'date-fns';
import { pushToAdobeDataLayer } from '../utils/adobeDataLayerReady';

/**
 * Comprehensive Traveller Details Data Layer Hook
 * Tracks passenger information form interactions and booking progression
 */
const useTravellerDetailsDataLayer = (pageViewOptions = {}) => {
  const location = useLocation();
  const formStartTime = useRef(Date.now());
  const [formContext, setFormContext] = useState({
    formState: 'initialized',
    totalPassengers: 0,
    completedPassengers: 0,
    activePassengerIndex: 0,
    validationEnabled: false,
    autoFillUsed: false,
    fields: {},
    contactInfo: {
      email: '',
      phoneCountryCode: '',
      phoneNumber: '',
      alternatePhoneNumber: '',
      completed: false,
      validationErrors: []
    },
    formProgress: {
      percentComplete: 0,
      fieldsCompleted: 0,
      totalRequiredFields: 0,
      timeOnForm: 0
    }
  });

  // Generate booking ID based on prevailing logic
  const generateBookingId = useCallback((bookingData) => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const routeCode = bookingData?.routeInfo?.route?.replace('-', '') || 'TLP';
    return `booking_${timestamp}_${routeCode}${randomSuffix}`;
  }, []);

  // Generate PNR based on existing logic
  const generatePNR = useCallback(() => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    for (let i = 0; i < 6; i++) {
      pnr += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return pnr;
  }, []);


  // Generate search ID
  const generateSearchId = useCallback(() => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `search_${timestamp}_${randomSuffix}`;
  }, []);

  // Format flight data for data layer
  const formatFlightData = useCallback((flight, type, userDepartureDate, userReturnDate) => {
    if (!flight) return null;

    console.log('formatFlightData called with:', {
      flightNumber: flight.flightNumber,
      type,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      departureTimeType: typeof flight.departureTime,
      arrivalTimeType: typeof flight.arrivalTime,
      userDepartureDate,
      userReturnDate
    });

    // Get the user-selected date (passed from location.state)
    const bookingState = location.state || {};
    const selectedDate = type === 'outbound' 
      ? (userDepartureDate || bookingState.departureDate)
      : (userReturnDate || bookingState.returnDate);

    // Parse flight time and combine with user-selected date
    const getDateTime = (timeString, dateString) => {
      if (!dateString || !timeString) return null;
      try {
        // Ensure timeString is actually a string
        if (typeof timeString !== 'string') {
          console.warn('timeString is not a string:', timeString);
          return null;
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.warn('Invalid dateString:', dateString);
          return null;
        }
        const [hours, minutes] = timeString.split(':');
        date.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
        return date;
      } catch (error) {
        console.error('Error parsing date/time:', error, { timeString, dateString });
        return null;
      }
    };

    const departureDateTime = getDateTime(flight.departureTime, selectedDate);
    const arrivalDateTime = getDateTime(flight.arrivalTime, selectedDate);

    return {
      flightId: `${flight.airlineCode || 'TL'}_${flight.origin}_${flight.destination}_${departureDateTime ? format(departureDateTime, 'yyyyMMdd') : 'unknown'}_${departureDateTime ? format(departureDateTime, 'HHmm') : 'unknown'}`,
      flightNumber: flight.flightNumber || `${flight.airlineCode || 'TL'} ${flight.flightNumber || '000'}`,
      airline: flight.airline || 'TLP Airways',
      airlineCode: flight.airlineCode || 'TL',
      origin: flight.origin,
      originAirport: flight.originAirport || 'Unknown Airport',
      originCity: flight.originCity || 'Unknown City',
      destination: flight.destination,
      destinationAirport: flight.destinationAirport || 'Unknown Airport',
      destinationCity: flight.destinationCity || 'Unknown City',
      departureDate: departureDateTime ? format(departureDateTime, 'yyyy-MM-dd') : 'unknown',
      departureTime: flight.departureTime || 'unknown',
      arrivalDate: arrivalDateTime ? format(arrivalDateTime, 'yyyy-MM-dd') : 'unknown',
      arrivalTime: flight.arrivalTime || 'unknown',
      duration: flight.duration || 'unknown',
      stops: flight.stops || 0,
      aircraft: flight.aircraft || 'Unknown',
      cabinClass: flight.cabinClass || 'economy',
      fareType: flight.fareType || 'Standard',
      fareClass: flight.fareClass || 'S',
      bookingClass: flight.bookingClass || 'S',
      price: flight.price?.amount || flight.price || flight.displayPrices?.[flight.cabinClass] || 0,
      currency: flight.displayCurrency || flight.price?.currency || 'INR',
      availability: flight.availableSeats || 0,
      baggage: {
        checkedBaggage: flight.baggage?.checked || '15 kg',
        cabinBaggage: flight.baggage?.cabin || '7 kg'
      },
      amenities: {
        meals: flight.mealOptions?.includes('veg') || flight.mealOptions?.includes('nonveg') || false,
        wifi: flight.wifi || false,
        entertainment: flight.entertainment || true,
        powerOutlets: flight.powerOutlets || true
      }
    };
  }, []);

  // Calculate pricing breakdown
  const calculatePricing = useCallback((selectedFlights, passengers) => {
    const onwardFlight = selectedFlights?.onward;
    const returnFlight = selectedFlights?.return;
    const numPassengers = (passengers?.adult || 1) + (passengers?.child || 0) + (passengers?.infant || 0);

    const onwardPrice = onwardFlight?.price?.amount || onwardFlight?.displayPrices?.[onwardFlight?.cabinClass] || 0;
    const returnPrice = returnFlight?.price?.amount || returnFlight?.displayPrices?.[returnFlight?.cabinClass] || 0;
    
    const baseFare = (onwardPrice + returnPrice) * numPassengers;
    const taxes = Math.round(baseFare * 0.1); // 10% taxes
    const fees = Math.round(baseFare * 0.02); // 2% fees
    const totalPrice = baseFare + taxes + fees;

    return {
      baseFare,
      taxesAndFees: taxes + fees,
      totalPrice,
      currency: onwardFlight?.displayCurrency || onwardFlight?.price?.currency || 'INR',
      pricePerPassenger: totalPrice / numPassengers,
      breakdown: {
        outboundBaseFare: onwardPrice * numPassengers,
        returnBaseFare: returnPrice * numPassengers,
        taxes,
        fees,
        discount: 0
      }
    };
  }, []);

  // Calculate route information
  const calculateRouteInfo = useCallback((selectedFlights, userDepartureDate, userReturnDate) => {
    const onwardFlight = selectedFlights?.onward;
    const returnFlight = selectedFlights?.return;

    if (!onwardFlight) return null;

    const origin = onwardFlight.origin;
    const destination = onwardFlight.destination;
    
    // Calculate distance if flight has distance property
    const distanceKm = onwardFlight.distance || 0;

    return {
      origin,
      destination,
      route: `${origin}-${destination}`,
      departureDate: userDepartureDate ? format(new Date(userDepartureDate), 'yyyy-MM-dd') : 'unknown',
      returnDate: userReturnDate ? format(new Date(userReturnDate), 'yyyy-MM-dd') : null,
      totalDuration: onwardFlight.duration + (returnFlight?.duration ? ` / ${returnFlight.duration}` : ''),
      distanceKm: distanceKm
    };
  }, []);

  // Initialize traveller details data layer
  const initializeTravellerDetailsDataLayer = useCallback(async () => {
    try {
      // Get booking state from sessionStorage (same as TravellerDetails component)
      const getBookingState = () => {
        try {
          const authRedirectData = sessionStorage.getItem('auth_redirect_data');
          if (authRedirectData) {
            const parsed = JSON.parse(authRedirectData);
            return parsed.bookingState || parsed;
          }
          return location.state || {};
        } catch (error) {
          console.error('Error parsing booking state:', error);
          return location.state || {};
        }
      };
      
      const bookingState = getBookingState();
      const { onwardFlight, returnFlight, tripType, passengers, travellerDetails, departureDate, returnDate } = bookingState || {};
      
      console.log('🔍 useTravellerDetailsDataLayer - Debug:', {
        bookingState,
        passengers,
        passengerCount: pageViewOptions.passengerCount,
        departureDate,
        returnDate
      });
      
      if (!onwardFlight) {
        console.warn('No onward flight data found in booking state');
        return;
      }

      // Generate IDs
      const bookingId = generateBookingId();
      const searchId = generateSearchId();
      const pnr = generatePNR();
      const bookingStartTime = new Date().toISOString();

      // Format flight data with user-selected dates
      const outboundFlight = formatFlightData(onwardFlight, 'outbound', departureDate, returnDate);
      const returnFlightData = returnFlight ? formatFlightData(returnFlight, 'return', departureDate, returnDate) : null;

      // Calculate pricing and route info
      const pricing = calculatePricing({ onward: onwardFlight, return: returnFlight }, passengers);
      const routeInfo = calculateRouteInfo({ onward: onwardFlight, return: returnFlight }, departureDate, returnDate);

      // Calculate passenger breakdown
      const passengerBreakdown = {
        adults: passengers?.adult || 1,
        children: passengers?.child || 0,
        infants: passengers?.infant || 0
      };
      const totalPassengers = passengerBreakdown.adults + passengerBreakdown.children + passengerBreakdown.infants;
      const passengerSummary = `${passengerBreakdown.adults} Adult${passengerBreakdown.adults > 1 ? 's' : ''}${passengerBreakdown.children > 0 ? `, ${passengerBreakdown.children} Child${passengerBreakdown.children > 1 ? 'ren' : ''}` : ''}${passengerBreakdown.infants > 0 ? `, ${passengerBreakdown.infants} Infant${passengerBreakdown.infants > 1 ? 's' : ''}` : ''}`;

      // Initialize form context
      const initialFormContext = {
        formState: 'initialized',
        totalPassengers,
        completedPassengers: 0,
        activePassengerIndex: 0,
        validationEnabled: false,
        autoFillUsed: false,
        fields: {},
        contactInfo: {
          email: '',
          phoneCountryCode: '',
          phoneNumber: '',
          alternatePhoneNumber: '',
          completed: false,
          validationErrors: []
        },
        formProgress: {
          percentComplete: 0,
          fieldsCompleted: 0,
          totalRequiredFields: totalPassengers * 8 + 2, // 8 fields per passenger + 2 contact fields
          timeOnForm: 0
        }
      };

      // Initialize passenger fields
      for (let i = 1; i <= totalPassengers; i++) {
        initialFormContext.fields[`passenger_${i}`] = {
          title: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: '',
          nationality: '',
          passportNumber: '',
          passportExpiry: '',
          frequentFlyerNumber: '',
          specialRequests: {
            meal: '',
            wheelchairAssistance: false,
            infantTravelling: false
          },
          completed: false,
          validationErrors: []
        };
      }

      setFormContext(initialFormContext);

      // Create comprehensive data layer object
      const dataLayerObject = {
        event: 'pageView',
        pageData: {
          pageType: 'traveller-details',
          pageName: 'Traveller Details - TLP Airways',
          pageURL: window.location.href,
          referrer: document.referrer || pageDataLayerManager.getPreviousPage(),
          previousPage: 'Search Results',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
          pageCategory: pageViewOptions.pageCategory || 'booking',
          bookingStep: pageViewOptions.bookingStep || 'passenger-details',
          bookingStepNumber: 1,
          totalBookingSteps: 4,
          sections: pageViewOptions.sections || [
            'passenger-forms',
            'contact-information',
            'booking-summary',
            'fare-breakdown',
            'add-ons'
          ],
          passengerCount: pageViewOptions.passengerCount || 1
        },
        bookingContext: {
          bookingId,
          pnr,
          bookingStatus: 'in-progress',
          bookingStep: 'passenger-details',
          bookingStepNumber: 1,
          totalSteps: 4,
          bookingSteps: [
            'passenger-details',
            'seat-selection',
            'add-ons',
            'payment'
          ],
          bookingStartTime,
          searchId,
          selectedFlights: {
            outbound: outboundFlight,
            return: returnFlightData
          },
          passengers: {
            total: totalPassengers,
            breakdown: {
              adults: {
                count: passengerBreakdown.adults,
                type: 'adult',
                description: '12+ years'
              },
              children: {
                count: passengerBreakdown.children,
                type: 'child',
                description: '2-11 years'
              },
              infants: {
                count: passengerBreakdown.infants,
                type: 'infant',
                description: 'Under 2 years'
              }
            },
            summary: passengerSummary
          },
          tripType: tripType || 'oneway',
          pricing,
          routeInfo
        },
        formContext: initialFormContext,
        userContext: {
          isLoggedIn: false, // Would be determined by auth context
          userId: null, // Would be determined by auth context
          userLoyaltyTier: 'none',
          sessionId: pageDataLayerManager.getOrCreateSessionId(),
          userPreferences: {
            preferred_airlines: ['TLP Airways'],
            preferred_cabin_class: onwardFlight.cabinClass || 'economy',
            price_sensitivity: 'medium',
            loyalty_status: 'none',
            frequent_routes: [],
            saved_travellers: [],
            previous_bookings: 0,
            session_search_count: 1
          },
          autoFillAvailable: true,
          savedTravellers: []
        },
        timestamp: new Date().toISOString()
      };

      // Push data directly to Adobe Data Layer with readiness check
      await pushToAdobeDataLayer(dataLayerObject);

      // Set previous page for next navigation
      pageDataLayerManager.setPreviousPage('Traveller Details');

      console.log('✅ Traveller Details Data Layer initialized:', dataLayerObject);
      console.log('📊 Data layer object pushed to adobeDataLayer:', window.adobeDataLayer);

    } catch (error) {
      console.error('❌ Error initializing Traveller Details Data Layer:', error);
      enhancedAirlinesDataLayer.trackError('traveller-details-initialization', error);
    }
  }, [generateBookingId, generateSearchId, generatePNR, formatFlightData, calculatePricing, calculateRouteInfo]);


  // Initialize data layer on component mount (only once)
  useEffect(() => {
    initializeTravellerDetailsDataLayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    formContext
  };
};

export default useTravellerDetailsDataLayer;
