// The Adobe launch script and data layer are initialized in public/index.html.
// This service file is now only responsible for pushing events to that data layer.

// Initialize Adobe Data Collection
const loadAdobeAnalytics = () => {
  // Initialize the data layer FIRST
  window.adobeDataLayer = window.adobeDataLayer || [];
  console.log('Data layer initialized:', window.adobeDataLayer);

  console.log('Loading Adobe Analytics script...');

  const script = document.createElement('script');
  script.src = "https://assets.adobedtm.com/01296dd00565/26201e3c8f15/launch-2f8b80d50cb3-development.min.js";
  script.async = true;
  script.crossOrigin = 'anonymous';

  script.onerror = (error) => {
    console.error('Error loading Adobe Analytics script:', error);
  };

  script.onload = () => {
    console.log('Adobe Analytics script loaded successfully');
    if (window._satellite) {
      console.log('Satellite object initialized.');
    } else {
      console.error('Satellite object not initialized');
    }
  };

  document.head.appendChild(script);
};

// User Authentication Data Functions
const generateUserId = (user) => {
  // Generate alphanumeric user ID from Auth0 user data
  if (user?.sub) {
    // Extract alphanumeric part from Auth0 sub (format: auth0|1234567890abcdef)
    const subParts = user.sub.split('|');
    if (subParts.length > 1) {
      return subParts[1]; // Return the alphanumeric part
    }
    return user.sub.replace(/[^a-zA-Z0-9]/g, ''); // Remove non-alphanumeric characters
  }
  return null;
};

const pushUserInfo = (user, isAuthenticated) => {
  if (!window.adobeDataLayer) {
    console.warn('Adobe Data Layer not initialized');
    return;
  }

  const userInfo = {
    userInfo: {
      userId: generateUserId(user),
      status: isAuthenticated ? 'authenticated' : 'anonymous',
      timestamp: new Date().toISOString(),
      // Additional user data for analytics
      userType: isAuthenticated ? 'registered' : 'guest',
      loginMethod: user?.sub?.includes('auth0') ? 'auth0' : 'unknown',
    }
  };

  // Push user info to Adobe Data Layer
  window.adobeDataLayer.push(userInfo);
  console.log('User info pushed to Adobe Data Layer:', userInfo);
};

const pushUserLogout = () => {
  if (!window.adobeDataLayer) {
    console.warn('Adobe Data Layer not initialized');
    return;
  }

  const logoutInfo = {
    userInfo: {
      userId: null,
      status: 'anonymous',
      timestamp: new Date().toISOString(),
      userType: 'guest',
      loginMethod: null,
    }
  };

  // Push logout info to Adobe Data Layer
  window.adobeDataLayer.push(logoutInfo);
  console.log('User logout pushed to Adobe Data Layer:', logoutInfo);
};

/**
 * Executes the Adobe Analytics script load.
 * We defer this until the DOM is fully loaded to prevent race conditions.
 */
function initializeAnalytics() {
  if (window.adobeDataLayerInitialized) {
    return;
  }
  window.adobeDataLayerInitialized = true;
  loadAdobeAnalytics();
}

// Wait for the DOM to be ready before initializing analytics.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAnalytics);
} else {
  initializeAnalytics();
}

/**
 * Pushes a structured event object into the global adobeDataLayer queue.
 * This is the single, standardized method for all analytics interactions.
 * @param {object} data The event or data object to be pushed.
 */
const pushToDataLayer = (data) => {
  try {
    // Ensure the dataLayer exists, though it should have been created in index.html.
    window.adobeDataLayer = window.adobeDataLayer || [];
    console.log('Pushing to adobeDataLayer:', data);
    console.log('Current adobeDataLayer length before push:', window.adobeDataLayer.length);
    console.log('Data to push:', JSON.stringify(data, null, 2));
    
    window.adobeDataLayer.push(data);
    console.log('Current adobeDataLayer length after push:', window.adobeDataLayer.length);
    console.log('Latest entry in adobeDataLayer:', window.adobeDataLayer[window.adobeDataLayer.length - 1]);
    console.log('pushToDataLayer completed successfully');
  } catch (error) {
    console.error('Error in pushToDataLayer:', error);
    console.error('Error stack:', error.stack);
    console.error('Data that failed to push:', data);
  }
};

// Common page info structure
const getPageInfo = (pageName, previousPageName = null) => ({
  pageInfo: {
    pageName,
    previousPageName,
    siteSection: 'Booking',
    server: window.location.hostname,
    pageType: 'booking',
    pageCategory: 'flight_booking',
    pageSubCategory: pageName.toLowerCase().replace(/\s+/g, '_')
  },
  attributes: {
    environment: process.env.NODE_ENV || 'development',
    pageType: 'booking',
    pageCategory: 'flight_booking',
    pageSubCategory: pageName.toLowerCase().replace(/\s+/g, '_')
  }
});

