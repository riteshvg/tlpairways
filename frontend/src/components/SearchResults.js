import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// usePageView removed - now using merged pageView event
import { useAuth } from '../context/AuthContext';
import airlinesDataLayer from '../services/AirlinesDataLayer';
import { 
  calculateDistance, 
  getSpecialDay, 
  getUserLocation, 
  calculateRevenueAnalytics,
  getUserPreferences 
} from '../utils/searchAnalytics';
import {
  Container,
  Typography,
  Paper,
  List,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { format, differenceInMinutes, differenceInDays } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import flightRoutes from '../data/flight_routes.json';
import FlightDetailsModal from './FlightDetailsModal';
import CURRENCY_CONFIG from '../config/currencyConfig';
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

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Page view is now handled in the merged event below
  
  // Initialize state with default values
  const [searchParams, setSearchParams] = useState(null);
  const [searchId, setSearchId] = useState(null);
  const [onwardFlights, setOnwardFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [selectedOnwardFlight, setSelectedOnwardFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Initialize search parameters from location state
  useEffect(() => {
    try {
      if (location.state) {
        console.log('Location state received:', location.state);
        const {
    originCode,
    destinationCode,
    date,
    returnDate,
    passengers,
    passengerCounts,
    paymentType,
    tripType,
          cabinClass,
          travelPurpose,
          searchDateTime,
          previousPage
        } = location.state;

        if (!originCode || !destinationCode || !date) {
          throw new Error('Missing required search parameters');
        }

        // Ensure proper date parsing
        const travelDate = new Date(date);
        const currentDate = new Date();
        
        // Calculate numberOfDays with validation
        let numberOfDays = differenceInDays(travelDate, currentDate);
        if (numberOfDays < 0) numberOfDays = 0;
        if (isNaN(travelDate.getTime())) numberOfDays = 0;
        
        const params = {
          originCode,
          destinationCode,
          date: travelDate,
          returnDate: returnDate ? new Date(returnDate) : null,
          passengers: passengers || 1,
          passengerCounts: passengerCounts || { adult: 1, child: 0, infant: 0 },
          paymentType: paymentType || 'oneway',
          tripType: tripType || 'oneway',
          cabinClass: cabinClass || 'economy',
          travelPurpose: travelPurpose || 'personal',
          searchDateTime: searchDateTime || new Date().toISOString().split('T')[0],
          previousPage,
          numberOfDays: numberOfDays // Days between booking and travel
        };

        console.log('Search params set:', params);
        console.log('Passenger counts:', params.passengerCounts);
        console.log('Number of days until travel:', params.numberOfDays);
        console.log('Travel date:', params.date);
        console.log('Current date:', currentDate);
        console.log('Raw date input:', date);
        console.log('Parsed travel date:', travelDate);
        console.log('Date difference calculation:', differenceInDays(travelDate, currentDate));
        setSearchParams(params);
        setSearchId(`search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      } else {
        console.error('No search parameters found');
      }
    } catch (err) {
      console.error('Error initializing search parameters:', err);
      // Track search initialization error
      airlinesDataLayer.trackEvent('search-error', {
        errorType: 'search-initialization',
        errorMessage: err.message,
        timestamp: new Date().toISOString()
      });
    }
  }, [location.state]);

  const getMatchingFlights = (origin, destination, searchDate, cabinClass) => {
    if (!origin || !destination || !searchDate || !cabinClass) return [];

    try {
      const routeKey = `${origin}-${destination}`;
      const routeData = flightRoutes.routes[routeKey];
      
      if (!routeData) return [];

      // Get all flights for the route
      const allFlights = [...routeData.onward, ...routeData.return];
      
      return allFlights
        .filter(flight => {
          // Check if the flight matches the origin and destination
          return flight.origin.iata_code === origin && 
                 flight.destination.iata_code === destination;
        })
        .map((flight, index) => {
          // Calculate prices for different cabin classes
          const basePrice = flight.price.amount;
      let prices = {
        economy: basePrice,
        premium_economy: Math.round(basePrice * 1.3),
        business: Math.round(basePrice * 1.7),
        first: Math.round(basePrice * 2.2)
      };

          // Filter available classes based on flight's cabinClasses
          const availableClasses = flight.cabinClasses;
          Object.keys(prices).forEach(className => {
            if (!availableClasses.includes(className)) {
              delete prices[className];
            }
          });

          // Create a flight object with the search date
          const departureTime = new Date(searchDate);
          const [hours, minutes] = flight.departureTime.split(':');
          departureTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          const arrivalTime = new Date(searchDate);
          const [arrHours, arrMinutes] = flight.arrivalTime.split(':');
          arrivalTime.setHours(parseInt(arrHours), parseInt(arrMinutes), 0, 0);

          // If arrival time is before departure time, it means the flight arrives the next day
          if (arrivalTime < departureTime) {
            arrivalTime.setDate(arrivalTime.getDate() + 1);
      }

      // Get country codes for origin and destination
      const originAirport = findAirportByCode(flight.origin.iata_code);
      const destAirport = findAirportByCode(flight.destination.iata_code);
      const originCountry = originAirport?.country || 'India';
      const destCountry = destAirport?.country || 'India';
      
      // Check if this is an international flight
      const isInternational = CURRENCY_CONFIG.isInternationalFlight(originCountry, destCountry);
      
      // Determine display currency based on origin country
      const displayCurrency = CURRENCY_CONFIG.getCurrencyForCountry(originCountry);
      
      // Convert prices for display (keep original INR prices in backend)
          const displayPrices = {};
          Object.keys(prices).forEach(className => {
            if (displayCurrency !== 'INR') {
              // Convert INR to target currency for display
              displayPrices[className] = Math.round(CURRENCY_CONFIG.convertPrice(prices[className], 'INR', displayCurrency));
            } else {
              displayPrices[className] = prices[className];
            }
          });

          // Calculate duration in minutes
          const durationMinutes = differenceInMinutes(arrivalTime, departureTime);
          const duration = `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`;

          return {
            ...flight,
            departureTime,
            arrivalTime,
            prices,
            displayPrices,
            isInternational,
            displayCurrency,
            originalPrices: prices, // Keep original INR prices
            availableClasses,
            currentPrice: prices[cabinClass] || basePrice,
            duration,
            durationMinutes,
            resultPosition: index + 1
          };
    });
    } catch (err) {
      console.error('Error getting matching flights:', err);
      return [];
    }
  };

  // Update flights when search parameters change
  useEffect(() => {
    if (searchParams?.originCode && searchParams?.destinationCode && searchParams?.date && searchParams?.cabinClass) {
      try {
        const matchingFlights = getMatchingFlights(
          searchParams.originCode,
          searchParams.destinationCode,
          searchParams.date,
          searchParams.cabinClass
        );
        setOnwardFlights(matchingFlights);

        if (searchParams.tripType === 'roundtrip' && searchParams.returnDate) {
          const returnMatchingFlights = getMatchingFlights(
            searchParams.destinationCode,
            searchParams.originCode,
            searchParams.returnDate,
            searchParams.cabinClass
          );
          setReturnFlights(returnMatchingFlights);
        } else {
          setReturnFlights([]);
        }
        
        // Initialize search tracking
        if (searchId) {
          console.log('Search initialized with ID:', searchId);
        }
        
      } catch (err) {
        console.error('Error updating flights:', err);
      }
    }
  }, [searchParams, searchId]);

  // Track merged page view with search results data
  useEffect(() => {
    const trackPageView = async () => {
      if (searchParams && (onwardFlights.length > 0 || returnFlights.length > 0)) {
        try {
        // Get airport information for enhanced data
        const originAirport = findAirportByCode(searchParams.originCode);
        const destAirport = findAirportByCode(searchParams.destinationCode);
        
        // Calculate distance
        const distance = calculateDistance(originAirport, destAirport);
        
        // Check for special days
        const onwardSpecialDay = getSpecialDay(searchParams.date, originAirport?.country);
        const returnSpecialDay = searchParams.returnDate ? 
          getSpecialDay(searchParams.returnDate, destAirport?.country) : null;
        
        // Calculate numberOfDays fresh to ensure accuracy
        const travelDate = new Date(searchParams.date);
        const currentDate = new Date();
        let calculatedNumberOfDays = differenceInDays(travelDate, currentDate);
        
        // Ensure numberOfDays is never negative (past dates should be 0)
        if (calculatedNumberOfDays < 0) {
          calculatedNumberOfDays = 0;
        }
        
        // Validate that we have a valid date
        if (isNaN(travelDate.getTime())) {
          console.error('Invalid travel date:', searchParams.date);
          calculatedNumberOfDays = 0;
        }
        
        console.log('🔍 Data Layer numberOfDays Calculation:');
        console.log('  Travel Date:', travelDate);
        console.log('  Current Date:', currentDate);
        console.log('  Raw difference:', differenceInDays(travelDate, currentDate));
        console.log('  Final numberOfDays:', calculatedNumberOfDays);
        console.log('  searchParams.numberOfDays:', searchParams.numberOfDays);
        
        // Get user location (async)
        const userLocation = await getUserLocation();
        
        
        // Calculate revenue analytics
        // Get currency from user location or default to INR
        const userCurrency = userLocation?.currency || 'INR';
        const revenueData = calculateRevenueAnalytics(onwardFlights, searchParams.passengers, userCurrency);
        
        // Get user preferences
        const userPrefs = getUserPreferences(user, {
          totalSearches: parseInt(sessionStorage.getItem('tlp_search_count') || '0'),
          sessionSearches: 1,
          avgBookingWindow: differenceInDays(searchParams.date, new Date())
        });

        // Create merged pageView event with enhanced search results data
        const mergedEvent = {
          event: 'pageView',
          pageData: {
            pageType: 'search-results',
            pageName: 'Search Results',
            pageURL: window.location.href,
            referrer: document.referrer,
            previousPage: searchParams.previousPage || document.referrer || 'direct',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            pageCategory: 'booking',
            searchType: 'flight-results',
            sections: ['results-list', 'filters', 'sorting', 'pagination']
          },
          searchContext: {
            // Basic search parameters
            searchId,
            origin: searchParams.originCode,
            destination: searchParams.destinationCode,
            originDestination: searchParams.originCode && searchParams.destinationCode 
              ? `${searchParams.originCode}-${searchParams.destinationCode}`
              : null,
            departureDate: searchParams.date ? format(new Date(searchParams.date), 'yyyy-MM-dd') : null,
            returnDate: searchParams.returnDate ? format(new Date(searchParams.returnDate), 'yyyy-MM-dd') : null,
            travelDay: searchParams.date ? format(new Date(searchParams.date), 'EEEE') : null,
            numberOfDays: calculatedNumberOfDays,
            passengers: {
              total: searchParams.passengers || 0,
              breakdown: {
                adults: {
                  count: searchParams.passengerCounts?.adult || 0,
                  type: 'adult',
                  description: '12+ years'
                },
                children: {
                  count: searchParams.passengerCounts?.child || 0,
                  type: 'child', 
                  description: '2-11 years'
                },
                infants: {
                  count: searchParams.passengerCounts?.infant || 0,
                  type: 'infant',
                  description: 'Under 2 years'
                }
              },
              summary: searchParams.passengerCounts ? 
                Object.entries(searchParams.passengerCounts)
                  .filter(([type, count]) => count > 0)
                  .map(([type, count]) => `${type}: ${count}`)
                  .join(', ') : 'No passengers'
            },
            cabinClass: searchParams.cabinClass,
            tripType: searchParams.tripType,
            travelPurpose: searchParams.travelPurpose,
            searchDateTime: searchParams.searchDateTime,
            
            // Enhanced search criteria (merged from search-results-displayed)
            searchCriteria: {
              originAirport: searchParams.originCode,
              originAirportName: originAirport?.name || '',
              originCity: originAirport?.city || '',
              originCountry: originAirport?.country || '',
              destinationAirport: searchParams.destinationCode,
              destinationAirportName: destAirport?.name || '',
              destinationCity: destAirport?.city || '',
              destinationCountry: destAirport?.country || '',
              departureDate: format(searchParams.date, 'yyyy-MM-dd'),
              returnDate: searchParams.returnDate ? format(searchParams.returnDate, 'yyyy-MM-dd') : null,
              tripType: searchParams.tripType === 'roundtrip' ? 'roundTrip' : 'oneWay',
              passengers: {
                adults: searchParams.passengerCounts?.adult || 0,
                children: searchParams.passengerCounts?.child || 0,
                infants: searchParams.passengerCounts?.infant || 0,
                total: searchParams.passengers || 0
              },
              cabinClass: searchParams.cabinClass,
              travelPurpose: searchParams.travelPurpose,
              searchDateTime: searchParams.searchDateTime,
              flexibleDates: false,
              directFlightsOnly: false
            },
            
            // Distance and special days
            distanceKm: distance,
            specialDays: {
              onward: onwardSpecialDay,
              return: returnSpecialDay,
              hasSpecialDays: onwardSpecialDay.is_special || (returnSpecialDay?.is_special || false)
            },
            
            
            // Revenue tracking
            revenueData: revenueData,
            
            // Geography
            geography: {
              userLocation: userLocation
            },
            
            // Search performance
            searchPerformance: {
              searchDurationMs: 0, // Search duration not available in this component
              resultsLoadedAt: new Date().toISOString(),
              searchAbandoned: false
            }
          },
          userContext: {
            // Basic user context
            isLoggedIn: isAuthenticated,
            userId: user?.id || null,
            userLoyaltyTier: user?.loyaltyTier || null,
            sessionId: sessionStorage.getItem('tlp_session_id') || `session_${Date.now()}`,
            
            // Enhanced user context (merged from search-results-displayed)
            userContext: {
              isLoggedIn: isAuthenticated,
              userId: user?.id || null,
              loyaltyTier: user?.loyaltyTier || 'none',
              sessionId: sessionStorage.getItem('tlp_session_id') || `session_${Date.now()}`,
              searchCount: parseInt(sessionStorage.getItem('tlp_search_count') || '0')
            },
            
            // User preferences (moved from search-results-displayed)
            userPreferences: userPrefs
          },
          timestamp: new Date().toISOString()
        };

        // Push merged event to data layer
        airlinesDataLayer.pushToDataLayer(mergedEvent);
        
          console.log('🛩️ Enhanced pageView with merged search results tracked:', mergedEvent);
        } catch (err) {
          console.error('Error tracking merged page view:', err);
          airlinesDataLayer.trackEvent('search-error', {
            errorType: 'merged-pageview-tracking',
            errorMessage: err.message,
            searchId,
            timestamp: new Date().toISOString()
          });
        }
      }
    };
    
    trackPageView();
  }, [searchParams, onwardFlights, returnFlights, searchId, isAuthenticated, user]);

  // Track search abandonment on component unmount
  useEffect(() => {
    return () => {
      console.log('Search results component unmounted');
    };
  }, []);

  const handleCloseModal = (isReturn = false) => {
    if (isReturn) {
      setIsReturnModalOpen(false);
      setSelectedReturnFlight(null);
    } else {
      setIsModalOpen(false);
      setSelectedFlight(null);
    }
  };

  const handleSelectFlight = (flight, type) => {
    console.log('handleSelectFlight called with:', {
      flight,
      type,
      currentSelectedOnward: selectedOnwardFlight,
      currentSelectedReturn: selectedReturnFlight,
      searchParams
    });

    // Get the correct price for the selected cabin class
    const selectedPrice = flight.prices[searchParams.cabinClass];
    const flightWithCorrectPrice = {
      ...flight,
      cabinClass: searchParams.cabinClass,
      price: {
        amount: selectedPrice,
        currency: 'INR'
      },
      prices: flight.prices,
      displayPrices: flight.displayPrices, // Preserve display prices
      displayCurrency: flight.displayCurrency, // Preserve display currency
      isInternational: flight.isInternational, // Preserve international flag
      originalPrices: flight.originalPrices, // Preserve original prices
      basePrice: flight.prices.economy
    };

    if (type === 'onward') {
      setSelectedOnwardFlight(flightWithCorrectPrice);
      console.log('Onward flight selected:', flightWithCorrectPrice);
    } else {
      setSelectedReturnFlight(flightWithCorrectPrice);
      console.log('Return flight selected:', flightWithCorrectPrice);
    }

    // Track flight selection with correct price
    try {
      airlinesDataLayer.trackEvent('flight-selected', {
        flight: {
          flightNumber: flightWithCorrectPrice.flightNumber,
          airline: flightWithCorrectPrice.airline,
          origin: flightWithCorrectPrice.origin.iata_code,
          destination: flightWithCorrectPrice.destination.iata_code,
          departureTime: flightWithCorrectPrice.departureTime.toISOString(),
          arrivalTime: flightWithCorrectPrice.arrivalTime.toISOString(),
          duration: flightWithCorrectPrice.duration,
          stops: flightWithCorrectPrice.stops || 0,
          price: flightWithCorrectPrice.price.amount,
          currency: flightWithCorrectPrice.price.currency,
          cabinClass: flightWithCorrectPrice.cabinClass,
          availability: flightWithCorrectPrice.availableSeats || 0,
          aircraft: flightWithCorrectPrice.aircraft,
          resultPosition: flightWithCorrectPrice.resultPosition
        },
        searchContext: {
          searchId,
          resultPosition: flightWithCorrectPrice.resultPosition,
          totalResults: onwardFlights.length + returnFlights.length,
          currentFilters: [],
          sortBy: 'default'
        },
        userContext: {
          isLoggedIn: isAuthenticated,
          loyaltyTier: user?.loyaltyTier || null,
          userId: user?.id || null
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking flight selection:', error);
      airlinesDataLayer.trackEvent('search-error', {
        errorType: 'flight-selection-tracking',
        errorMessage: error.message,
        searchId,
        timestamp: new Date().toISOString()
      });
    }

    // For one-way journey, proceed to traveller details after selecting onward flight
    if (searchParams.tripType === 'oneway' && type === 'onward') {
      console.log('One-way journey detected, navigating to traveller details');
      navigate('/traveller-details', {
        state: {
          onwardFlight: flightWithCorrectPrice,
          tripType: searchParams.tripType,
          passengers: searchParams.passengers,
          cabinClass: searchParams.cabinClass,
          previousPage: 'Search Results'
        }
      });
    }
  };

  const handleProceedToTravellerDetails = () => {
    console.log('handleProceedToTravellerDetails called with:', {
      selectedOnwardFlight,
      selectedReturnFlight,
      searchParams
    });

    if (!selectedOnwardFlight) {
      console.warn('No onward flight selected');
      return;
    }

    if (searchParams.tripType === 'roundtrip' && !selectedReturnFlight) {
      console.warn('Round trip selected but no return flight chosen');
      return;
    }

    const navigationState = {
      onwardFlight: {
        ...selectedOnwardFlight,
        cabinClass: searchParams.cabinClass,
        price: {
          amount: selectedOnwardFlight.prices[searchParams.cabinClass],
          currency: 'INR'
        },
        displayPrices: selectedOnwardFlight.displayPrices, // Preserve display prices
        displayCurrency: selectedOnwardFlight.displayCurrency, // Preserve display currency
        isInternational: selectedOnwardFlight.isInternational, // Preserve international flag
        originalPrices: selectedOnwardFlight.originalPrices, // Preserve original prices
        basePrice: selectedOnwardFlight.prices.economy,
        prices: selectedOnwardFlight.prices
      },
      returnFlight: selectedReturnFlight ? {
        ...selectedReturnFlight,
        cabinClass: searchParams.cabinClass,
        price: {
          amount: selectedReturnFlight.prices[searchParams.cabinClass],
          currency: 'INR'
        },
        displayPrices: selectedReturnFlight.displayPrices, // Preserve display prices
        displayCurrency: selectedReturnFlight.displayCurrency, // Preserve display currency
        isInternational: selectedReturnFlight.isInternational, // Preserve international flag
        originalPrices: selectedReturnFlight.originalPrices, // Preserve original prices
        basePrice: selectedReturnFlight.prices.economy,
        prices: selectedReturnFlight.prices
      } : null,
      tripType: searchParams.tripType,
      passengers: searchParams.passengers,
      cabinClass: searchParams.cabinClass,
      previousPage: 'Search Results'
    };

    console.log('Navigating to traveller details with state:', navigationState);

    // Track proceed to traveller details
    try {
      airlinesDataLayer.trackEvent('search-proceed-to-traveller-details', {
        searchId,
        selectedFlights: {
          onward: selectedOnwardFlight ? {
            flightNumber: selectedOnwardFlight.flightNumber,
            airline: selectedOnwardFlight.airline,
            price: selectedOnwardFlight.price.amount
          } : null,
          return: selectedReturnFlight ? {
            flightNumber: selectedReturnFlight.flightNumber,
            airline: selectedReturnFlight.airline,
            price: selectedReturnFlight.price.amount
          } : null
        },
        totalPrice: (() => {
          const onwardPrice = selectedOnwardFlight ? 
            selectedOnwardFlight.displayPrices?.[searchParams.cabinClass] * searchParams.passengers : 0;
          const returnPrice = selectedReturnFlight ? 
            selectedReturnFlight.displayPrices?.[searchParams.cabinClass] * searchParams.passengers : 0;
          return onwardPrice + returnPrice;
        })(),
        tripType: searchParams.tripType,
        passengers: searchParams.passengers,
        cabinClass: searchParams.cabinClass,
        userContext: {
          isLoggedIn: isAuthenticated,
          userId: user?.id || null
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking proceed to traveller details:', error);
    }

    navigate('/traveller-details', {
      state: navigationState
    });
  };

  const renderFlightCard = (flight, isReturn = false) => {
    const pricePerPassenger = flight.displayPrices[searchParams.cabinClass] || flight.displayPrices.economy;
    const numPassengers = searchParams.passengers || 1;
    const totalPrice = pricePerPassenger * numPassengers;
    const isSelected = isReturn ? 
      selectedReturnFlight?.flightNumber === flight.flightNumber :
      selectedOnwardFlight?.flightNumber === flight.flightNumber;

    console.log('Rendering flight card:', {
      flightNumber: flight.flightNumber,
      isReturn,
      isSelected,
      pricePerPassenger,
      numPassengers,
      totalPrice,
      cabinClass: searchParams.cabinClass
    });

    return (
          <Card 
        key={flight.flightNumber} 
            sx={{ 
          mb: 2, 
          border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
              '&:hover': { 
            boxShadow: 3
          }
            }}
          >
            <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">{flight.airline}</Typography>
              <Typography variant="body2" color="textSecondary">
                    {flight.flightNumber}
                  </Typography>
              <Typography variant="body2">
                {format(flight.departureTime, 'HH:mm')} - {format(flight.arrivalTime, 'HH:mm')}
                    </Typography>
                </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">
                {flight.origin.iata_code} → {flight.destination.iata_code}
                    </Typography>
              <Typography variant="body2" color="textSecondary">
                {(() => {
                  const originAirport = findAirportByCode(flight.origin.iata_code);
                  const destAirport = findAirportByCode(flight.destination.iata_code);
                  return `${originAirport?.name || flight.origin.iata_code} → ${destAirport?.name || flight.destination.iata_code}`;
                })()}
                    </Typography>
              <Typography variant="body2" color="textSecondary">
                {format(flight.departureTime, 'MMM dd, yyyy')}
                    </Typography>
              <Typography variant="body2">
                {flight.aircraft}
                    </Typography>
                </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" color="primary">
                {CURRENCY_CONFIG.formatPrice(totalPrice, flight.displayCurrency)} <Typography component="span" variant="body2" color="textSecondary">({CURRENCY_CONFIG.formatPrice(pricePerPassenger, flight.displayCurrency)} x {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
              </Typography>
              {flight.isInternational && (
                <Typography variant="body2" color="textSecondary">
                  *Price will be converted to INR during payment
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary">
                {searchParams.cabinClass.charAt(0).toUpperCase() + searchParams.cabinClass.slice(1)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSelectFlight(flight, isReturn ? 'return' : 'onward')}
                sx={{ mt: 1 }}
              >
                {isSelected ? 'Selected' : 'Select'}
              </Button>
            </Grid>
              </Grid>
            </CardContent>
          </Card>
    );
  };

  const renderFlightList = (flights, isReturn = false) => (
    <List>
      {flights.map(flight => renderFlightCard(flight, isReturn))}
    </List>
  );

  // Debug function for testing data layer
  const debugDataLayer = () => {
    console.log('🔍 Search Results Data Layer Debug (Merged pageView):');
    console.log('Search ID:', searchId);
    console.log('Search Params:', searchParams);
    console.log('Passenger Details:', {
      total: searchParams?.passengers || 0,
      breakdown: searchParams?.passengerCounts || {},
      summary: searchParams?.passengerCounts ? 
        Object.entries(searchParams.passengerCounts)
          .filter(([type, count]) => count > 0)
          .map(([type, count]) => `${type}: ${count}`)
          .join(', ') : 'No passengers'
    });
    console.log('Number of Days:', searchParams?.date && searchParams?.returnDate ? 
      differenceInDays(new Date(searchParams.returnDate), new Date(searchParams.date)) : 'N/A');
    console.log('Onward Flights:', onwardFlights.length);
    console.log('Return Flights:', returnFlights.length);
    console.log('Selected Onward:', selectedOnwardFlight?.flightNumber);
    console.log('Selected Return:', selectedReturnFlight?.flightNumber);
    console.log('Data Layer Length:', window.adobeDataLayer?.length || 0);
    console.log('Latest Events:', window.adobeDataLayer?.slice(-5) || []);
    
    // Check for merged pageView events
    const pageViewEvents = window.adobeDataLayer?.filter(event => event.event === 'pageView') || [];
    console.log('PageView Events:', pageViewEvents);
    
    // Make debug function globally available
    if (typeof window !== 'undefined') {
      window.debugSearchResults = debugDataLayer;
    }
  };

  // Call debug function in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      debugDataLayer();
    }
  }, [searchId, searchParams, onwardFlights, returnFlights, selectedOnwardFlight, selectedReturnFlight, debugDataLayer]);

  if (!searchParams) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          No search parameters found. Please start a new search.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/search')}
          sx={{ mt: 2 }}
        >
          New Search
        </Button>
      </Container>
  );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              Flight Search Results
            </Typography>
            <Typography variant="body1" gutterBottom>
              {searchParams.originCode} → {searchParams.destinationCode}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {(() => {
                const originAirport = findAirportByCode(searchParams.originCode);
                const destAirport = findAirportByCode(searchParams.destinationCode);
                return `${originAirport?.name || searchParams.originCode} → ${destAirport?.name || searchParams.destinationCode}`;
              })()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {format(searchParams.date, 'MMM dd, yyyy')}
              {searchParams.returnDate && ` - ${format(searchParams.returnDate, 'MMM dd, yyyy')}`}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchParams.tripType === 'roundtrip' ? 'Round Trip' : 'One Way'} • {searchParams.passengers} {searchParams.passengers === 1 ? 'Passenger' : 'Passengers'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ position: 'relative', height: { xs: 180, md: 220 }, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-end' }, p: 0 }}>
            <Box
              sx={{
                position: 'absolute',
                top: { xs: 8, md: -32 },
                right: { xs: 0, md: -32 },
                width: { xs: '90%', md: 320 },
                height: { xs: 160, md: 220 },
                zIndex: 1,
                borderRadius: { xs: 4, md: '0 22px 22px 0' },
                overflow: 'hidden',
                boxShadow: 3,
                transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
                '&:hover': {
                  transform: 'scale(1.06) rotate(-2deg)',
                  boxShadow: 6,
                },
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                alt="Flight summary visual"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Onward Flights
          </Typography>
        {onwardFlights.length > 0 ? (
            renderFlightList(onwardFlights)
          ) : (
            <Typography>No flights found for the selected criteria.</Typography>
          )}

          {searchParams.tripType === 'roundtrip' && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Return Flights
              </Typography>
              {returnFlights.length > 0 ? (
                renderFlightList(returnFlights, true)
              ) : (
                <Typography>No return flights found for the selected criteria.</Typography>
              )}
            </>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Selected Flights
            </Typography>
            {selectedOnwardFlight && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Onward Flight</Typography>
                <Typography>
                  {selectedOnwardFlight.airline} {selectedOnwardFlight.flightNumber}
                </Typography>
                <Typography>
                  {format(selectedOnwardFlight.departureTime, 'MMM dd, HH:mm')} - {format(selectedOnwardFlight.arrivalTime, 'MMM dd, HH:mm')}
                </Typography>
                <Typography>
                  {selectedOnwardFlight.origin.iata_code} → {selectedOnwardFlight.destination.iata_code}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {(() => {
                    const originAirport = findAirportByCode(selectedOnwardFlight.origin.iata_code);
                    const destAirport = findAirportByCode(selectedOnwardFlight.destination.iata_code);
                    return `${originAirport?.name || selectedOnwardFlight.origin.iata_code} → ${destAirport?.name || selectedOnwardFlight.destination.iata_code}`;
                  })()}
                </Typography>
                <Typography>
                  Cabin Class: {searchParams.cabinClass}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  {CURRENCY_CONFIG.formatPrice(
                    (selectedOnwardFlight.displayPrices?.[searchParams.cabinClass] || selectedOnwardFlight.displayPrices?.economy) * searchParams.passengers,
                    selectedOnwardFlight.displayCurrency
                  )}
                </Typography>
              </Box>
            )}

            {selectedReturnFlight && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Return Flight</Typography>
                <Typography>
                  {selectedReturnFlight.airline} {selectedReturnFlight.flightNumber}
                </Typography>
                <Typography>
                  {format(selectedReturnFlight.departureTime, 'MMM dd, HH:mm')} - {format(selectedReturnFlight.arrivalTime, 'MMM dd, HH:mm')}
                </Typography>
                <Typography>
                  {selectedReturnFlight.origin.iata_code} → {selectedReturnFlight.destination.iata_code}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {(() => {
                    const originAirport = findAirportByCode(selectedReturnFlight.origin.iata_code);
                    const destAirport = findAirportByCode(selectedReturnFlight.destination.iata_code);
                    return `${originAirport?.name || selectedReturnFlight.origin.iata_code} → ${destAirport?.name || selectedReturnFlight.destination.iata_code}`;
                  })()}
                </Typography>
                <Typography>
                  Cabin Class: {searchParams.cabinClass}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  {CURRENCY_CONFIG.formatPrice(
                    (selectedReturnFlight.displayPrices?.[searchParams.cabinClass] || selectedReturnFlight.displayPrices?.economy) * searchParams.passengers,
                    selectedReturnFlight.displayCurrency
                  )}
                </Typography>
              </Box>
            )}

            {/* Total Price */}
            {(selectedOnwardFlight || selectedReturnFlight) && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom>
                  Total Price
                </Typography>
                <Typography variant="h5" color="primary">
                  {(() => {
                    const onwardPrice = selectedOnwardFlight ? 
                      (selectedOnwardFlight.displayPrices?.[searchParams.cabinClass] || selectedOnwardFlight.displayPrices?.economy) * searchParams.passengers : 0;
                    const returnPrice = selectedReturnFlight ? 
                      (selectedReturnFlight.displayPrices?.[searchParams.cabinClass] || selectedReturnFlight.displayPrices?.economy) * searchParams.passengers : 0;
                    const totalPrice = onwardPrice + returnPrice;
                    const currency = selectedOnwardFlight?.displayCurrency || selectedReturnFlight?.displayCurrency || 'INR';
                    return CURRENCY_CONFIG.formatPrice(totalPrice, currency);
                  })()}
                </Typography>
                {(selectedOnwardFlight?.isInternational || selectedReturnFlight?.isInternational) && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    *Prices will be converted to INR during payment
                  </Typography>
                )}
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleProceedToTravellerDetails}
              disabled={!selectedOnwardFlight || (searchParams.tripType === 'roundtrip' && !selectedReturnFlight)}
              sx={{ mt: 2 }}
            >
              Continue to Traveller Details
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={isModalOpen}
        onClose={() => handleCloseModal()}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Flight Details
          <IconButton
            aria-label="close"
            onClick={() => handleCloseModal()}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedFlight && (
      <FlightDetailsModal
        flight={selectedFlight}
              cabinClass={searchParams.cabinClass}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isReturnModalOpen}
        onClose={() => handleCloseModal(true)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Return Flight Details
          <IconButton
            aria-label="close"
            onClick={() => handleCloseModal(true)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedReturnFlight && (
            <FlightDetailsModal
        flight={selectedReturnFlight}
              cabinClass={searchParams.cabinClass}
      />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default SearchResults; 