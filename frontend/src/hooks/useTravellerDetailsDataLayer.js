import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import enhancedAirlinesDataLayer from '../services/EnhancedAirlinesDataLayer';
import pageDataLayerManager from '../services/PageDataLayerManager';
import { format, parseISO, isValid } from 'date-fns';

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
  const formatFlightData = useCallback((flight, type) => {
    if (!flight) return null;

    const departureTime = flight.departureTime ? new Date(flight.departureTime) : null;
    const arrivalTime = flight.arrivalTime ? new Date(flight.arrivalTime) : null;

    return {
      flightId: `${flight.airlineCode || 'TL'}_${flight.origin?.iata_code || flight.originCode}_${flight.destination?.iata_code || flight.destinationCode}_${departureTime ? format(departureTime, 'yyyyMMdd') : 'unknown'}_${departureTime ? format(departureTime, 'HHmm') : 'unknown'}`,
      flightNumber: flight.flightNumber || `${flight.airlineCode || 'TL'} ${flight.flightNumber || '000'}`,
      airline: flight.airline || 'TLP Airways',
      airlineCode: flight.airlineCode || 'TL',
      origin: flight.origin?.iata_code || flight.originCode,
      originAirport: flight.origin?.airport || flight.origin?.name || 'Unknown Airport',
      originCity: flight.origin?.city || 'Unknown City',
      destination: flight.destination?.iata_code || flight.destinationCode,
      destinationAirport: flight.destination?.airport || flight.destination?.name || 'Unknown Airport',
      destinationCity: flight.destination?.city || 'Unknown City',
      departureDate: departureTime ? format(departureTime, 'yyyy-MM-dd') : 'unknown',
      departureTime: departureTime ? format(departureTime, 'HH:mm') : 'unknown',
      arrivalDate: arrivalTime ? format(arrivalTime, 'yyyy-MM-dd') : 'unknown',
      arrivalTime: arrivalTime ? format(arrivalTime, 'HH:mm') : 'unknown',
      duration: flight.duration || 'unknown',
      stops: flight.stops || 0,
      aircraft: flight.aircraft || 'Unknown',
      cabinClass: flight.cabinClass || 'economy',
      fareType: flight.fareType || 'Standard',
      fareClass: flight.fareClass || 'S',
      bookingClass: flight.bookingClass || 'S',
      price: flight.price?.amount || flight.displayPrices?.[flight.cabinClass] || 0,
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
    const numPassengers = passengers?.adult + passengers?.child + passengers?.infant || 1;

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
  const calculateRouteInfo = useCallback((selectedFlights) => {
    const onwardFlight = selectedFlights?.onward;
    const returnFlight = selectedFlights?.return;

    if (!onwardFlight) return null;

    const origin = onwardFlight.origin?.iata_code || onwardFlight.originCode;
    const destination = onwardFlight.destination?.iata_code || onwardFlight.destinationCode;
    
    const departureTime = onwardFlight.departureTime ? new Date(onwardFlight.departureTime) : null;
    const returnTime = returnFlight?.departureTime ? new Date(returnFlight.departureTime) : null;

    return {
      origin,
      destination,
      route: `${origin}-${destination}`,
      departureDate: departureTime ? format(departureTime, 'yyyy-MM-dd') : 'unknown',
      returnDate: returnTime ? format(returnTime, 'yyyy-MM-dd') : null,
      totalDuration: 'unknown', // Would need to calculate from flight durations
      distanceKm: 0 // Would need to calculate from airport coordinates
    };
  }, []);

  // Initialize traveller details data layer
  const initializeTravellerDetailsDataLayer = useCallback(() => {
    try {
      const { onwardFlight, returnFlight, tripType, passengers, travellerDetails } = location.state || {};
      
      if (!onwardFlight) {
        console.warn('No onward flight data found in location state');
        return;
      }

      // Generate IDs
      const bookingId = generateBookingId();
      const searchId = generateSearchId();
      const pnr = generatePNR();
      const bookingStartTime = new Date().toISOString();

      // Format flight data
      const outboundFlight = formatFlightData(onwardFlight, 'outbound');
      const returnFlightData = returnFlight ? formatFlightData(returnFlight, 'return') : null;

      // Calculate pricing and route info
      const pricing = calculatePricing({ onward: onwardFlight, return: returnFlight }, passengers);
      const routeInfo = calculateRouteInfo({ onward: onwardFlight, return: returnFlight });

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
            breakdown: passengerBreakdown,
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

      // Push data directly to Adobe Data Layer
      if (typeof window !== 'undefined' && window.adobeDataLayer) {
        window.adobeDataLayer.push(dataLayerObject);
      }

      // Set previous page for next navigation
      pageDataLayerManager.setPreviousPage('Traveller Details');

      console.log('✅ Traveller Details Data Layer initialized:', dataLayerObject);
      console.log('📊 Data layer object pushed to adobeDataLayer:', window.adobeDataLayer);

    } catch (error) {
      console.error('❌ Error initializing Traveller Details Data Layer:', error);
      enhancedAirlinesDataLayer.trackError('traveller-details-initialization', error);
    }
  }, [location.state, generateBookingId, generateSearchId, formatFlightData, calculatePricing, calculateRouteInfo]);

  // Track form field interactions
  const trackFormFieldInteraction = useCallback((fieldName, fieldValue, passengerIndex = null) => {
    try {
      const fieldData = {
        event: 'formFieldInteraction',
        formType: 'traveller-details',
        fieldName,
        fieldValue: fieldValue?.toString() || '',
        passengerIndex,
        timestamp: new Date().toISOString(),
        timeOnForm: Date.now() - formStartTime.current
      };

      // Push directly to Adobe Data Layer
      if (typeof window !== 'undefined' && window.adobeDataLayer) {
        window.adobeDataLayer.push(fieldData);
      }

      // Update form context
      setFormContext(prev => {
        const updated = { ...prev };
        
        if (passengerIndex !== null) {
          const passengerKey = `passenger_${passengerIndex}`;
          if (updated.fields[passengerKey]) {
            updated.fields[passengerKey] = {
              ...updated.fields[passengerKey],
              [fieldName]: fieldValue
            };
          }
        } else if (fieldName.startsWith('contact_')) {
          const contactField = fieldName.replace('contact_', '');
          updated.contactInfo[contactField] = fieldValue;
        }

        // Recalculate progress
        const totalFields = Object.keys(updated.fields).length * 8 + 2;
        let completedFields = 0;
        
        Object.values(updated.fields).forEach(passenger => {
          if (passenger.firstName) completedFields++;
          if (passenger.lastName) completedFields++;
          if (passenger.dateOfBirth) completedFields++;
          if (passenger.gender) completedFields++;
          if (passenger.nationality) completedFields++;
          if (passenger.passportNumber) completedFields++;
          if (passenger.passportExpiry) completedFields++;
          if (passenger.frequentFlyerNumber) completedFields++;
        });

        if (updated.contactInfo.email) completedFields++;
        if (updated.contactInfo.phoneNumber) completedFields++;

        updated.formProgress = {
          ...updated.formProgress,
          percentComplete: Math.round((completedFields / totalFields) * 100),
          fieldsCompleted: completedFields,
          totalRequiredFields: totalFields,
          timeOnForm: Date.now() - formStartTime.current
        };

        return updated;
      });

    } catch (error) {
      console.error('❌ Error tracking form field interaction:', error);
    }
  }, []);

  // Track form validation
  const trackFormValidation = useCallback((validationResults) => {
    try {
      const validationData = {
        event: 'formValidation',
        formType: 'traveller-details',
        validationResults,
        timestamp: new Date().toISOString(),
        timeOnForm: Date.now() - formStartTime.current
      };

      // Push directly to Adobe Data Layer
      if (typeof window !== 'undefined' && window.adobeDataLayer) {
        window.adobeDataLayer.push(validationData);
      }
    } catch (error) {
      console.error('❌ Error tracking form validation:', error);
    }
  }, []);

  // Track form submission
  const trackFormSubmission = useCallback((formData) => {
    try {
      const submissionData = {
        event: 'formSubmission',
        formType: 'traveller-details',
        formData,
        timestamp: new Date().toISOString(),
        timeOnForm: Date.now() - formStartTime.current,
        formContext
      };

      // Push directly to Adobe Data Layer
      if (typeof window !== 'undefined' && window.adobeDataLayer) {
        window.adobeDataLayer.push(submissionData);
      }
    } catch (error) {
      console.error('❌ Error tracking form submission:', error);
    }
  }, [formContext]);

  // Initialize data layer on component mount
  useEffect(() => {
    initializeTravellerDetailsDataLayer();
  }, [initializeTravellerDetailsDataLayer]);

  return {
    formContext,
    trackFormFieldInteraction,
    trackFormValidation,
    trackFormSubmission
  };
};

export default useTravellerDetailsDataLayer;
