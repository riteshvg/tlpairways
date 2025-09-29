import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import usePageView from '../hooks/usePageView';
import { useAuth } from '../context/AuthContext';
import enhancedAirlinesDataLayer from '../services/EnhancedAirlinesDataLayer';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  Button,
  Grid,
  Box,
  Divider,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  InputAdornment,
  Skeleton,
  Alert,
  Snackbar,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Badge,
  Fab,
  Backdrop,
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Compare as CompareIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  FlightTakeoff as FlightTakeoffIcon,
  FlightLand as FlightLandIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  DateRange as DateRangeIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  LocalAirport as LocalAirportIcon,
} from '@mui/icons-material';
import { format, isWithinInterval, addDays, differenceInMinutes, parseISO } from 'date-fns';
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

const EnhancedSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Performance tracking
  const pageStartTime = useRef(Date.now());
  const apiStartTime = useRef(null);
  const renderStartTime = useRef(Date.now());
  
  // Search context and state
  const [searchParams, setSearchParams] = useState(null);
  const [searchId, setSearchId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Flight data
  const [onwardFlights, setOnwardFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [filteredOnwardFlights, setFilteredOnwardFlights] = useState([]);
  const [filteredReturnFlights, setFilteredReturnFlights] = useState([]);
  
  // Selection state
  const [selectedOnwardFlight, setSelectedOnwardFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  const [comparisonFlights, setComparisonFlights] = useState([]);
  
  // UI state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isReturnFlight, setIsReturnFlight] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    airlines: [],
    departureTime: [],
    stops: [],
    duration: [0, 24],
    amenities: []
  });
  
  // Sort state
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  
  // Track page view with enhanced context
  usePageView({
    pageCategory: 'booking',
    searchType: 'flight-results',
    sections: ['results-list', 'filters', 'sorting', 'pagination', 'comparison'],
    resultsCount: 0 // Will be updated when results are loaded
  });

  // Initialize search parameters and generate search ID
  useEffect(() => {
    try {
      if (location.state) {
        const {
          originCode,
          destinationCode,
          date,
          returnDate,
          passengers,
          paymentType,
          tripType,
          cabinClass,
          previousPage
        } = location.state;

        if (!originCode || !destinationCode || !date) {
          throw new Error('Missing required search parameters');
        }

        const params = {
          originCode,
          destinationCode,
          date: new Date(date),
          returnDate: returnDate ? new Date(returnDate) : null,
          passengers: passengers || 1,
          paymentType: paymentType || 'oneway',
          tripType: tripType || 'oneway',
          cabinClass: cabinClass || 'economy'
        };

        setSearchParams(params);
        setSearchId(enhancedAirlinesDataLayer.generateSearchId());
        setError(null);
      } else {
        setError('No search parameters found');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error initializing search parameters:', err);
      enhancedAirlinesDataLayer.trackError('search-initialization', err);
    }
  }, [location.state]);

  // Enhanced flight data processing with performance tracking
  const getMatchingFlights = useCallback((origin, destination, searchDate, cabinClass) => {
    if (!origin || !destination || !searchDate || !cabinClass) return [];

    try {
      apiStartTime.current = Date.now();
      
      const routeKey = `${origin}-${destination}`;
      const routeData = flightRoutes.routes[routeKey];
      
      if (!routeData) {
        enhancedAirlinesDataLayer.trackNoResults({
          origin,
          destination,
          departureDate: searchDate,
          cabinClass
        }, {
          searchId,
          suggestions: ['Try different dates', 'Check nearby airports']
        });
        return [];
      }

      // Get all flights for the route
      const allFlights = [...routeData.onward, ...routeData.return];
      
      const processedFlights = allFlights
        .filter(flight => {
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

          // Create flight object with search date
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
          
          // Determine display currency
          const displayCurrency = isInternational ? 'USD' : 'INR';
          
          // Convert prices for display
          const displayPrices = {};
          Object.keys(prices).forEach(className => {
            if (isInternational) {
              displayPrices[className] = Math.round(prices[className] / CURRENCY_CONFIG.defaultExchangeRate);
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
            originalPrices: prices,
            availableClasses,
            currentPrice: prices[cabinClass] || basePrice,
            duration,
            durationMinutes,
            resultPosition: index + 1,
            // Add comparison and tracking data
            comparisonId: `flight_${flight.flightNumber}_${Date.now()}`,
            isBookmarked: false,
            isCompared: false
          };
        });

      // Track API performance
      const apiResponseTime = Date.now() - apiStartTime.current;
      setPerformanceMetrics(prev => ({
        ...prev,
        apiResponseTime
      }));

      return processedFlights;
    } catch (err) {
      console.error('Error getting matching flights:', err);
      enhancedAirlinesDataLayer.trackError('flight-data-processing', err, { searchId });
      return [];
    }
  }, [searchId]);

  // Load flights with performance tracking
  useEffect(() => {
    if (searchParams?.originCode && searchParams?.destinationCode && searchParams?.date && searchParams?.cabinClass) {
      setLoading(true);
      renderStartTime.current = Date.now();
      
      try {
        const matchingFlights = getMatchingFlights(
          searchParams.originCode,
          searchParams.destinationCode,
          searchParams.date,
          searchParams.cabinClass
        );
        
        setOnwardFlights(matchingFlights);
        setFilteredOnwardFlights(matchingFlights);

        if (searchParams.tripType === 'roundtrip' && searchParams.returnDate) {
          const returnMatchingFlights = getMatchingFlights(
            searchParams.destinationCode,
            searchParams.originCode,
            searchParams.returnDate,
            searchParams.cabinClass
          );
          setReturnFlights(returnMatchingFlights);
          setFilteredReturnFlights(returnMatchingFlights);
        } else {
          setReturnFlights([]);
          setFilteredReturnFlights([]);
        }

        // Track search results display
        const pageLoadTime = Date.now() - pageStartTime.current;
        const renderTime = Date.now() - renderStartTime.current;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          pageLoadTime,
          renderTime
        }));

        // Track search results display event
        enhancedAirlinesDataLayer.trackSearchResultsDisplay(
          {
            searchId,
            origin: searchParams.originCode,
            destination: searchParams.destinationCode,
            departureDate: searchParams.date,
            returnDate: searchParams.returnDate,
            passengers: searchParams.passengers,
            cabinClass: searchParams.cabinClass,
            tripType: searchParams.tripType
          },
          {
            totalResults: matchingFlights.length + (searchParams.tripType === 'roundtrip' ? returnMatchingFlights.length : 0),
            onwardResults: matchingFlights.length,
            returnResults: searchParams.tripType === 'roundtrip' ? returnMatchingFlights.length : 0,
            priceRange: {
              min: Math.min(...matchingFlights.map(f => f.currentPrice)),
              max: Math.max(...matchingFlights.map(f => f.currentPrice))
            },
            airlines: [...new Set(matchingFlights.map(f => f.airline))],
            durationRange: {
              min: Math.min(...matchingFlights.map(f => f.durationMinutes)),
              max: Math.max(...matchingFlights.map(f => f.durationMinutes))
            }
          },
          {
            pageLoadTime,
            apiResponseTime: performanceMetrics.apiResponseTime,
            renderTime
          }
        );

        setError(null);
      } catch (err) {
        setError('Error loading flights');
        console.error('Error updating flights:', err);
        enhancedAirlinesDataLayer.trackError('flight-loading', err, { searchId });
      } finally {
        setLoading(false);
      }
    }
  }, [searchParams, getMatchingFlights, performanceMetrics.apiResponseTime, searchId]);

  // Filter flights based on current filters
  const applyFilters = useCallback((flights, isReturn = false) => {
    return flights.filter(flight => {
      // Price filter
      const price = flight.currentPrice;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Airline filter
      if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) {
        return false;
      }

      // Departure time filter
      if (filters.departureTime.length > 0) {
        const hour = flight.departureTime.getHours();
        const timeCategory = hour < 6 ? 'early-morning' : 
                           hour < 12 ? 'morning' : 
                           hour < 18 ? 'afternoon' : 'evening';
        if (!filters.departureTime.includes(timeCategory)) {
          return false;
        }
      }

      // Stops filter
      if (filters.stops.length > 0) {
        const stops = flight.stops || 0;
        if (!filters.stops.includes(stops)) {
          return false;
        }
      }

      // Duration filter
      if (flight.durationMinutes < filters.duration[0] * 60 || 
          flight.durationMinutes > filters.duration[1] * 60) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Apply filters when they change
  useEffect(() => {
    const filteredOnward = applyFilters(onwardFlights);
    const filteredReturn = applyFilters(returnFlights, true);
    
    setFilteredOnwardFlights(filteredOnward);
    setFilteredReturnFlights(filteredReturn);
    
    // Track filter application
    if (onwardFlights.length > 0) {
      enhancedAirlinesDataLayer.trackFilterInteraction('all-filters', filters, {
        searchId,
        resultsBeforeFilter: onwardFlights.length,
        resultsAfterFilter: filteredOnward.length,
        previousFilters: []
      });
    }
  }, [filters, onwardFlights, returnFlights, applyFilters, searchId]);

  // Sort flights
  const sortFlights = useCallback((flights) => {
    return [...flights].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.currentPrice - b.currentPrice;
          break;
        case 'duration':
          comparison = a.durationMinutes - b.durationMinutes;
          break;
        case 'departure':
          comparison = a.departureTime - b.departureTime;
          break;
        case 'arrival':
          comparison = a.arrivalTime - b.arrivalTime;
          break;
        case 'airline':
          comparison = a.airline.localeCompare(b.airline);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [sortBy, sortOrder]);

  // Apply sorting
  useEffect(() => {
    const sortedOnward = sortFlights(filteredOnwardFlights);
    const sortedReturn = sortFlights(filteredReturnFlights);
    
    setFilteredOnwardFlights(sortedOnward);
    setFilteredReturnFlights(sortedReturn);
    
    // Track sort application
    enhancedAirlinesDataLayer.trackSortInteraction(sortBy, sortOrder, {
      searchId,
      resultsCount: filteredOnwardFlights.length
    });
  }, [sortBy, sortOrder, filteredOnwardFlights, filteredReturnFlights, sortFlights, searchId]);

  // Pagination
  const paginatedOnwardFlights = useMemo(() => {
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    return filteredOnwardFlights.slice(startIndex, endIndex);
  }, [filteredOnwardFlights, currentPage, resultsPerPage]);

  const paginatedReturnFlights = useMemo(() => {
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    return filteredReturnFlights.slice(startIndex, endIndex);
  }, [filteredReturnFlights, currentPage, resultsPerPage]);

  // Handle flight selection with enhanced tracking
  const handleSelectFlight = useCallback((flight, type) => {
    const selectedPrice = flight.prices[searchParams.cabinClass];
    const flightWithCorrectPrice = {
      ...flight,
      cabinClass: searchParams.cabinClass,
      price: {
        amount: selectedPrice,
        currency: 'INR'
      }
    };

    if (type === 'onward') {
      setSelectedOnwardFlight(flightWithCorrectPrice);
    } else {
      setSelectedReturnFlight(flightWithCorrectPrice);
    }

    // Track flight selection
    enhancedAirlinesDataLayer.trackFlightSelection(
      flightWithCorrectPrice,
      {
        searchId,
        resultPosition: flight.resultPosition,
        totalResults: filteredOnwardFlights.length,
        currentFilters: Object.keys(filters).filter(key => filters[key].length > 0),
        sortBy
      },
      {
        isLoggedIn: isAuthenticated,
        loyaltyTier: user?.loyaltyTier || null,
        userId: user?.id || null
      }
    );

    // For one-way journey, proceed to traveller details
    if (searchParams.tripType === 'oneway' && type === 'onward') {
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
  }, [searchParams, searchId, filteredOnwardFlights, filters, sortBy, isAuthenticated, user, navigate]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // Track filter interaction
    enhancedAirlinesDataLayer.trackFilterInteraction(filterType, value, {
      searchId,
      resultsBeforeFilter: onwardFlights.length,
      resultsAfterFilter: filteredOnwardFlights.length
    });
  }, [searchId, onwardFlights.length, filteredOnwardFlights.length]);

  // Handle sort changes
  const handleSortChange = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    // Track sort interaction
    enhancedAirlinesDataLayer.trackSortInteraction(newSortBy, newSortOrder, {
      searchId,
      resultsCount: filteredOnwardFlights.length
    });
  }, [searchId, filteredOnwardFlights.length]);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    
    // Track pagination
    enhancedAirlinesDataLayer.trackPaginationInteraction(page, resultsPerPage, {
      searchId,
      totalPages: Math.ceil(filteredOnwardFlights.length / resultsPerPage)
    });
  }, [resultsPerPage, searchId, filteredOnwardFlights.length]);

  // Handle flight comparison
  const handleFlightComparison = useCallback((flight, action) => {
    if (action === 'add') {
      if (comparisonFlights.length < 4) {
        setComparisonFlights(prev => [...prev, flight]);
        flight.isCompared = true;
      }
    } else if (action === 'remove') {
      setComparisonFlights(prev => prev.filter(f => f.comparisonId !== flight.comparisonId));
      flight.isCompared = false;
    }
    
    // Track comparison
    enhancedAirlinesDataLayer.trackFlightComparison(action, flight, {
      totalFlightsInComparison: comparisonFlights.length,
      additionMethod: 'compare-button'
    });
  }, [comparisonFlights.length]);

  // Handle search refinement
  const handleSearchRefinement = useCallback(() => {
    enhancedAirlinesDataLayer.trackSearchRefinement({
      type: 'modify-search',
      previousSearch: searchParams,
      newSearch: searchParams // In real implementation, this would be the new search
    }, { searchId });
    
    navigate('/search', { state: searchParams });
  }, [searchParams, searchId, navigate]);

  // Handle search abandonment
  const handleSearchAbandonment = useCallback(() => {
    const timeOnPage = Date.now() - pageStartTime.current;
    enhancedAirlinesDataLayer.trackSearchAbandonment({
      reason: 'user-navigation',
      timeOnPage,
      lastAction: 'page-leave'
    }, { searchId });
  }, [searchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleSearchAbandonment();
    };
  }, [handleSearchAbandonment]);

  // Render loading skeleton
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={120} sx={{ mb: 2 }} />
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/search')}
        >
          Start New Search
        </Button>
      </Container>
    );
  }

  // Render no results state
  if (filteredOnwardFlights.length === 0 && !loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No flights found
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            We couldn't find any flights matching your criteria. Try adjusting your search.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchRefinement}
            startIcon={<SearchIcon />}
          >
            Modify Search
          </Button>
        </Paper>
      </Container>
    );
  }

  // Render flight card with enhanced features
  const renderFlightCard = useCallback((flight, isReturn = false) => {
    const pricePerPassenger = flight.displayPrices[searchParams.cabinClass] || flight.displayPrices.economy;
    const numPassengers = searchParams.passengers || 1;
    const totalPrice = pricePerPassenger * numPassengers;
    const isSelected = isReturn ? 
      selectedReturnFlight?.flightNumber === flight.flightNumber :
      selectedOnwardFlight?.flightNumber === flight.flightNumber;

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
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">{flight.airline}</Typography>
                <Chip 
                  label={flight.flightNumber} 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {format(flight.departureTime, 'HH:mm')} - {format(flight.arrivalTime, 'HH:mm')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {flight.duration}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">
                {flight.origin.iata_code} → {flight.destination.iata_code}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {format(flight.departureTime, 'MMM dd, yyyy')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {flight.aircraft}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" color="primary">
                  {CURRENCY_CONFIG.formatPrice(totalPrice, flight.displayCurrency)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {CURRENCY_CONFIG.formatPrice(pricePerPassenger, flight.displayCurrency)} per person
                </Typography>
                {flight.isInternational && (
                  <Typography variant="body2" color="textSecondary">
                    *Price will be converted to INR during payment
                  </Typography>
                )}
                
                <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleFlightComparison(flight, flight.isCompared ? 'remove' : 'add')}
                    disabled={!flight.isCompared && comparisonFlights.length >= 4}
                  >
                    {flight.isCompared ? 'Remove from Compare' : 'Compare'}
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSelectFlight(flight, isReturn ? 'return' : 'onward')}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }, [searchParams, selectedOnwardFlight, selectedReturnFlight, comparisonFlights, handleSelectFlight, handleFlightComparison]);

  // Render filter panel
  const renderFilterPanel = () => (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      
      {/* Price Range */}
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Price Range</Typography>
        <Slider
          value={filters.priceRange}
          onChange={(_, value) => handleFilterChange('priceRange', value)}
          valueLabelDisplay="auto"
          min={0}
          max={10000}
          step={100}
        />
      </Box>
      
      {/* Airlines */}
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Airlines</Typography>
        <FormGroup>
          {[...new Set(onwardFlights.map(f => f.airline))].map(airline => (
            <FormControlLabel
              key={airline}
              control={
                <Checkbox
                  checked={filters.airlines.includes(airline)}
                  onChange={(e) => {
                    const newAirlines = e.target.checked
                      ? [...filters.airlines, airline]
                      : filters.airlines.filter(a => a !== airline);
                    handleFilterChange('airlines', newAirlines);
                  }}
                />
              }
              label={airline}
            />
          ))}
        </FormGroup>
      </Box>
      
      {/* Departure Time */}
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Departure Time</Typography>
        <FormGroup>
          {[
            { value: 'early-morning', label: 'Early Morning (12AM-6AM)' },
            { value: 'morning', label: 'Morning (6AM-12PM)' },
            { value: 'afternoon', label: 'Afternoon (12PM-6PM)' },
            { value: 'evening', label: 'Evening (6PM-12AM)' }
          ].map(time => (
            <FormControlLabel
              key={time.value}
              control={
                <Checkbox
                  checked={filters.departureTime.includes(time.value)}
                  onChange={(e) => {
                    const newTimes = e.target.checked
                      ? [...filters.departureTime, time.value]
                      : filters.departureTime.filter(t => t !== time.value);
                    handleFilterChange('departureTime', newTimes);
                  }}
                />
              }
              label={time.label}
            />
          ))}
        </FormGroup>
      </Box>
      
      {/* Clear Filters */}
      <Button
        variant="outlined"
        onClick={() => setFilters({
          priceRange: [0, 10000],
          airlines: [],
          departureTime: [],
          stops: [],
          duration: [0, 24],
          amenities: []
        })}
        startIcon={<ClearIcon />}
      >
        Clear All Filters
      </Button>
    </Paper>
  );

  // Render sort panel
  const renderSortPanel = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1">Sort by:</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value, sortOrder)}
          >
            <MenuItem value="price">Price</MenuItem>
            <MenuItem value="duration">Duration</MenuItem>
            <MenuItem value="departure">Departure Time</MenuItem>
            <MenuItem value="arrival">Arrival Time</MenuItem>
            <MenuItem value="airline">Airline</MenuItem>
          </Select>
        </FormControl>
        
        <ToggleButtonGroup
          value={sortOrder}
          exclusive
          onChange={(_, value) => value && handleSortChange(sortBy, value)}
          size="small"
        >
          <ToggleButton value="asc">
            <TrendingUpIcon />
          </ToggleButton>
          <ToggleButton value="desc">
            <TrendingDownIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Search Summary */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              Flight Search Results
            </Typography>
            <Typography variant="body1" gutterBottom>
              {searchParams.originCode} → {searchParams.destinationCode}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {format(searchParams.date, 'MMM dd, yyyy')}
              {searchParams.returnDate && ` - ${format(searchParams.returnDate, 'MMM dd, yyyy')}`}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchParams.tripType === 'roundtrip' ? 'Round Trip' : 'One Way'} • {searchParams.passengers} {searchParams.passengers === 1 ? 'Passenger' : 'Passengers'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" color="primary">
                {filteredOnwardFlights.length} flights found
              </Typography>
              <Button
                variant="outlined"
                onClick={handleSearchRefinement}
                startIcon={<SearchIcon />}
                sx={{ mt: 1 }}
              >
                Modify Search
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Filters and Results */}
        <Grid item xs={12} md={8}>
          {/* Sort Panel */}
          {renderSortPanel()}
          
          {/* Filter Toggle */}
          <Button
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterIcon />}
            sx={{ mb: 2 }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          {/* Filter Panel */}
          {showFilters && renderFilterPanel()}
          
          {/* Results */}
          <Typography variant="h6" gutterBottom>
            Onward Flights
          </Typography>
          {paginatedOnwardFlights.length > 0 ? (
            <List>
              {paginatedOnwardFlights.map(flight => renderFlightCard(flight))}
            </List>
          ) : (
            <Typography>No flights found for the selected criteria.</Typography>
          )}

          {/* Return Flights */}
          {searchParams.tripType === 'roundtrip' && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Return Flights
              </Typography>
              {paginatedReturnFlights.length > 0 ? (
                <List>
                  {paginatedReturnFlights.map(flight => renderFlightCard(flight, true))}
                </List>
              ) : (
                <Typography>No return flights found for the selected criteria.</Typography>
              )}
            </>
          )}
          
          {/* Pagination */}
          {filteredOnwardFlights.length > resultsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                Page {currentPage} of {Math.ceil(filteredOnwardFlights.length / resultsPerPage)}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(filteredOnwardFlights.length / resultsPerPage)}
              >
                Next
              </Button>
            </Box>
          )}
        </Grid>

        {/* Selected Flights Summary */}
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
              onClick={() => {
                if (!selectedOnwardFlight) return;
                if (searchParams.tripType === 'roundtrip' && !selectedReturnFlight) return;
                
                const navigationState = {
                  onwardFlight: selectedOnwardFlight,
                  returnFlight: selectedReturnFlight,
                  tripType: searchParams.tripType,
                  passengers: searchParams.passengers,
                  cabinClass: searchParams.cabinClass,
                  previousPage: 'Search Results'
                };
                
                navigate('/traveller-details', { state: navigationState });
              }}
              disabled={!selectedOnwardFlight || (searchParams.tripType === 'roundtrip' && !selectedReturnFlight)}
              sx={{ mt: 2 }}
            >
              Continue to Traveller Details
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Flight Details Modal */}
      <Dialog
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Flight Details
          <IconButton
            aria-label="close"
            onClick={() => setShowDetailsModal(false)}
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
    </Container>
  );
};

export default EnhancedSearchResults;
