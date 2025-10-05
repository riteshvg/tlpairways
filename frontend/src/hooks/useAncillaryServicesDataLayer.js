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

  // Initialize ancillary services data layer
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

    // Build comprehensive data layer object
    const dataLayerObject = {
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
        routeInfo,
        ancillaryServices: {
          availableServices: {
            seats: {
              category: 'seating',
              type: 'seat_selection',
              description: 'Choose your preferred seat',
              pricing: {
                standard: { price: 0, currency: 'INR', type: 'free' },
                preferred: { price: 200, currency: 'INR', type: 'paid' },
                extra_legroom: { price: 300, currency: 'INR', type: 'paid' },
                exit_row: { price: 500, currency: 'INR', type: 'paid' }
              },
              options: {
                window: { available: true, type: 'free', description: 'Window seat' },
                aisle: { available: true, type: 'free', description: 'Aisle seat' },
                middle: { available: true, type: 'free', description: 'Middle seat' }
              },
              onward: [],
              return: []
            },
            meals: {
              category: 'dining',
              type: 'meal_selection',
              description: 'Pre-order your meal',
              pricing: {
                standard: { price: 0, currency: 'INR', type: 'free' },
                premium: { price: 500, currency: 'INR', type: 'paid' },
                special_dietary: { price: 0, currency: 'INR', type: 'free' }
              },
              options: {
                vegetarian: { available: true, type: 'free', description: 'Vegetarian meal' },
                non_vegetarian: { available: true, type: 'free', description: 'Non-vegetarian meal' },
                jain: { available: true, type: 'free', description: 'Jain meal' },
                halal: { available: true, type: 'free', description: 'Halal meal' },
                kosher: { available: true, type: 'free', description: 'Kosher meal' },
                child: { available: true, type: 'free', description: 'Child meal' },
                baby: { available: true, type: 'free', description: 'Baby meal' }
              },
              onward: [],
              return: []
            },
            baggage: {
              category: 'baggage',
              type: 'baggage_selection',
              description: 'Add extra baggage allowance',
              pricing: {
                included: { price: 0, currency: 'INR', type: 'free' },
                domestic_extra: { price: 1000, currency: 'INR', type: 'paid' },
                international_extra: { price: 2000, currency: 'INR', type: 'paid' },
                sports_equipment: { price: 1000, currency: 'INR', type: 'paid' },
                musical_instruments: { price: 1000, currency: 'INR', type: 'paid' }
              },
              options: {
                cabin_baggage: { available: true, type: 'free', weight: '7kg', description: 'Cabin baggage' },
                checked_baggage: { available: true, type: 'free', weight: '15kg', description: 'Checked baggage' },
                extra_baggage: { available: true, type: 'paid', weight: '23kg', description: 'Extra baggage' },
                sports_equipment: { available: true, type: 'paid', weight: '32kg', description: 'Sports equipment' },
                musical_instruments: { available: true, type: 'paid', weight: '32kg', description: 'Musical instruments' }
              },
              onward: [],
              return: []
            },
            priority_boarding: {
              category: 'boarding',
              type: 'priority_boarding',
              description: 'Priority boarding access',
              pricing: {
                standard: { price: 0, currency: 'INR', type: 'free' },
                priority: { price: 500, currency: 'INR', type: 'paid' }
              },
              options: {
                standard_boarding: { available: true, type: 'free', description: 'Standard boarding' },
                priority_boarding: { available: true, type: 'paid', description: 'Priority boarding' }
              },
              onward: [],
              return: []
            },
            lounge_access: {
              category: 'lounge',
              type: 'lounge_access',
              description: 'Airport lounge access',
              pricing: {
                standard: { price: 0, currency: 'INR', type: 'free' },
                lounge_access: { price: 1500, currency: 'INR', type: 'paid' }
              },
              options: {
                no_lounge: { available: true, type: 'free', description: 'No lounge access' },
                lounge_access: { available: true, type: 'paid', description: 'Lounge access' }
              },
              onward: [],
              return: []
            },
            insurance: {
              category: 'insurance',
              type: 'travel_insurance',
              description: 'Travel insurance coverage',
              pricing: {
                no_insurance: { price: 0, currency: 'INR', type: 'free' },
                basic: { price: 200, currency: 'INR', type: 'paid' },
                comprehensive: { price: 500, currency: 'INR', type: 'paid' },
                premium: { price: 1000, currency: 'INR', type: 'paid' }
              },
              options: {
                no_insurance: { available: true, type: 'free', description: 'No insurance' },
                basic_insurance: { available: true, type: 'paid', coverage: 'Basic', description: 'Basic travel insurance' },
                comprehensive_insurance: { available: true, type: 'paid', coverage: 'Comprehensive', description: 'Comprehensive travel insurance' },
                premium_insurance: { available: true, type: 'paid', coverage: 'Premium', description: 'Premium travel insurance' }
              },
              selected: null
            }
          },
          selectedServices: {
            seats: {
              onward: [],
              return: []
            },
            meals: {
              onward: [],
              return: []
            },
            baggage: {
              onward: [],
              return: []
            },
            priority_boarding: {
              onward: [],
              return: []
            },
            lounge_access: {
              onward: [],
              return: []
            },
            insurance: null
          },
          pricing: {
            totalAncillaryCost: 0,
            currency: 'INR',
            breakdown: {
              seats: 0,
              meals: 0,
              baggage: 0,
              priority_boarding: 0,
              lounge_access: 0,
              insurance: 0
            }
          },
          summary: {
            totalServicesSelected: 0,
            totalPaidServices: 0,
            totalFreeServices: 0,
            categoriesSelected: []
          }
        }
      },
      formContext: {
        formName: 'ancillary-services-form',
        formStep: 'service-selection',
        totalSteps: 2,
        currentStep: 1,
        fieldsInteracted: [],
        totalRequiredFields: 0,
        timeOnForm: 0
      },
      userContext: {
        userAuthenticated: isAuthenticated,
        userId: user?.id || null,
        userEmail: user?.email || null,
        userLoyaltyTier: user?.loyaltyTier || null,
        sessionId: pageDataLayerManager.getOrCreateSessionId()
      }
    };

    // Push data directly to Adobe Data Layer
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push(dataLayerObject);
    }

    pageDataLayerManager.setPreviousPage('Ancillary Services');
    console.log('✅ Ancillary Services Data Layer initialized:', dataLayerObject);
    console.log('📊 Data layer object pushed to adobeDataLayer:', window.adobeDataLayer);

  }, [generateBookingId, generateSearchId, generatePNR, formatFlightData, calculatePricing, calculateRouteInfo, isAuthenticated, user, pageViewOptions]);

  // Track form field interactions

  // Initialize data layer on component mount
  useEffect(() => {
    initializeAncillaryServicesDataLayer();
  }, [initializeAncillaryServicesDataLayer]);

  return {
    formContext
  };
};

export default useAncillaryServicesDataLayer;
