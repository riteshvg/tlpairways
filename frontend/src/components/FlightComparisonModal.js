import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Tooltip,
  Badge,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Fab,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Compare as CompareIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  FlightTakeoff as FlightTakeoffIcon,
  FlightLand as FlightLandIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  LocalAirport as LocalAirportIcon,
  Business as BusinessIcon,
  Wifi as WifiIcon,
  Restaurant as RestaurantIcon,
  Luggage as LuggageIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Email as EmailIcon,
  ContentCopy as ContentCopyIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { format, differenceInMinutes } from 'date-fns';
import enhancedAirlinesDataLayer from '../services/EnhancedAirlinesDataLayer';
import CURRENCY_CONFIG from '../config/currencyConfig';

const FlightComparisonModal = ({ 
  open, 
  onClose, 
  flights = [], 
  onFlightSelect,
  searchId,
  userContext = {}
}) => {
  // State management
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [shareMode, setShareMode] = useState(false);
  const [emailShare, setEmailShare] = useState('');
  const [comparisonId, setComparisonId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize comparison ID
  useEffect(() => {
    if (open && !comparisonId) {
      const id = enhancedAirlinesDataLayer.generateComparisonId();
      setComparisonId(id);
      
      // Track comparison modal opened
      enhancedAirlinesDataLayer.trackFlightComparison('modalOpened', null, {
        comparisonId: id,
        totalFlightsInComparison: flights.length,
        searchId
      });
    }
  }, [open, comparisonId, flights.length, searchId]);

  // Sort flights based on current sort criteria
  const sortedFlights = useMemo(() => {
    return [...flights].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = (a.currentPrice || 0) - (b.currentPrice || 0);
          break;
        case 'duration':
          comparison = (a.durationMinutes || 0) - (b.durationMinutes || 0);
          break;
        case 'departure':
          comparison = new Date(a.departureTime) - new Date(b.departureTime);
          break;
        case 'arrival':
          comparison = new Date(a.arrivalTime) - new Date(b.arrivalTime);
          break;
        case 'airline':
          comparison = a.airline.localeCompare(b.airline);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [flights, sortBy, sortOrder]);

  // Handle flight selection
  const handleFlightSelect = useCallback((flight) => {
    setSelectedFlight(flight);
    
    // Track flight selection in comparison
    enhancedAirlinesDataLayer.trackFlightComparison('flightSelected', flight, {
      comparisonId,
      totalFlightsInComparison: flights.length,
      selectionMethod: 'comparisonModal',
      searchId
    });
    
    if (onFlightSelect) {
      onFlightSelect(flight);
    }
  }, [comparisonId, flights.length, onFlightSelect, searchId]);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    // Track sort interaction in comparison
    enhancedAirlinesDataLayer.trackEvent('comparison-sort-changed', {
      sortBy: newSortBy,
      sortOrder: newSortOrder,
      comparisonId,
      searchId
    });
  }, [comparisonId, searchId]);

  // Handle share functionality
  const handleShare = useCallback(async (method) => {
    setLoading(true);
    
    try {
      const comparisonUrl = `${window.location.origin}/comparison/${comparisonId}`;
      const shareData = {
        title: 'Flight Comparison',
        text: `Compare ${flights.length} flights`,
        url: comparisonUrl
      };
      
      if (method === 'native' && navigator.share) {
        await navigator.share(shareData);
      } else if (method === 'email') {
        const subject = 'Flight Comparison';
        const body = `Check out this flight comparison: ${comparisonUrl}`;
        window.open(`mailto:${emailShare}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      } else if (method === 'copy') {
        await navigator.clipboard.writeText(comparisonUrl);
        // Show success message
      }
      
      // Track share action
      enhancedAirlinesDataLayer.trackEvent('comparisonShared', {
        shareMethod: method,
        comparisonId,
        flightCount: flights.length,
        searchId
      });
      
    } catch (error) {
      console.error('Error sharing comparison:', error);
      enhancedAirlinesDataLayer.trackError('comparisonShare', error, { comparisonId });
    } finally {
      setLoading(false);
    }
  }, [comparisonId, flights.length, emailShare, searchId]);

  // Handle print comparison
  const handlePrint = useCallback(() => {
    window.print();
    
    // Track print action
    enhancedAirlinesDataLayer.trackEvent('comparisonPrinted', {
      comparisonId,
      flightCount: flights.length,
      searchId
    });
  }, [comparisonId, flights.length, searchId]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback((flight) => {
    // Toggle bookmark state
    flight.isBookmarked = !flight.isBookmarked;
    
    // Track bookmark action
    enhancedAirlinesDataLayer.trackEvent('flightBookmarked', {
      flightNumber: flight.flightNumber,
      action: flight.isBookmarked ? 'added' : 'removed',
      comparisonId,
      searchId
    });
  }, [comparisonId, searchId]);

  // Calculate comparison metrics
  const comparisonMetrics = useMemo(() => {
    if (flights.length === 0) return {};
    
    const prices = flights.map(f => f.currentPrice || 0);
    const durations = flights.map(f => f.durationMinutes || 0);
    
    return {
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((a, b) => a + b, 0) / prices.length
      },
      durationRange: {
        min: Math.min(...durations),
        max: Math.max(...durations),
        avg: durations.reduce((a, b) => a + b, 0) / durations.length
      },
      airlines: [...new Set(flights.map(f => f.airline))],
      totalFlights: flights.length
    };
  }, [flights]);

  // Render flight comparison table
  const renderComparisonTable = () => (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Flight</TableCell>
            <TableCell>Airline</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Departure</TableCell>
            <TableCell>Arrival</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Stops</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedFlights.map((flight, index) => (
            <TableRow 
              key={flight.flightNumber}
              hover
              selected={selectedFlight?.flightNumber === flight.flightNumber}
              onClick={() => handleFlightSelect(flight)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <Box>
                  <Typography variant="subtitle2">
                    {flight.flightNumber}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {flight.aircraft}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {flight.airline}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {flight.origin.iata_code} → {flight.destination.iata_code}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {format(new Date(flight.departureTime), 'HH:mm')}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {format(new Date(flight.departureTime), 'MMM dd')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {format(new Date(flight.arrivalTime), 'HH:mm')}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {format(new Date(flight.arrivalTime), 'MMM dd')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {flight.duration}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={flight.stops || 0} 
                  size="small"
                  color={flight.stops === 0 ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Typography variant="h6" color="primary">
                  {CURRENCY_CONFIG.formatPrice(flight.currentPrice, flight.displayCurrency)}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title={flight.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmarkToggle(flight);
                      }}
                    >
                      {flight.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Tooltip>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFlightSelect(flight);
                    }}
                  >
                    Select
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render flight comparison cards
  const renderComparisonCards = () => (
    <Grid container spacing={2}>
      {sortedFlights.map((flight, index) => (
        <Grid item xs={12} md={6} lg={4} key={flight.flightNumber}>
          <Card 
            sx={{ 
              height: '100%',
              border: selectedFlight?.flightNumber === flight.flightNumber ? '2px solid #1976d2' : '1px solid #e0e0e0',
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }}
            onClick={() => handleFlightSelect(flight)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6">
                    {flight.airline}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {flight.flightNumber}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmarkToggle(flight);
                  }}
                >
                  {flight.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  {flight.origin.iata_code} → {flight.destination.iata_code}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {format(new Date(flight.departureTime), 'MMM dd, HH:mm')} - {format(new Date(flight.arrivalTime), 'MMM dd, HH:mm')}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {flight.duration}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="textSecondary">
                    Price
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {CURRENCY_CONFIG.formatPrice(flight.currentPrice, flight.displayCurrency)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  label={flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  size="small"
                  color={flight.stops === 0 ? 'success' : 'default'}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlightSelect(flight);
                  }}
                >
                  Select
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render comparison metrics
  const renderComparisonMetrics = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Comparison Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {comparisonMetrics.totalFlights}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Flights Compared
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {CURRENCY_CONFIG.formatPrice(comparisonMetrics.priceRange?.min || 0, 'INR')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Lowest Price
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {Math.floor((comparisonMetrics.durationRange?.min || 0) / 60)}h {((comparisonMetrics.durationRange?.min || 0) % 60)}m
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Shortest Duration
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  // Render share options
  const renderShareOptions = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Share Comparison
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={() => handleShare('native')}
          disabled={loading}
        >
          Share
        </Button>
        <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={() => handleShare('copy')}
          disabled={loading}
        >
          Copy Link
        </Button>
        <Button
          variant="outlined"
          startIcon={<EmailIcon />}
          onClick={() => setShareMode(!shareMode)}
        >
          Email
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print
        </Button>
      </Box>
      
      {shareMode && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={emailShare}
            onChange={(e) => setEmailShare(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={() => handleShare('email')}
                    disabled={!emailShare || loading}
                  >
                    Send
                  </Button>
                </InputAdornment>
              )
            }}
          />
        </Box>
      )}
    </Paper>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={flights.length > 6}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareIcon />
            <Typography variant="h5">
              Flight Comparison ({flights.length})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="table">Table</ToggleButton>
              <ToggleButton value="cards">Cards</ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {renderComparisonMetrics()}
        {renderShareOptions()}
        
        {/* Sort controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body1">Sort by:</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value, sortOrder)}
            >
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="duration">Duration</MenuItem>
              <MenuItem value="departure">Departure</MenuItem>
              <MenuItem value="arrival">Arrival</MenuItem>
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
        
        {/* Comparison content */}
        {viewMode === 'table' ? renderComparisonTable() : renderComparisonCards()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        {selectedFlight && (
          <Button
            variant="contained"
            onClick={() => {
              handleFlightSelect(selectedFlight);
              onClose();
            }}
            startIcon={<CheckIcon />}
          >
            Select Flight
          </Button>
        )}
      </DialogActions>
      
      {loading && (
        <Backdrop open={loading}>
          <CircularProgress />
        </Backdrop>
      )}
    </Dialog>
  );
};

export default FlightComparisonModal;
