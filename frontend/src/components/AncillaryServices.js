import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Stack
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  EventSeat,
  Restaurant,
  Luggage,
  PriorityHigh,
  AirportShuttle,
  Close,
  Info
} from '@mui/icons-material';
import { format } from 'date-fns';
import seatConfigurations from '../data/ancillary/seat_configurations.json';
import baggageRulesData from '../data/ancillary/baggage_rules.json';
import analytics from '../services/analytics';
import { CURRENCY_CONFIG } from '../config/currencyConfig';

const AncillaryServices = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedFlights, setSelectedFlights] = useState({
    onward: null,
    return: null
  });
  const [travellerDetails, setTravellerDetails] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [paymentType, setPaymentType] = useState('oneway');
  const [selectedServices, setSelectedServices] = useState({
    onward: {
      seat: [],
      meals: [],
      baggage: [],
      priorityBoarding: [],
      loungeAccess: []
    },
    return: {
      seat: [],
      meals: [],
      baggage: [],
      priorityBoarding: [],
      loungeAccess: []
    }
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [activeStep] = useState(0);
  const [seatSelectionOpen, setSeatSelectionOpen] = useState(false);
  const [currentJourney, setCurrentJourney] = useState('onward');
  const [currentAircraft, setCurrentAircraft] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Initialize state from location
  useEffect(() => {
    console.log('AncillaryServices - useEffect called');
    console.log('Location state:', location.state);
    
    try {
      if (location.state) {
  const {
          selectedFlights: initialFlights,
          travellerDetails: initialTravellerDetails,
          contactInfo: initialContactInfo,
          paymentType: initialPaymentType
        } = location.state;

        console.log('AncillaryServices received state:', {
          initialFlights,
          initialTravellerDetails,
          initialContactInfo,
          initialPaymentType
    });

        if (!initialFlights?.onward) {
          console.error('No flight data found in state:', initialFlights);
          console.error('Redirecting to search due to missing flight data');
      navigate('/search');
      return;
    }

        if (!initialTravellerDetails?.length) {
          console.error('No traveller details found in state:', initialTravellerDetails);
          console.error('Redirecting to traveller details due to missing traveller data');
          navigate('/traveller-details');
          return;
        }

        // Set flights
        console.log('Setting selected flights:', initialFlights);
        setSelectedFlights(initialFlights);
        
        // Set traveller details
        console.log('Setting traveller details:', initialTravellerDetails);
        setTravellerDetails(initialTravellerDetails);
        
        // Initialize services for each traveller
        const newServices = {
          onward: {
            seat: new Array(initialTravellerDetails.length).fill(null),
            meals: new Array(initialTravellerDetails.length).fill(''),
            baggage: new Array(initialTravellerDetails.length).fill('included'),
            priorityBoarding: new Array(initialTravellerDetails.length).fill(false),
            loungeAccess: new Array(initialTravellerDetails.length).fill(false)
          },
          return: {
            seat: new Array(initialTravellerDetails.length).fill(null),
            meals: new Array(initialTravellerDetails.length).fill(''),
            baggage: new Array(initialTravellerDetails.length).fill('included'),
            priorityBoarding: new Array(initialTravellerDetails.length).fill(false),
            loungeAccess: new Array(initialTravellerDetails.length).fill(false)
          }
        };
        console.log('Initializing services:', newServices);
        setSelectedServices(newServices);

        // Set contact info and payment type
        if (initialContactInfo) {
          console.log('Setting contact info:', initialContactInfo);
          setContactInfo(initialContactInfo);
        }
        if (initialPaymentType) {
          console.log('Setting payment type:', initialPaymentType);
          setPaymentType(initialPaymentType);
        }

        // Set initial aircraft for seat selection
        if (initialFlights.onward?.aircraft) {
          console.log('Setting initial aircraft:', initialFlights.onward.aircraft);
          setCurrentAircraft(initialFlights.onward.aircraft);
        }

        // Track page view
        analytics.pageView('Ancillary Services', location.state.previousPage, {
          flights: initialFlights,
          passengers: initialTravellerDetails,
          contactInfo: initialContactInfo,
          paymentType: initialPaymentType
        });
      } else {
        console.error('No state found in location');
        console.error('Redirecting to search due to missing state');
        navigate('/search');
      }
    } catch (error) {
      console.error('Error initializing state:', error);
      setSnackbar({
        open: true,
        message: 'Error loading flight details. Please try again.',
        severity: 'error'
      });
      navigate('/search');
    }
  }, [location.state, navigate]);

  // Calculate total whenever services change
  useEffect(() => {
    const newTotal = calculateTotal(selectedServices);
    setTotalAmount(newTotal);
  }, [selectedServices]);

  const handleServiceChange = (journey, serviceType, passengerIndex, value) => {
    console.log('Service Change:', {
      journey,
      serviceType,
      passengerIndex,
      value,
      currentServices: selectedServices
    });

    setSelectedServices(prev => {
      const newServices = { ...prev };
      if (!newServices[journey][serviceType]) {
        newServices[journey][serviceType] = [];
      }
      newServices[journey][serviceType][passengerIndex] = value;
      return newServices;
    });
      
    // Track service selection with safe data access
    try {
      const flight = selectedFlights[journey];
      if (flight) {
        const flightInfo = {
          flightNumber: flight.flightNumber,
          origin: flight.origin?.iata_code || flight.originCode,
          destination: flight.destination?.iata_code || flight.destinationCode,
          cabinClass: flight.cabinClass || 'economy',
          journeyType: journey
        };
        
        analytics.ancillarySelected(serviceType, value, value !== 'included', flightInfo);
      } else {
        console.warn('Flight data not available for analytics tracking');
      }
    } catch (error) {
      console.error('Error tracking service selection:', error);
      // Continue with the service change even if analytics fails
    }
  };

  const handleSeatSelect = (journey, passengerIndex, seat) => {
    console.log('Seat Selection Triggered:', {
      journey,
      passengerIndex,
      seat,
      currentServices: selectedServices
    });

    setSelectedServices(prev => {
      const newServices = { ...prev };
      if (!newServices[journey].seat) {
        newServices[journey].seat = [];
      }
      // If the same seat is selected again, deselect it
      if (newServices[journey].seat[passengerIndex] === seat) {
        newServices[journey].seat[passengerIndex] = null;
        console.log('Seat Deselected:', {
          journey,
          passengerIndex,
          previousSeat: seat
        });
      } else {
        newServices[journey].seat[passengerIndex] = seat;
        console.log('Seat Selected:', {
          journey,
          passengerIndex,
          newSeat: seat
        });
      }
      
      // Calculate seat price
      const aircraft = journey === 'onward' ? selectedFlights.onward?.aircraft : selectedFlights.return?.aircraft;
      const config = getAircraftConfig(aircraft);
      if (config && seat) {
        const row = parseInt(seat);
        const seatType = seat.slice(-1);
        const isPremiumRow = row <= 5;
        const isWindowSeat = seatType === 'W';
        const seatPrice = calculateSeatPrice(seat, config, selectedFlights.onward?.cabinClass);
        
        console.log('Seat Price Calculation in Selection:', {
          seat,
          row,
          seatType,
          isPremiumRow,
          isWindowSeat,
          seatPrice
        });
      }
      
      console.log('Updated Services After Seat Selection:', {
        journey,
        updatedServices: newServices
      });
      
      // Calculate new total after state update
      const newTotal = calculateTotal(newServices);
      console.log('New Total After Seat Selection:', {
        newTotal,
        breakdown: {
          seats: calculateSeatTotal(newServices),
          baggage: calculateBaggageTotal(newServices),
          priorityBoarding: calculatePriorityBoardingTotal(newServices),
          loungeAccess: calculateLoungeAccessTotal(newServices)
        }
      });
      
      setTotalAmount(newTotal);
      return newServices;
    });
    setSeatSelectionOpen(false);
    setSnackbar({
      open: true,
      message: seat ? `Seat ${seat} selected for ${journey === 'onward' ? 'onward' : 'return'} journey` : 'Seat deselected',
      severity: 'success'
    });
  };

  const openSeatSelection = (journey, aircraft) => {
    setCurrentJourney(journey);
    setCurrentAircraft(aircraft);
    setSeatSelectionOpen(true);
  };

  const normalizeCabinClass = (cabinClass) => {
    if (!cabinClass) return 'economy';
    
    // Convert to lowercase and replace spaces with underscores
    let normalized = cabinClass.toLowerCase().replace(/\s+/g, '_');
    
    // Handle common variations
    const classMappings = {
      'business_class': 'business',
      'business': 'business',
      'first_class': 'first',
      'first': 'first',
      'premium_economy': 'premium_economy',
      'premium': 'premium_economy',
      'economy_class': 'economy',
      'economy': 'economy'
    };
    
    return classMappings[normalized] || 'economy';
  };

  const getAircraftConfig = (aircraft) => {
    // Map aircraft names to configuration keys with fallbacks
    const aircraftMap = {
      'Boeing 737': 'B737',
      'B737': 'B737',
      'Airbus A320': 'A320',
      'A320': 'A320',
      'Boeing 777-300ER': 'B777',
      'B777': 'B777',
      'Boeing 787-9': 'B787',
      'B787': 'B787',
      'Airbus A350-900': 'A350',
      'A350': 'A350',
      'Airbus A380': 'A380',
      'A380': 'A380'
    };

    // Get the configuration key, defaulting to B737 if not found
    const configKey = aircraftMap[aircraft] || 'B737';
    console.log('Aircraft mapping:', { aircraft, configKey });

    // Get the configuration, defaulting to B737 if not found
    const config = seatConfigurations.configurations[configKey] || seatConfigurations.configurations['B737'];
    return config;
  };

  const getCabinConfig = (config, cabinClass) => {
    const normalizedClass = normalizeCabinClass(cabinClass);
    console.log('Cabin class normalization:', { original: cabinClass, normalized: normalizedClass });

    // Try to get the specific cabin configuration
    let cabinConfig = config.classes[normalizedClass];

    // If specific cabin not found, use a fallback configuration
    if (!cabinConfig) {
      console.log('Specific cabin config not found, using fallback');
      
      // Define fallback configurations for each cabin class
      const fallbackConfigs = {
        'first': {
          start_row: 1,
          end_row: 5,
          layout: [
            { type: 'W', name: 'Window', count: 2 },
            { type: 'M', name: 'Middle', count: 2 },
            { type: 'A', name: 'Aisle', count: 2 }
          ]
        },
        'business': {
          start_row: 1,
          end_row: 8,
          layout: [
            { type: 'W', name: 'Window', count: 2 },
            { type: 'M', name: 'Middle', count: 2 },
            { type: 'A', name: 'Aisle', count: 2 }
          ]
        },
        'premium_economy': {
          start_row: 1,
          end_row: 10,
          layout: [
            { type: 'W', name: 'Window', count: 2 },
            { type: 'M', name: 'Middle', count: 2 },
            { type: 'A', name: 'Aisle', count: 2 }
          ]
        },
        'economy': {
          start_row: 1,
          end_row: 30,
          layout: [
            { type: 'W', name: 'Window', count: 2 },
            { type: 'M', name: 'Middle', count: 2 },
            { type: 'A', name: 'Aisle', count: 2 }
          ]
        }
      };

      cabinConfig = fallbackConfigs[normalizedClass] || fallbackConfigs['economy'];
    }

    return cabinConfig;
  };

  const calculateSeatPrice = (seatNumber, config, cabinClass) => {
    if (!seatNumber || !config || !cabinClass) return 0;

    const row = parseInt(seatNumber);
    const seatType = seatNumber.slice(-1); // Get the last character (W, M, or A)
    
    // Premium seat criteria
    const isPremiumRow = row <= 5; // First 5 rows are premium
    const isWindowSeat = seatType === 'W';
    const isExitRow = config.classes[cabinClass]?.exit_rows?.includes(row);
    const isExtraLegroom = config.classes[cabinClass]?.extra_legroom_rows?.includes(row);
    
    // Calculate premium price based on seat characteristics
    if (isPremiumRow || isWindowSeat || isExitRow || isExtraLegroom) {
      let premiumPrice = 1500; // Base premium price
      
      // Add premium for each premium characteristic
      if (isPremiumRow) premiumPrice += 200;
      if (isWindowSeat) premiumPrice += 200;
      if (isExitRow) premiumPrice += 100;
      if (isExtraLegroom) premiumPrice += 100;
      
      // Cap the maximum premium price at 2000
      return Math.min(premiumPrice, 2000);
    }
    
    return 100; // Standard seat price
  };

  const renderSeatMap = () => {
    if (!currentAircraft) {
      console.log('No aircraft specified, using default B737');
      setCurrentAircraft('Boeing 737');
    }

    const config = getAircraftConfig(currentAircraft);
    console.log('Using aircraft configuration:', config);

    const normalizedCabinClass = normalizeCabinClass(selectedFlights.onward?.cabinClass);
    console.log('Normalized cabin class:', normalizedCabinClass);

    const cabinConfig = getCabinConfig(config, normalizedCabinClass);
    console.log('Using cabin configuration:', cabinConfig);

    const rows = [];
    for (let row = cabinConfig.start_row; row <= cabinConfig.end_row; row++) {
      const seats = [];
      let seatIndex = 0;
      cabinConfig.layout.forEach((seatType, typeIndex) => {
        for (let i = 0; i < seatType.count; i++) {
          const seatNumber = `${row}${seatType.type}`;
          const uniqueKey = `${row}-${seatType.type}-${typeIndex}-${i}-${seatIndex}`;
          const isSelected = selectedServices[currentJourney].seat?.includes(seatNumber);
          const isExitRow = cabinConfig.exit_rows?.includes(row);
          const isExtraLegroom = cabinConfig.extra_legroom_rows?.includes(row);
          const isPreferred = cabinConfig.preferred_rows?.includes(row);
          const isStandard = cabinConfig.standard_rows?.includes(row);
          const isPremiumRow = row <= 5;
          const isWindowSeat = seatType.type === 'W';
          const seatPrice = calculateSeatPrice(seatNumber, config, normalizedCabinClass);

          seats.push(
            <Tooltip 
              key={uniqueKey}
              title={`Row ${row} - ${seatType.name}
${isExitRow ? 'Exit Row' : ''}
${isExtraLegroom ? 'Extra Legroom' : ''}
${isPremiumRow ? 'Premium Row' : ''}
${isWindowSeat ? 'Window Seat' : ''}
Price: ₹${seatPrice}`}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  m: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isSelected ? 'primary.main' : 
                          isExitRow ? 'warning.light' :
                          isExtraLegroom ? 'info.light' :
                          isPremiumRow || isWindowSeat ? 'success.light' :
                          'grey.200',
                  color: isSelected ? 'white' : 'text.primary',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : 'grey.300'
                  }
                }}
                onClick={() => handleSeatSelect(currentJourney, 0, seatNumber)}
              >
                {seatNumber}
              </Box>
            </Tooltip>
          );
          seatIndex++;
        }
      });
      rows.push(
        <Box key={`row-${row}`} sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          {seats}
        </Box>
      );
    }

    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 2,
          position: 'relative'
        }}>
          <Box sx={{ 
            width: '80%', 
            height: 4, 
            bgcolor: 'grey.400',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 0
          }} />
          <Typography 
            variant="h6" 
            sx={{ 
              bgcolor: 'background.paper',
              px: 2,
              position: 'relative',
              zIndex: 1
            }}
          >
            {config.name} - {selectedFlights.onward?.cabinClass?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          maxHeight: 400,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'grey.100',
          borderRadius: 2
        }}>
          {rows}
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Chip 
            icon={<Info />} 
            label="Exit Row" 
            sx={{ bgcolor: 'warning.light' }} 
          />
          <Chip 
            icon={<Info />} 
            label="Extra Legroom" 
            sx={{ bgcolor: 'info.light' }} 
          />
          <Chip 
            icon={<Info />} 
            label="Premium (₹1500-2000)" 
            sx={{ bgcolor: 'success.light' }} 
          />
          <Chip 
            icon={<Info />} 
            label="Standard (₹100)" 
            sx={{ bgcolor: 'grey.200' }} 
          />
        </Box>
      </Box>
    );
  };

  const renderBaggageOptions = (journey, passengerIndex) => {
    try {
      const normalizedCabinClass = normalizeCabinClass(selectedFlights.onward?.cabinClass);
      const baggageRules = baggageRulesData.cabin_classes[normalizedCabinClass];
      
      if (!baggageRules) {
        console.error('No baggage rules found for cabin class:', normalizedCabinClass);
        return (
          <Alert severity="error">
            Unable to load baggage rules for this cabin class
          </Alert>
        );
      }

      const { cabin_baggage, checked_baggage } = baggageRules;
      const isInternational = journey === 'onward' ? 
        selectedFlights.onward.origin.iata_code !== selectedFlights.onward.destination.iata_code :
        selectedFlights.return.origin.iata_code !== selectedFlights.return.destination.iata_code;

      const currentBaggage = selectedServices[journey]?.baggage?.[passengerIndex];
      console.log('Current Baggage Selection:', {
        journey,
        passengerIndex,
        currentBaggage
      });

      return (
        <FormControl fullWidth>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Luggage sx={{ mr: 1 }} />
            <Typography variant="subtitle2">Baggage Options</Typography>
          </Box>
          
          {/* Cabin Baggage */}
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Cabin Baggage (Included)
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {cabin_baggage.pieces} piece(s) up to {cabin_baggage.max_weight_per_piece}kg
            <br />
            Max dimensions: {cabin_baggage.max_dimensions}cm
          </Typography>

          {/* Checked Baggage */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
            Checked Baggage
          </Typography>
          <RadioGroup
            value={currentBaggage || 'included'}
            onChange={(e) => handleServiceChange(journey, 'baggage', passengerIndex, e.target.value)}
          >
            <FormControlLabel
              value="included"
              control={<Radio />}
              label={`Included: ${checked_baggage.pieces} piece(s) up to ${checked_baggage.max_weight_per_piece}kg`}
            />
            <FormControlLabel
              value="extra"
              control={<Radio />}
              label={`+1 Bag (₹${isInternational ? '2000' : '1000'})`}
            />
            <FormControlLabel
              value="sports"
              control={<Radio />}
              label={`Sports Equipment (₹${isInternational ? '2000' : '1000'})`}
            />
            <FormControlLabel
              value="musical"
              control={<Radio />}
              label={`Musical Instrument (₹${isInternational ? '2000' : '1000'})`}
            />
          </RadioGroup>

          {/* Excess Baggage Warning */}
          <Alert severity="info" sx={{ mt: 2 }}>
            Excess baggage charges: ₹{isInternational ? '1000' : '500'}/kg (max ₹{isInternational ? '10000' : '5000'})
          </Alert>
        </FormControl>
      );
    } catch (error) {
      console.error('Error rendering baggage options:', error);
      return (
        <Alert severity="error">
          Error loading baggage options. Please try again.
        </Alert>
      );
    }
  };

  const renderServiceSection = (journey, flight) => {
    if (!flight) return null;
    
    // Set default cabin class if not provided
    const cabinClass = flight.cabinClass || 'economy';
    console.log('Rendering service section for flight:', {
      journey,
      flight,
      cabinClass
    });

    // Default meal options if not provided
    const defaultMealOptions = ['vegetarian', 'non_vegetarian', 'special_meal'];
    const mealOptions = flight.mealOptions || defaultMealOptions;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {journey === 'onward' ? 'Onward Journey' : 'Return Journey'}
            </Typography>
            <Chip 
              label={cabinClass.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Grid container spacing={3}>
            {/* Flight Details */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FlightTakeoff color="primary" />
                      <Box>
                        <Typography variant="h6">
                          {format(new Date(flight.departureTime), 'HH:mm')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {flight.origin?.city || flight.originCode} ({flight.origin?.iata_code || flight.originCode})
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {flight.duration}
                      </Typography>
                      <Divider sx={{ my: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          →
                        </Typography>
                      </Divider>
                      <Typography variant="body2" color="text.secondary">
                        {flight.flightNumber}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                      <Box>
                        <Typography variant="h6">
                          {format(new Date(flight.arrivalTime), 'HH:mm')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {flight.destination?.city || flight.destinationCode} ({flight.destination?.iata_code || flight.destinationCode})
                        </Typography>
                      </Box>
                      <FlightLand color="primary" />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Services */}
            {travellerDetails.map((traveller, index) => (
              <Grid item xs={12} key={index}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {traveller.firstName} {traveller.lastName}
                  </Typography>
                  <Grid container spacing={2}>
                    {/* Seat Selection */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EventSeat sx={{ mr: 1 }} />
                          <Typography variant="subtitle2">Seat Selection</Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          onClick={() => openSeatSelection(journey, flight.aircraft)}
                          fullWidth
                        >
                          {selectedServices[journey].seat?.[index] || 'Select Seat'}
                        </Button>
                      </FormControl>
                    </Grid>

                    {/* Meal Selection */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Restaurant sx={{ mr: 1 }} />
                          <Typography variant="subtitle2">Meal Preference</Typography>
                        </Box>
                        <RadioGroup
                          value={selectedServices[journey].meals?.[index] || ''}
                          onChange={(e) => handleServiceChange(journey, 'meals', index, e.target.value)}
                        >
                          {mealOptions.map((meal) => (
                            <FormControlLabel
                              key={meal}
                              value={meal}
                              control={<Radio />}
                              label={meal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </Grid>

                    {/* Baggage Selection */}
                    <Grid item xs={12} md={6}>
                      {renderBaggageOptions(journey, index)}
                    </Grid>

                    {/* Priority Services */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={2}>
                        <FormControl>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PriorityHigh sx={{ mr: 1 }} />
                            <Typography variant="subtitle2">Priority Boarding</Typography>
                          </Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedServices[journey].priorityBoarding?.[index] || false}
                                onChange={(e) => handleServiceChange(journey, 'priorityBoarding', index, e.target.checked)}
                              />
                            }
                            label="Priority Boarding (₹500)"
                          />
                        </FormControl>

                        <FormControl>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AirportShuttle sx={{ mr: 1 }} />
                            <Typography variant="subtitle2">Lounge Access</Typography>
                          </Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedServices[journey].loungeAccess?.[index] || false}
                                onChange={(e) => handleServiceChange(journey, 'loungeAccess', index, e.target.checked)}
                              />
                            }
                            label="Airport Lounge Access (₹1500)"
                          />
                        </FormControl>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Helper functions for detailed breakdown
  const calculateSeatTotal = (services) => {
    let total = 0;
    console.log('Starting Seat Total Calculation:', services);
    
    ['onward', 'return'].forEach(journey => {
      if (services[journey]?.seat) {
        services[journey].seat.forEach((seat, index) => {
          if (seat) {
            const row = parseInt(seat);
            const seatType = seat.slice(-1); // Get the last character (W, M, or A)
            const isPremiumRow = row <= 5;
            const isWindowSeat = seatType === 'W';
            const seatPrice = (isPremiumRow || isWindowSeat) ? 500 : 100;
            
            console.log(`Seat Price Calculation for ${journey}:`, {
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
    });
    
    console.log('Final Seat Total:', total);
    return total;
  };

  const calculateBaggageTotal = (services) => {
    let total = 0;
    console.log('Starting Baggage Total Calculation:', services);
    
    ['onward', 'return'].forEach(journey => {
      if (services[journey]?.baggage) {
        services[journey].baggage.forEach((baggage, index) => {
          if (baggage && baggage !== 'included') {
            const isInternational = journey === 'onward' ? 
              selectedFlights.onward.origin.iata_code !== selectedFlights.onward.destination.iata_code :
              selectedFlights.return.origin.iata_code !== selectedFlights.return.destination.iata_code;

            let baggagePrice = 0;
            switch (baggage) {
              case 'extra':
                baggagePrice = isInternational ? 2000 : 1000;
                break;
              case 'sports':
                baggagePrice = isInternational ? 2000 : 1000;
                break;
              case 'musical':
                baggagePrice = isInternational ? 2000 : 1000;
                break;
              default:
                baggagePrice = 0;
            }
            
            console.log(`Baggage Price Calculation for ${journey}:`, {
              baggage,
              isInternational,
              baggagePrice,
              currentTotal: total
            });
            
            total += baggagePrice;
          }
        });
      }
    });
    
    console.log('Final Baggage Total:', total);
    return total;
  };

  const calculatePriorityBoardingTotal = (services) => {
    let total = 0;
    ['onward', 'return'].forEach(journey => {
      if (services[journey]?.priorityBoarding) {
        services[journey].priorityBoarding.forEach(priority => {
          if (priority) {
            total += 500;
          }
        });
      }
    });
    return total;
  };

  const calculateLoungeAccessTotal = (services) => {
    let total = 0;
    ['onward', 'return'].forEach(journey => {
      if (services[journey]?.loungeAccess) {
        services[journey].loungeAccess.forEach(lounge => {
          if (lounge) {
            total += 1500;
          }
        });
      }
    });
    return total;
  };

  const calculateTotal = (services = selectedServices) => {
    console.log('Total Calculation Started:', {
      services,
      onwardFlight: selectedFlights.onward?.aircraft,
      returnFlight: selectedFlights.return?.aircraft
    });

    const seatTotal = calculateSeatTotal(services);
    const baggageTotal = calculateBaggageTotal(services);
    const priorityBoardingTotal = calculatePriorityBoardingTotal(services);
    const loungeAccessTotal = calculateLoungeAccessTotal(services);

    const total = seatTotal + baggageTotal + priorityBoardingTotal + loungeAccessTotal;

    console.log('Total Calculation Breakdown:', {
      seatTotal,
      baggageTotal,
      priorityBoardingTotal,
      loungeAccessTotal,
      finalTotal: total
    });

    return total;
  };

  const handleProceedToPayment = () => {
    // Calculate total ancillary services cost
    const ancillaryTotal = calculateTotal();
    
    // Calculate total flight fare
    const flightTotal = (
      (selectedFlights?.onward?.price?.amount || 0) + 
      (selectedFlights?.return?.price?.amount || 0)
    );

    // Calculate total amount including flight fare and ancillary services
    const totalAmount = flightTotal + ancillaryTotal;

    console.log('Proceeding to payment with totals:', {
      flightTotal,
      ancillaryTotal,
      totalAmount,
      selectedFlights
    });

    const navigationState = {
      selectedFlights: {
      onward: {
          ...selectedFlights.onward,
          price: selectedFlights.onward.price,
          cabinClass: selectedFlights.onward.cabinClass
        },
        return: selectedFlights.return ? {
          ...selectedFlights.return,
          price: selectedFlights.return.price,
          cabinClass: selectedFlights.return.cabinClass
        } : null
      },
      travellerDetails,
      contactInfo,
      selectedServices,
      flightTotal,
      ancillaryTotal,
      totalAmount,
      paymentType,
      cabinClass: selectedFlights.onward.cabinClass,
      previousPage: 'Ancillary Services'
    };

    // Track proceeding to payment with complete data
    analytics.paymentInitiated({
      ...navigationState,
      flightDetails: {
        onward: {
          origin: selectedFlights.onward.origin?.iata_code,
          destination: selectedFlights.onward.destination?.iata_code,
          price: selectedFlights.onward.price
        },
        return: selectedFlights.return ? {
          origin: selectedFlights.return.origin?.iata_code,
          destination: selectedFlights.return.destination?.iata_code,
          price: selectedFlights.return.price
        } : null
      }
    });

    navigate('/payment', { state: navigationState });
  };

  const steps = ['Flight Details', 'Ancillary Services', 'Payment'];

  // Find the number of passengers
  const numPassengers = (location.state?.passengers || travellerDetails?.length || 1);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            Select Additional Services
          </Typography>

          {selectedFlights?.onward && travellerDetails.length > 0 && (
            renderServiceSection('onward', selectedFlights.onward)
          )}
          {selectedFlights?.return && travellerDetails.length > 0 && (
            renderServiceSection('return', selectedFlights.return)
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleProceedToPayment}
            >
              Proceed to Payment
            </Button>
          </Box>
        </Grid>

        {/* Cost Breakdown Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Cost Summary
            </Typography>
            
            {/* Currency conversion note for international flights */}
            {(selectedFlights?.onward?.isInternational || selectedFlights?.return?.isInternational) && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Currency Conversion Applied:</strong> International flight prices are displayed in USD but will be converted to INR during payment at a fixed exchange rate of 1 USD = {CURRENCY_CONFIG.defaultExchangeRate} INR.
                </Typography>
              </Alert>
            )}
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Flight Cost
              </Typography>
              {selectedFlights?.onward?.price && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Onward Flight</Typography>
                  <Typography>
                    ₹{(selectedFlights.onward.price.amount * numPassengers).toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(₹{selectedFlights.onward.price.amount.toLocaleString()} x {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
                  </Typography>
                </Box>
              )}
              {selectedFlights?.return?.price && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Return Flight</Typography>
                  <Typography>
                    ₹{(selectedFlights.return.price.amount * numPassengers).toLocaleString()} <Typography component="span" variant="body2" color="textSecondary">(₹{selectedFlights.return.price.amount.toLocaleString()} x {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
                  </Typography>
                </Box>
              )}
            </Box>

            <Typography variant="h6" gutterBottom>
              Ancillary Services
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Seat Selection</Typography>
              <Typography>₹{calculateSeatTotal(selectedServices).toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Baggage</Typography>
              <Typography>₹{calculateBaggageTotal(selectedServices).toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Priority Boarding</Typography>
              <Typography>₹{calculatePriorityBoardingTotal(selectedServices).toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Lounge Access</Typography>
              <Typography>₹{calculateLoungeAccessTotal(selectedServices).toLocaleString()}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1">Flight Total</Typography>
              <Typography variant="subtitle1">
                ₹{
                  ((selectedFlights?.onward?.price?.amount || 0) * numPassengers +
                  (selectedFlights?.return?.price?.amount ? selectedFlights.return.price.amount * numPassengers : 0))
                  .toLocaleString()
                } <Typography component="span" variant="body2" color="textSecondary">(₹{
                  ((selectedFlights?.onward?.price?.amount || 0) +
                  (selectedFlights?.return?.price?.amount || 0))
                  .toLocaleString()} x {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1">Ancillary Total</Typography>
              <Typography variant="subtitle1">
                ₹{totalAmount.toLocaleString()}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total Amount</Typography>
              <Typography variant="h6" color="primary">
                ₹{
                  ((selectedFlights?.onward?.price?.amount || 0) * numPassengers +
                  (selectedFlights?.return?.price?.amount ? selectedFlights.return.price.amount * numPassengers : 0) +
                  totalAmount)
                  .toLocaleString()
                } <Typography component="span" variant="body2" color="textSecondary">(Flight + Ancillary for {numPassengers} passenger{numPassengers > 1 ? 's' : ''})</Typography>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={seatSelectionOpen}
        onClose={() => setSeatSelectionOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Select Your Seat</Typography>
            <IconButton onClick={() => setSeatSelectionOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {renderSeatMap()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeatSelectionOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AncillaryServices; 