// Common flight info structure
const getFlightInfo = (flight) => {
  // Get the correct price based on cabin class
  let price;
  if (flight.prices && flight.cabinClass) {
    price = flight.prices[flight.cabinClass];
  } else if (typeof flight.price === 'object') {
    price = flight.price.amount;
  } else {
    price = flight.price;
  }

  return {
    id: flight.itineraryId || flight.flightNumber,
    name: `${flight.origin.iata_code} to ${flight.destination.iata_code} - ${flight.flightNumber}`,
    price: price,
    brand: flight.airline,
    category: flight.origin.country_code !== 'IN' || flight.destination.country_code !== 'IN' ? 'Flights/International' : 'Flights/Domestic',
    aircraft: flight.aircraft,
    cabinClass: flight.cabinClass || 'economy'
  };
};

// Analytics service methods
const analytics = {
  // Test function to verify analytics is working
  test: () => {
    console.log('Analytics test function called');
    console.log('window.adobeDataLayer exists:', !!window.adobeDataLayer);
    console.log('window.adobeDataLayer length:', window.adobeDataLayer?.length || 0);
    
    const testEvent = {
      event: 'test',
      timestamp: new Date().toISOString(),
      message: 'Analytics test event'
    };
    
    console.log('Pushing test event:', testEvent);
    pushToDataLayer(testEvent);
    console.log('Test event pushed successfully');
  },

  // Page View Events
  pageView: (pageName, previousPageName = null) => {
    pushToDataLayer({
      event: 'pageView',
      ...getPageInfo(pageName, previousPageName),
      source: 'react-app'
    });
  },

  // Search Events
  searchInitiated: (searchParams) => {
    pushToDataLayer({
      event: 'searchInitiated',
      ...getPageInfo('Flight Search'),
      search: {
        originAirport: searchParams.originCode,
        destinationAirport: searchParams.destinationCode,
        departureDate: searchParams.date,
        returnDate: searchParams.returnDate,
        tripType: searchParams.tripType,
        paymentType: searchParams.paymentType,
        passengerCount: {
          adult: searchParams.passengers,
          child: 0,
          infant: 0
        },
        searchDate: new Date().toISOString()
      }
    });
  },

  searchResultsDisplayed: (data) => {
    const { searchParams, results } = data;
    pushToDataLayer({
      event: 'searchResultsDisplayed',
      ...getPageInfo('Search Results', 'Flight Search'),
      search: {
        originAirport: searchParams.originCode,
        destinationAirport: searchParams.destinationCode,
        departureDate: searchParams.date,
        returnDate: searchParams.returnDate,
        tripType: searchParams.tripType,
        paymentType: searchParams.paymentType,
        passengerCount: {
          adult: searchParams.passengers,
          child: 0,
          infant: 0
        },
        resultsCount: results.total,
        searchDate: new Date().toISOString()
      },
      ecommerce: {
        impressions: [
          ...(results.onward || []).map((flight, index) => ({
            ...getFlightInfo(flight),
            list: 'Onward Flights',
            position: index + 1
          })),
          ...(results.return || []).map((flight, index) => ({
            ...getFlightInfo(flight),
            list: 'Return Flights',
            position: index + 1
          }))
        ]
      }
    });
  },

  // Flight Selection Events
  flightSelected: (flight, journeyType, searchParams) => {
    pushToDataLayer({
      event: 'flightSelected',
      ...getPageInfo('Flight Selection', 'Search Results'),
      flight: {
        ...getFlightInfo(flight),
        journeyType,
        cabinClass: searchParams.cabinClass
      },
      search: {
        originAirport: searchParams.originCode,
        destinationAirport: searchParams.destinationCode,
        departureDate: searchParams.date,
        returnDate: searchParams.returnDate,
        tripType: searchParams.tripType
      }
    });
  },

  // Passenger Details Events
  passengerDetailsAdded: (passengerDetails, searchParams) => {
    try {
      console.log('passengerDetailsAdded called with:', { passengerDetails, searchParams });
      
      // Validate inputs
      if (!passengerDetails) {
        console.error('passengerDetailsAdded: passengerDetails is required');
        return;
      }
      
      if (!searchParams) {
        console.error('passengerDetailsAdded: searchParams is required');
        return;
      }
      
      // Get page info
      const pageInfo = getPageInfo('Passenger Details', 'Flight Selection');
      console.log('Page info generated:', pageInfo);
      
      const eventData = {
        event: 'passengerDetailsAdded',
        ...pageInfo,
        passengerDetails,
        search: {
          originAirport: searchParams.originCode,
          destinationAirport: searchParams.destinationCode,
          departureDate: searchParams.date,
          returnDate: searchParams.returnDate,
          tripType: searchParams.tripType
        }
      };
      
      console.log('Pushing passengerDetailsAdded event to data layer:', eventData);
      console.log('Event data structure:', JSON.stringify(eventData, null, 2));
      
      pushToDataLayer(eventData);
      
      console.log('passengerDetailsAdded event pushed successfully');
    } catch (error) {
      console.error('Error in passengerDetailsAdded:', error);
      console.error('Error stack:', error.stack);
    }
  },

  // Ancillary Services Events
  ancillarySelected: (services, flight, journeyType) => {
    pushToDataLayer({
      event: 'ancillarySelected',
      ...getPageInfo('Ancillary Services', 'Passenger Details'),
      services,
      flight: getFlightInfo(flight),
      journeyType
    });
  },

  // Payment Events
  paymentInitiated: (paymentDetails, bookingSummary) => {
    pushToDataLayer({
      event: 'paymentInitiated',
      ...getPageInfo('Payment', 'Ancillary Services'),
      payment: paymentDetails,
      booking: bookingSummary
    });
  },

  paymentCompleted: (paymentDetails, bookingSummary) => {
    pushToDataLayer({
      event: 'paymentCompleted',
      ...getPageInfo('Payment Confirmation', 'Payment'),
      payment: paymentDetails,
      booking: bookingSummary
    });
  },

  // User Authentication Events
  trackUserLogin: (user) => {
    pushUserInfo(user, true);
    pushToDataLayer({
      event: 'userLogin',
      ...getPageInfo('User Login'),
      user: {
        userId: generateUserId(user),
        loginMethod: user?.sub?.includes('auth0') ? 'auth0' : 'unknown',
        timestamp: new Date().toISOString(),
      }
    });
  },

  trackUserLogout: () => {
    pushUserLogout();
    pushToDataLayer({
      event: 'userLogout',
      ...getPageInfo('User Logout'),
      timestamp: new Date().toISOString(),
    });
  },

  trackUserProfileUpdate: (userData) => {
    pushUserInfo(userData, true);
    pushToDataLayer({
      event: 'userProfileUpdate',
      ...getPageInfo('User Profile Update'),
      user: {
        userId: generateUserId(userData),
        updatedFields: Object.keys(userData),
        timestamp: new Date().toISOString(),
      }
    });
  },

  // Helper function to get current user info from data layer
  getCurrentUserInfo: () => {
    if (window.adobeDataLayer) {
      const userInfoEntry = window.adobeDataLayer.find(entry => entry.userInfo);
      return userInfoEntry ? userInfoEntry.userInfo : null;
    }
    return null;
  },

  // Booking Confirmation Events
  bookingConfirmed: (bookingDetails) => {
    const {
      flights,
      passengers,
      services,
      payment,
      totalPrice,
      pnr,
      tickets
    } = bookingDetails;

    // Debug: Log the full flight objects before distance calculation
    console.log('bookingConfirmed: flights.onward.origin:', flights.onward.origin);
    console.log('bookingConfirmed: flights.onward.destination:', flights.onward.destination);
    if (flights.return) {
      console.log('bookingConfirmed: flights.return.origin:', flights.return.origin);
      console.log('bookingConfirmed: flights.return.destination:', flights.return.destination);
    }

    // Calculate distances
    const onwardDistance = calculateDistance(flights.onward.origin, flights.onward.destination);
    const returnDistance = flights.return ? 
      calculateDistance(flights.return.origin, flights.return.destination) : 0;
    const totalDistance = onwardDistance + returnDistance;
    const treesPlanted = Math.floor(totalDistance / 100);

    // Debug logs for distance calculation
    console.log('Distance calculation:', {
      onward: {
        origin: flights.onward.origin.coordinates,
        destination: flights.onward.destination.coordinates,
        distance: onwardDistance
      },
      return: flights.return ? {
        origin: flights.return.origin.coordinates,
        destination: flights.return.destination.coordinates,
        distance: returnDistance
      } : null,
      total: totalDistance,
      treesPlanted
    });

    // Calculate fee breakdown
    const baseFare = flights?.onward?.price?.amount + (flights?.return?.price?.amount || 0);
    const taxes = Math.round(baseFare * 0.05); // 5% tax
    const convenienceFee = Math.round(baseFare * 0.02); // 2% convenience fee
    const surcharge = Math.round(baseFare * 0.01); // 1% surcharge

    // Calculate ancillary services for each flight
    const calculateFlightAncillaries = (flight, journeyServices) => {
      const ancillaries = [];
      let total = 0;

      // Seat costs
      if (journeyServices?.seat) {
        journeyServices.seat.filter(Boolean).forEach(seat => {
          const seatPrice = calculateSeatPrice(seat);
          ancillaries.push({
            name: `Seat ${seat}`,
            price: seatPrice,
            quantity: 1
          });
          total += seatPrice;
        });
      }

      // Baggage costs
      if (journeyServices?.baggage) {
        journeyServices.baggage.filter(b => b && b !== 'included').forEach(baggage => {
          const isInternational = flight.origin.iata_code !== flight.destination.iata_code;
          const baggagePrice = isInternational ? 2000 : 1000;
          ancillaries.push({
            name: `Baggage ${baggage}`,
            price: baggagePrice,
            quantity: 1
          });
          total += baggagePrice;
        });
      }

      // Priority boarding costs
      if (journeyServices?.priorityBoarding) {
        journeyServices.priorityBoarding.filter(Boolean).forEach(() => {
          ancillaries.push({
            name: 'Priority Boarding',
            price: 500,
            quantity: 1
          });
          total += 500;
        });
      }

      // Lounge access costs
      if (journeyServices?.loungeAccess) {
        journeyServices.loungeAccess.filter(Boolean).forEach(() => {
          ancillaries.push({
            name: 'Lounge Access',
            price: 1500,
            quantity: 1
          });
          total += 1500;
        });
      }

      return { ancillaries, total };
    };

    // Calculate ancillaries for both flights
    const onwardAncillaries = calculateFlightAncillaries(flights.onward, services?.onward);
    const returnAncillaries = flights.return ? calculateFlightAncillaries(flights.return, services?.return) : { ancillaries: [], total: 0 };
    
    // Total ancillary fee
    const ancillaryFee = onwardAncillaries.total + returnAncillaries.total;

    pushToDataLayer({
      event: 'bookingConfirmed',
      ...getPageInfo('Booking Confirmation', 'Payment'),
      booking: {
        pnr,
        tickets,
        totalPrice,
        distance: {
          onward: onwardDistance,
          return: returnDistance,
          total: totalDistance
        },
        treesPlanted
      },
      flights: {
        onward: {
          ...getFlightInfo(flights.onward),
          distance: onwardDistance
        },
        ...(flights.return && {
          return: {
            ...getFlightInfo(flights.return),
            distance: returnDistance
          }
        })
      },
      passengers,
      services: calculateFlightAncillaries(flights, services),
      payment: {
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status
      }
    });
  }
};

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

