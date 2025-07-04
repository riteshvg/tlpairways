import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { format, isWithinInterval, addDays } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import flightRoutes from '../data/flight_routes.json';
import FlightDetailsModal from './FlightDetailsModal';
import analytics from '../services/analytics';
import CURRENCY_CONFIG from '../config/currencyConfig';
import airports from '../data/airports.json';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize state with default values
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [onwardFlights, setOnwardFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [selectedOnwardFlight, setSelectedOnwardFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isReturnFlight, setIsReturnFlight] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Initialize search parameters from location state
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
        setError(null);
      } else {
        setError('No search parameters found');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error initializing search parameters:', err);
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
        .map(flight => {
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
      const originAirport = airports.find(a => a.iata_code === flight.origin.iata_code);
      const destAirport = airports.find(a => a.iata_code === flight.destination.iata_code);
      const originCountry = originAirport?.country || 'India';
      const destCountry = destAirport?.country || 'India';
      
      // Check if this is an international flight
      const isInternational = CURRENCY_CONFIG.isInternationalFlight(originCountry, destCountry);
      
      // Determine display currency - for international flights, always show USD
      const displayCurrency = isInternational ? 'USD' : 'INR';
      
      // Convert prices for display (keep original INR prices in backend)
      const displayPrices = {};
      Object.keys(prices).forEach(className => {
        if (isInternational) {
          // Convert INR to USD for display
          displayPrices[className] = Math.round(prices[className] / CURRENCY_CONFIG.defaultExchangeRate);
        } else {
          displayPrices[className] = prices[className];
        }
      });

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
        currentPrice: prices[cabinClass] || basePrice
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
        setError(null);
      } catch (err) {
        setError('Error loading flights');
        console.error('Error updating flights:', err);
      }
    }
  }, [searchParams]);

  // Track search results display
  useEffect(() => {
    if (searchParams && (onwardFlights.length > 0 || returnFlights.length > 0)) {
      try {
        analytics.searchResultsDisplayed({
          searchParams: {
            originCode: searchParams.originCode,
            destinationCode: searchParams.destinationCode,
            date: searchParams.date,
            returnDate: searchParams.returnDate,
            passengers: searchParams.passengers,
            paymentType: searchParams.paymentType,
            tripType: searchParams.tripType,
            cabinClass: searchParams.cabinClass
          },
          results: {
            onward: onwardFlights,
            return: returnFlights,
            total: onwardFlights.length + returnFlights.length
          }
        });
      } catch (err) {
        console.error('Error tracking search results:', err);
      }
    }
  }, [searchParams, onwardFlights, returnFlights]);

  const handleViewDetails = (flight, isReturn = false) => {
    if (isReturn) {
      setSelectedReturnFlight(flight);
      setIsReturnModalOpen(true);
    } else {
      setSelectedFlight(flight);
      setIsModalOpen(true);
    }
  };

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
      analytics.flightSelected(flightWithCorrectPrice, type === 'return' ? 'return' : 'onward', searchParams);
    } catch (error) {
      console.error('Error tracking flight selection:', error);
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