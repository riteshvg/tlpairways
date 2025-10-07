/**
 * useAncillaryServicesDataLayer Hook
 * Comprehensive data layer tracking for Ancillary Services page
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pageDataLayerManager from '../services/PageDataLayerManager';

const useAncillaryServicesDataLayer = (pageViewOptions = {}) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Form interaction tracking state
  const [formContext, setFormContext] = useState({
    formName: 'ancillary-services-form',
    formStep: 'service-selection',
    totalSteps: 2,
    currentStep: 1,
    fieldsInteracted: [],
    totalRequiredFields: 0,
    timeOnForm: 0
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
  const formatFlightData = useCallback((flight, journeyType) => {
    if (!flight) return null;
    
    return {
      flightNumber: flight.flightNumber || flight.number || 'TLP001',
      airline: flight.airline || 'TLP Airways',
      aircraft: flight.aircraft || 'Boeing 737',
      journeyType,
      origin: {
        code: flight.origin?.iata_code || flight.originCode,
        name: flight.origin?.name || flight.originName,
        city: flight.origin?.city || flight.originCity,
        country: flight.origin?.country || flight.originCountry
      },
      destination: {
        code: flight.destination?.iata_code || flight.destinationCode,
        name: flight.destination?.name || flight.destinationName,
        city: flight.destination?.city || flight.destinationCity,
        country: flight.destination?.country || flight.destinationCountry
      },
      departure: {
        time: flight.departure?.time || flight.departureTime,
        date: flight.departure?.date || flight.departureDate,
        terminal: flight.departure?.terminal || flight.departureTerminal
      },
      arrival: {
        time: flight.arrival?.time || flight.arrivalTime,
        date: flight.arrival?.date || flight.arrivalDate,
        terminal: flight.arrival?.terminal || flight.arrivalTerminal
      },
      duration: flight.duration || flight.flightDuration,
      cabinClass: flight.cabinClass || 'economy',
      price: {
        amount: flight.price?.amount || flight.displayPrices?.[flight.cabinClass] || 0,
        currency: flight.price?.currency || flight.displayCurrency || 'INR'
      }
    };
  }, []);

  // Calculate pricing information
  const calculatePricing = useCallback((onwardFlight, returnFlight) => {
    const onwardPrice = onwardFlight?.price?.amount || onwardFlight?.displayPrices?.[onwardFlight?.cabinClass] || 0;
    const returnPrice = returnFlight?.price?.amount || returnFlight?.displayPrices?.[returnFlight?.cabinClass] || 0;
    const totalPrice = onwardPrice + returnPrice;
    
    return {
      onwardPrice,
      returnPrice,
      totalPrice,
      currency: onwardFlight?.price?.currency || onwardFlight?.displayCurrency || 'INR'
    };
  }, []);

  // Calculate route information
  const calculateRouteInfo = useCallback((onwardFlight, returnFlight) => {
    if (!onwardFlight) return null;
    
    const onwardRoute = `${onwardFlight.origin?.iata_code || onwardFlight.originCode}-${onwardFlight.destination?.iata_code || onwardFlight.destinationCode}`;
    const returnRoute = returnFlight ? `${returnFlight.origin?.iata_code || returnFlight.originCode}-${returnFlight.destination?.iata_code || returnFlight.destinationCode}` : null;
    
    return {
      route: onwardRoute,
      returnRoute,
      tripType: returnFlight ? 'roundtrip' : 'oneway',
      totalSegments: returnFlight ? 2 : 1
    };
  }, []);

  // Initialize ancillary services data layer - PageView event only
  const initializeAncillaryServicesDataLayer = useCallback(() => {
    const { selectedFlights, travellerDetails, contactInfo, tripType } = location.state || {};
    
    if (!selectedFlights?.onward) {
      console.warn('No selected flights data found in location state');
      return;
    }

    // Generate IDs
    const bookingId = generateBookingId();
    const searchId = generateSearchId();
    const pnr = generatePNR();
    const bookingStartTime = new Date().toISOString();

    // Format flight data
    const outboundFlight = formatFlightData(selectedFlights.onward, 'outbound');
    const returnFlightData = selectedFlights.return ? formatFlightData(selectedFlights.return, 'return') : null;

    // Calculate pricing and route info
    const pricing = calculatePricing(selectedFlights.onward, selectedFlights.return);
    const routeInfo = calculateRouteInfo(selectedFlights.onward, selectedFlights.return);

    // Build PageView data layer object
    const pageViewObject = {
      event: 'pageView',
      pageData: {
        pageType: 'ancillary-services',
        pageName: 'Ancillary Services - TLP Airways',
        pageURL: window.location.href,
        referrer: document.referrer || pageDataLayerManager.getPreviousPage(),
        previousPage: 'Traveller Details',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        pageCategory: pageViewOptions.pageCategory || 'booking',
        bookingStep: pageViewOptions.bookingStep || 'ancillary-services',
        bookingStepNumber: 2,
        totalBookingSteps: 4,
        sections: pageViewOptions.sections || [
          'seat-selection',
          'meal-selection',
          'baggage-selection',
          'insurance-selection',
          'booking-summary'
        ]
      },
      bookingContext: {
        bookingId,
        pnr,
        bookingStatus: 'in-progress',
        bookingStep: 'ancillary-services',
        bookingStepNumber: 2,
        totalSteps: 4,
        bookingSteps: [
          'passenger-details',
          'ancillary-services',
          'payment',
          'confirmation'
        ],
        bookingStartTime,
        searchId,
        selectedFlights: {
          outbound: outboundFlight,
          return: returnFlightData
        },
        passengers: travellerDetails || [],
        contactInfo: contactInfo || {},
        tripType: tripType || 'oneway',
        pricing,
        routeInfo
      },
      userContext: {
        userAuthenticated: isAuthenticated,
        userId: user?.id || null,
        userEmail: user?.email || null,
        userLoyaltyTier: user?.loyaltyTier || null,
        sessionId: pageDataLayerManager.getOrCreateSessionId()
      }
    };

    // Push PageView data to Adobe Data Layer
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push(pageViewObject);
    }

    pageDataLayerManager.setPreviousPage('Ancillary Services');
    console.log('✅ Ancillary Services PageView Data Layer initialized:', pageViewObject);

  }, [generateBookingId, generateSearchId, generatePNR, formatFlightData, calculatePricing, calculateRouteInfo, isAuthenticated, user]);


  // Initialize data layer on component mount
  useEffect(() => {
    initializeAncillaryServicesDataLayer();
  }, [initializeAncillaryServicesDataLayer]);

  return {
    formContext
  };
};

export default useAncillaryServicesDataLayer;