// Helper function to calculate ancillary total
const calculateAncillaryTotal = (services, flights) => {
  let total = 0;
  
  ['onward', 'return'].forEach(journey => {
    if (services?.[journey]) {
      // Seat costs
      if (services[journey].seat) {
        services[journey].seat.forEach(seat => {
          if (seat) {
            const row = parseInt(seat);
            const seatType = seat.slice(-1);
            const isPremiumRow = row <= 5;
            const isWindowSeat = seatType === 'W';
            const seatPrice = (isPremiumRow || isWindowSeat) ? 500 : 100;
            total += seatPrice;
          }
        });
      }
      
      // Baggage cost
      if (services[journey].baggage) {
        services[journey].baggage.forEach(baggage => {
          if (baggage && baggage !== 'included') {
            const isInternational = journey === 'onward' ? 
              flights?.onward?.origin?.iata_code !== flights?.onward?.destination?.iata_code :
              flights?.return?.origin?.iata_code !== flights?.return?.destination?.iata_code;
            const baggagePrice = isInternational ? 2000 : 1000;
            total += baggagePrice;
          }
        });
      }
      
      // Priority boarding costs
      if (services[journey].priorityBoarding) {
        services[journey].priorityBoarding.forEach(priority => {
          if (priority) {
            total += 500;
          }
        });
      }
      
      // Lounge access costs
      if (services[journey].loungeAccess) {
        services[journey].loungeAccess.forEach(lounge => {
          if (lounge) {
            total += 1500;
          }
        });
      }
    }
  });
  
  return total;
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (origin, destination) => {
  console.log('calculateDistance called with:', { origin, destination });
  if (!origin?.coordinates || !destination?.coordinates) {
    console.warn('Missing coordinates for distance calculation:', { origin, destination });
    return 0;
  }

  const lat1 = parseFloat(origin.coordinates.latitude);
  const lon1 = parseFloat(origin.coordinates.longitude);
  const lat2 = parseFloat(destination.coordinates.latitude);
  const lon2 = parseFloat(destination.coordinates.longitude);

  console.log('Parsed coordinates:', { lat1, lon1, lat2, lon2 });

  const R = 6371; // Earth's radius in kilometers
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaLat = (lat2 - lat1) * Math.PI / 180;
  const deltaLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  console.log('Calculated distance:', distance);
  return Math.round(distance); // Round to nearest kilometer
};

export default analytics; 