import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Drawer,
  SwipeableDrawer,
  Fab,
  Badge,
  Alert,
  Snackbar,
  CircularProgress,
  Backdrop,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  BottomNavigation,
  BottomNavigationAction,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  LinearProgress,
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
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Swipe as SwipeIcon,
  TouchApp as TouchAppIcon,
  Gesture as GestureIcon,
  BatteryFull as BatteryFullIcon,
  Wifi as WifiIcon,
  SignalCellular4Bar as SignalCellular4BarIcon,
  LocationOn as LocationOnIcon,
  Map as MapIcon,
  List as ListIcon,
  ViewModule as ViewModuleIcon,
  MoreVert as MoreVertIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { format, differenceInMinutes } from 'date-fns';
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

const MobileSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Performance tracking
  const pageStartTime = useRef(Date.now());
  const touchStartTime = useRef(0);
  const touchStartPosition = useRef({ x: 0, y: 0 });
  const gestureHistory = useRef([]);
  
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
  const [showSort, setShowSort] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [showSpeedDial, setShowSpeedDial] = useState(false);
  
  // Mobile-specific state
  const [pullToRefresh, setPullToRefresh] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [hapticFeedback, setHapticFeedback] = useState(false);
  const [deviceOrientation, setDeviceOrientation] = useState('portrait');
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [networkType, setNetworkType] = useState('unknown');
  
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
  const [resultsPerPage, setResultsPerPage] = useState(5); // Smaller for mobile
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  
  // Track page view with mobile-specific context
  usePageView({
    pageCategory: 'booking',
    searchType: 'flight-results-mobile',
    sections: ['results-list', 'filters', 'sorting', 'pagination', 'comparison', 'map'],
    resultsCount: 0,
    deviceType: 'mobile',
    orientation: deviceOrientation
  });

  // Initialize mobile-specific features
  useEffect(() => {
    if (isMobile) {
      // Set up device orientation tracking
      const handleOrientationChange = () => {
        const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        setDeviceOrientation(orientation);
        
        // Track orientation change
        enhancedAirlinesDataLayer.trackEvent('mobile-orientation-change', {
          orientation,
          searchId,
          timestamp: new Date().toISOString()
        });
      };
      
      window.addEventListener('orientationchange', handleOrientationChange);
      
      // Set up battery level tracking
      if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
          setBatteryLevel(battery.level);
          
          // Track battery level
          enhancedAirlinesDataLayer.trackEvent('mobile-battery-level', {
            batteryLevel: battery.level,
            searchId,
            timestamp: new Date().toISOString()
          });
        });
      }
      
      // Set up network type tracking
      if ('connection' in navigator) {
        const connection = navigator.connection;
        setNetworkType(connection.effectiveType || 'unknown');
        
        // Track network type
        enhancedAirlinesDataLayer.trackEvent('mobile-network-type', {
          networkType: connection.effectiveType,
          searchId,
          timestamp: new Date().toISOString()
        });
      }
      
      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
      };
    }
  }, [isMobile, searchId]);

  // Initialize search parameters
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
      enhancedAirlinesDataLayer.trackError('mobile-search-initialization', err);
    }
  }, [location.state]);

  // Enhanced flight data processing with mobile optimization
  const getMatchingFlights = useCallback((origin, destination, searchDate, cabinClass) => {
    if (!origin || !destination || !searchDate || !cabinClass) return [];

    try {
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
          deviceType: 'mobile',
          suggestions: ['Try different dates', 'Check nearby airports']
        });
        return [];
      }

      const allFlights = [...routeData.onward, ...routeData.return];
      
      // Determine currency based on search origin (not individual flight origin)
      const searchOriginAirport = findAirportByCode(origin);
      const searchOriginCountry = searchOriginAirport?.country || 'India';
      const searchDisplayCurrency = CURRENCY_CONFIG.getCurrencyForCountry(searchOriginCountry);
      
      const processedFlights = allFlights
        .filter(flight => {
          return flight.origin.iata_code === origin && 
                 flight.destination.iata_code === destination;
        })
        .map((flight, index) => {
          const basePrice = flight.price.amount;
          let prices = {
            economy: basePrice,
            premium_economy: Math.round(basePrice * 1.3),
            business: Math.round(basePrice * 1.7),
            first: Math.round(basePrice * 2.2)
          };

          const availableClasses = flight.cabinClasses;
          Object.keys(prices).forEach(className => {
            if (!availableClasses.includes(className)) {
              delete prices[className];
            }
          });

          const departureTime = new Date(searchDate);
          const [hours, minutes] = flight.departureTime.split(':');
          departureTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          const arrivalTime = new Date(searchDate);
          const [arrHours, arrMinutes] = flight.arrivalTime.split(':');
          arrivalTime.setHours(parseInt(arrHours), parseInt(arrMinutes), 0, 0);

          if (arrivalTime < departureTime) {
            arrivalTime.setDate(arrivalTime.getDate() + 1);
          }

          const originAirport = findAirportByCode(flight.origin.iata_code);
          const destAirport = findAirportByCode(flight.destination.iata_code);
          const originCountry = originAirport?.country || 'India';
          const destCountry = destAirport?.country || 'India';
          
          const isInternational = CURRENCY_CONFIG.isInternationalFlight(originCountry, destCountry);
          // Use search origin currency for all flights (both onward and return)
          const displayCurrency = searchDisplayCurrency;
          
          const displayPrices = {};
          Object.keys(prices).forEach(className => {
            if (displayCurrency !== 'INR') {
              // Convert INR to target currency for display
              displayPrices[className] = Math.round(CURRENCY_CONFIG.convertPrice(prices[className], 'INR', displayCurrency));
            } else {
              displayPrices[className] = prices[className];
            }
          });

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
            comparisonId: `flight_${flight.flightNumber}_${Date.now()}`,
            isBookmarked: false,
            isCompared: false
          };
        });

      return processedFlights;
    } catch (err) {
      console.error('Error getting matching flights:', err);
      enhancedAirlinesDataLayer.trackError('mobile-flight-data-processing', err, { searchId });
      return [];
    }
  }, [searchId]);

  // Load flights with mobile performance tracking
  useEffect(() => {
    if (searchParams?.originCode && searchParams?.destinationCode && searchParams?.date && searchParams?.cabinClass) {
      setLoading(true);
      
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

        const pageLoadTime = Date.now() - pageStartTime.current;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          pageLoadTime,
          deviceType: 'mobile',
          orientation: deviceOrientation,
          batteryLevel,
          networkType
        }));

        // Track mobile search results display
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
            deviceType: 'mobile',
            orientation: deviceOrientation,
            batteryLevel,
            networkType
          }
        );

        setError(null);
      } catch (err) {
        setError('Error loading flights');
        console.error('Error updating flights:', err);
        enhancedAirlinesDataLayer.trackError('mobile-flight-loading', err, { searchId });
      } finally {
        setLoading(false);
      }
    }
  }, [searchParams, getMatchingFlights, searchId, deviceOrientation, batteryLevel, networkType]);

  // Handle mobile gestures
  const handleTouchStart = useCallback((e) => {
    touchStartTime.current = Date.now();
    touchStartPosition.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    
    // Track touch start
    enhancedAirlinesDataLayer.trackEvent('mobile-touch-start', {
      touchX: e.touches[0].clientX,
      touchY: e.touches[0].clientY,
      searchId,
      timestamp: new Date().toISOString()
    });
  }, [searchId]);

  const handleTouchEnd = useCallback((e) => {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime.current;
    const touchEndPosition = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };
    
    const deltaX = touchEndPosition.x - touchStartPosition.current.x;
    const deltaY = touchEndPosition.y - touchStartPosition.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / touchDuration;
    
    // Determine gesture type
    let gestureType = 'tap';
    if (distance > 50) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        gestureType = deltaX > 0 ? 'swipe-right' : 'swipe-left';
      } else {
        gestureType = deltaY > 0 ? 'swipe-down' : 'swipe-up';
      }
    }
    
    // Track gesture
    enhancedAirlinesDataLayer.trackEvent('mobile-gesture', {
      gestureType,
      touchDuration,
      distance,
      velocity,
      deltaX,
      deltaY,
      searchId,
      timestamp: new Date().toISOString()
    });
    
    // Handle pull-to-refresh
    if (gestureType === 'swipe-down' && touchStartPosition.current.y < 100) {
      setPullToRefresh(true);
      setTimeout(() => setPullToRefresh(false), 2000);
      
      // Track pull-to-refresh
      enhancedAirlinesDataLayer.trackEvent('mobile-pull-to-refresh', {
        searchId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle swipe gestures for flight cards
    if (gestureType === 'swipe-left' || gestureType === 'swipe-right') {
      setSwipeDirection(gestureType);
      setTimeout(() => setSwipeDirection(null), 500);
    }
  }, [searchId]);

  // Handle flight selection with mobile-specific tracking
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

    // Track mobile flight selection
    enhancedAirlinesDataLayer.trackFlightSelection(
      flightWithCorrectPrice,
      {
        searchId,
        resultPosition: flight.resultPosition,
        totalResults: filteredOnwardFlights.length,
        currentFilters: Object.keys(filters).filter(key => filters[key].length > 0),
        sortBy,
        deviceType: 'mobile',
        selectionMethod: 'touch'
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
          previousPage: 'Mobile Search Results'
        }
      });
    }
  }, [searchParams, searchId, filteredOnwardFlights, filters, sortBy, isAuthenticated, user, navigate]);

  // Handle mobile-specific actions
  const handleMobileAction = useCallback((action, data = {}) => {
    enhancedAirlinesDataLayer.trackEvent('mobile-action', {
      action,
      ...data,
      searchId,
      deviceType: 'mobile',
      orientation: deviceOrientation,
      batteryLevel,
      networkType,
      timestamp: new Date().toISOString()
    });
  }, [searchId, deviceOrientation, batteryLevel, networkType]);

  // Render mobile flight card with swipe gestures
  const renderMobileFlightCard = useCallback((flight, isReturn = false) => {
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
          transform: swipeDirection === 'swipe-left' ? 'translateX(-20px)' : 
                    swipeDirection === 'swipe-right' ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
          '&:hover': { 
            boxShadow: 3
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                {flight.airline}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {flight.flightNumber}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" color="primary">
                {CURRENCY_CONFIG.formatPrice(totalPrice, flight.displayCurrency)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {CURRENCY_CONFIG.formatPrice(pricePerPassenger, flight.displayCurrency)} per person
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              {flight.origin.iata_code} → {flight.destination.iata_code}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {format(flight.departureTime, 'MMM dd, HH:mm')} - {format(flight.arrivalTime, 'MMM dd, HH:mm')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {flight.duration}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                size="small"
                color={flight.stops === 0 ? 'success' : 'default'}
              />
              <Chip 
                label={searchParams.cabinClass}
                size="small"
                variant="outlined"
              />
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleSelectFlight(flight, isReturn ? 'return' : 'onward')}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }, [searchParams, selectedOnwardFlight, selectedReturnFlight, swipeDirection, handleTouchStart, handleTouchEnd, handleSelectFlight]);

  // Render mobile app bar
  const renderMobileAppBar = () => (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        <IconButton
          edge="start"
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {filteredOnwardFlights.length} flights
        </Typography>
        <IconButton onClick={() => setShowFilters(true)}>
          <FilterIcon />
        </IconButton>
        <IconButton onClick={() => setShowSort(true)}>
          <SortIcon />
        </IconButton>
        <IconButton onClick={() => setShowComparison(true)}>
          <Badge badgeContent={comparisonFlights.length} color="primary">
            <CompareIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );

  // Render mobile bottom navigation
  const renderMobileBottomNav = () => (
    <BottomNavigation
      value={currentTab}
      onChange={(_, newValue) => setCurrentTab(newValue)}
      showLabels
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
    >
      <BottomNavigationAction
        label="Flights"
        icon={<FlightTakeoffIcon />}
        onClick={() => setCurrentTab(0)}
      />
      <BottomNavigationAction
        label="Map"
        icon={<MapIcon />}
        onClick={() => {
          setCurrentTab(1);
          setShowMap(true);
          handleMobileAction('map-view-opened');
        }}
      />
      <BottomNavigationAction
        label="Compare"
        icon={<CompareIcon />}
        onClick={() => {
          setCurrentTab(2);
          setShowComparison(true);
          handleMobileAction('comparison-opened');
        }}
      />
      <BottomNavigationAction
        label="Filters"
        icon={<FilterIcon />}
        onClick={() => {
          setCurrentTab(3);
          setShowFilters(true);
          handleMobileAction('filters-opened');
        }}
      />
    </BottomNavigation>
  );

  // Render mobile speed dial
  const renderMobileSpeedDial = () => (
    <SpeedDial
      ariaLabel="SpeedDial"
      sx={{ position: 'fixed', bottom: 80, right: 16 }}
      icon={<SpeedDialIcon />}
      open={showSpeedDial}
      onOpen={() => setShowSpeedDial(true)}
      onClose={() => setShowSpeedDial(false)}
    >
      <SpeedDialAction
        icon={<ShareIcon />}
        tooltipTitle="Share"
        onClick={() => handleMobileAction('share')}
      />
      <SpeedDialAction
        icon={<BookmarkIcon />}
        tooltipTitle="Bookmark"
        onClick={() => handleMobileAction('bookmark')}
      />
      <SpeedDialAction
        icon={<RefreshIcon />}
        tooltipTitle="Refresh"
        onClick={() => handleMobileAction('refresh')}
      />
    </SpeedDial>
  );

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {renderMobileAppBar()}
        <Box sx={{ flex: 1, p: 2 }}>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={120} sx={{ mb: 2 }} />
          ))}
        </Box>
        {renderMobileBottomNav()}
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {renderMobileAppBar()}
        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/search')}
            fullWidth
          >
            Start New Search
          </Button>
        </Box>
        {renderMobileBottomNav()}
      </Box>
    );
  }

  // Render no results state
  if (filteredOnwardFlights.length === 0 && !loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {renderMobileAppBar()}
        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h5" gutterBottom align="center">
            No flights found
          </Typography>
          <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 3 }}>
            We couldn't find any flights matching your criteria. Try adjusting your search.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/search')}
            fullWidth
          >
            Modify Search
          </Button>
        </Box>
        {renderMobileBottomNav()}
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {renderMobileAppBar()}
      
      {/* Pull to refresh indicator */}
      {pullToRefresh && (
        <Box sx={{ textAlign: 'center', py: 1, bgcolor: 'primary.main', color: 'white' }}>
          <CircularProgress size={20} color="inherit" />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Refreshing...
          </Typography>
        </Box>
      )}
      
      {/* Main content */}
      <Box sx={{ flex: 1, overflow: 'auto', pb: 8 }}>
        <Container maxWidth="sm" sx={{ p: 2 }}>
          {/* Search summary */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {searchParams.originCode} → {searchParams.destinationCode}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {format(searchParams.date, 'MMM dd, yyyy')}
              {searchParams.returnDate && ` - ${format(searchParams.returnDate, 'MMM dd, yyyy')}`}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchParams.tripType === 'roundtrip' ? 'Round Trip' : 'One Way'} • {searchParams.passengers} {searchParams.passengers === 1 ? 'Passenger' : 'Passengers'}
            </Typography>
          </Paper>
          
          {/* Results */}
          <Typography variant="h6" gutterBottom>
            Onward Flights
          </Typography>
          {paginatedOnwardFlights.length > 0 ? (
            <List>
              {paginatedOnwardFlights.map(flight => renderMobileFlightCard(flight))}
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
                  {paginatedReturnFlights.map(flight => renderMobileFlightCard(flight, true))}
                </List>
              ) : (
                <Typography>No return flights found for the selected criteria.</Typography>
              )}
            </>
          )}
        </Container>
      </Box>
      
      {/* Selected flights summary - floating action button */}
      {(selectedOnwardFlight || selectedReturnFlight) && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 80, right: 16 }}
          onClick={() => {
            if (!selectedOnwardFlight) return;
            if (searchParams.tripType === 'roundtrip' && !selectedReturnFlight) return;
            
            const navigationState = {
              onwardFlight: selectedOnwardFlight,
              returnFlight: selectedReturnFlight,
              tripType: searchParams.tripType,
              passengers: searchParams.passengers,
              cabinClass: searchParams.cabinClass,
              previousPage: 'Mobile Search Results'
            };
            
            navigate('/traveller-details', { state: navigationState });
          }}
        >
          <CheckIcon />
        </Fab>
      )}
      
      {renderMobileBottomNav()}
      {renderMobileSpeedDial()}
      
      {/* Mobile-specific modals and drawers */}
      <SwipeableDrawer
        anchor="bottom"
        open={showFilters}
        onClose={() => setShowFilters(false)}
        onOpen={() => setShowFilters(true)}
      >
        <Box sx={{ p: 2, height: '50vh' }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          {/* Filter content would go here */}
          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowFilters(false)}
            sx={{ mt: 2 }}
          >
            Apply Filters
          </Button>
        </Box>
      </SwipeableDrawer>
      
      <SwipeableDrawer
        anchor="bottom"
        open={showSort}
        onClose={() => setShowSort(false)}
        onOpen={() => setShowSort(true)}
      >
        <Box sx={{ p: 2, height: '30vh' }}>
          <Typography variant="h6" gutterBottom>
            Sort By
          </Typography>
          {/* Sort options would go here */}
          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowSort(false)}
            sx={{ mt: 2 }}
          >
            Apply Sort
          </Button>
        </Box>
      </SwipeableDrawer>
    </Box>
  );
};

export default MobileSearchResults;
