import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
  Badge,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  LocalAirport as LocalAirportIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  Flight as FlightIcon,
  Wifi as WifiIcon,
  Restaurant as RestaurantIcon,
  Luggage as LuggageIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import enhancedAirlinesDataLayer from '../services/EnhancedAirlinesDataLayer';

const AdvancedFilterSystem = ({ 
  flights = [], 
  onFiltersChange, 
  searchId, 
  userContext = {} 
}) => {
  // Filter state
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    airlines: [],
    departureTime: [],
    arrivalTime: [],
    stops: [],
    duration: [0, 24],
    amenities: [],
    aircraft: [],
    alliances: [],
    priceTrend: [],
    bookingClass: [],
    refundable: null,
    flexibleDates: false
  });

  // UI state
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    airlines: true,
    time: false,
    stops: false,
    amenities: false,
    advanced: false
  });

  // Filter presets
  const [activePreset, setActivePreset] = useState(null);
  const [customFilters, setCustomFilters] = useState([]);

  // Dynamic filter options based on available flights
  const filterOptions = useMemo(() => {
    if (flights.length === 0) return {};

    const airlines = [...new Set(flights.map(f => f.airline))];
    const aircraft = [...new Set(flights.map(f => f.aircraft))];
    const alliances = [...new Set(flights.map(f => f.alliance || 'Unknown'))];
    
    const prices = flights.map(f => f.currentPrice);
    const durations = flights.map(f => f.durationMinutes);
    
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
    
    const durationRange = {
      min: Math.min(...durations) / 60, // Convert to hours
      max: Math.max(...durations) / 60
    };

    return {
      airlines,
      aircraft,
      alliances,
      priceRange,
      durationRange
    };
  }, [flights]);

  // Filter presets
  const filterPresets = useMemo(() => [
    {
      id: 'cheapest',
      name: 'Cheapest',
      icon: <AttachMoneyIcon />,
      description: 'Lowest price flights',
      filters: {
        sortBy: 'price',
        sortOrder: 'asc'
      }
    },
    {
      id: 'fastest',
      name: 'Fastest',
      icon: <AccessTimeIcon />,
      description: 'Shortest duration',
      filters: {
        sortBy: 'duration',
        sortOrder: 'asc'
      }
    },
    {
      id: 'best-value',
      name: 'Best Value',
      icon: <StarIcon />,
      description: 'Best price-duration ratio',
      filters: {
        priceRange: [filterOptions.priceRange?.min || 0, (filterOptions.priceRange?.max || 10000) * 0.7],
        duration: [0, 8]
      }
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: <BusinessIcon />,
      description: 'Business and first class',
      filters: {
        bookingClass: ['business', 'first'],
        amenities: ['wifi', 'lounge', 'priority-boarding']
      }
    },
    {
      id: 'nonstop',
      name: 'Non-stop',
      icon: <FlightIcon />,
      description: 'Direct flights only',
      filters: {
        stops: [0]
      }
    }
  ], [filterOptions]);

  // Apply filters and notify parent
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    onFiltersChange({ ...filters, ...newFilters });
    
    // Track filter application
    enhancedAirlinesDataLayer.trackFilterInteraction('advanced-filters', newFilters, {
      searchId,
      resultsBeforeFilter: flights.length,
      resultsAfterFilter: flights.length, // Will be calculated by parent
      interactionMethod: 'preset' // or 'manual'
    });
  }, [filters, onFiltersChange, searchId, flights.length]);

  // Handle preset selection
  const handlePresetSelect = useCallback((preset) => {
    setActivePreset(preset.id);
    applyFilters(preset.filters);
    
    // Track preset usage
    enhancedAirlinesDataLayer.trackEvent('filter-preset-selected', {
      presetId: preset.id,
      presetName: preset.name,
      searchId,
      userSegment: userContext.userSegment || 'unknown'
    });
  }, [applyFilters, searchId, userContext]);

  // Handle individual filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    const newFilters = { [filterType]: value };
    applyFilters(newFilters);
    
    // Track specific filter interaction
    enhancedAirlinesDataLayer.trackFilterInteraction(filterType, value, {
      searchId,
      filterCategory: getFilterCategory(filterType),
      userSegment: userContext.userSegment || 'unknown'
    });
  }, [applyFilters, searchId, userContext]);

  // Get filter category for analytics
  const getFilterCategory = (filterType) => {
    const categories = {
      priceRange: 'price',
      airlines: 'airline',
      departureTime: 'time',
      arrivalTime: 'time',
      stops: 'stops',
      duration: 'duration',
      amenities: 'amenities',
      aircraft: 'aircraft',
      alliances: 'alliance',
      priceTrend: 'price',
      bookingClass: 'class',
      refundable: 'policy',
      flexibleDates: 'date'
    };
    return categories[filterType] || 'other';
  };

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const clearedFilters = {
      priceRange: [filterOptions.priceRange?.min || 0, filterOptions.priceRange?.max || 10000],
      airlines: [],
      departureTime: [],
      arrivalTime: [],
      stops: [],
      duration: [filterOptions.durationRange?.min || 0, filterOptions.durationRange?.max || 24],
      amenities: [],
      aircraft: [],
      alliances: [],
      priceTrend: [],
      bookingClass: [],
      refundable: null,
      flexibleDates: false
    };
    
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setActivePreset(null);
    
    // Track filter clear
    enhancedAirlinesDataLayer.trackEvent('filters-cleared', {
      searchId,
      clearedFilterCount: Object.keys(filters).length
    });
  }, [filterOptions, onFiltersChange, searchId, filters]);

  // Save custom filter preset
  const saveCustomPreset = useCallback(() => {
    const presetName = prompt('Enter preset name:');
    if (presetName) {
      const newPreset = {
        id: `custom_${Date.now()}`,
        name: presetName,
        filters: { ...filters },
        isCustom: true
      };
      
      setCustomFilters(prev => [...prev, newPreset]);
      
      // Track custom preset creation
      enhancedAirlinesDataLayer.trackEvent('custom-filter-preset-saved', {
        presetName,
        searchId,
        filterCount: Object.keys(filters).length
      });
    }
  }, [filters, searchId]);

  // Toggle section expansion
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Render price range filter
  const renderPriceFilter = () => (
    <Accordion 
      expanded={expandedSections.price} 
      onChange={() => toggleSection('price')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoneyIcon />
          <Typography>Price Range</Typography>
          {filters.priceRange[0] > filterOptions.priceRange?.min || 
           filters.priceRange[1] < filterOptions.priceRange?.max ? (
            <Chip label="Active" size="small" color="primary" />
          ) : null}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ px: 2 }}>
          <Slider
            value={filters.priceRange}
            onChange={(_, value) => handleFilterChange('priceRange', value)}
            valueLabelDisplay="auto"
            min={filterOptions.priceRange?.min || 0}
            max={filterOptions.priceRange?.max || 10000}
            step={100}
            valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="textSecondary">
              ₹{filters.priceRange[0].toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ₹{filters.priceRange[1].toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  // Render airline filter
  const renderAirlineFilter = () => (
    <Accordion 
      expanded={expandedSections.airlines} 
      onChange={() => toggleSection('airlines')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalAirportIcon />
          <Typography>Airlines</Typography>
          {filters.airlines.length > 0 && (
            <Chip label={filters.airlines.length} size="small" color="primary" />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          {filterOptions.airlines?.map(airline => (
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
      </AccordionDetails>
    </Accordion>
  );

  // Render time filters
  const renderTimeFilters = () => (
    <Accordion 
      expanded={expandedSections.time} 
      onChange={() => toggleSection('time')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon />
          <Typography>Departure & Arrival Times</Typography>
          {(filters.departureTime.length > 0 || filters.arrivalTime.length > 0) && (
            <Chip label="Active" size="small" color="primary" />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Departure Time</Typography>
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
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>Arrival Time</Typography>
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
                    checked={filters.arrivalTime.includes(time.value)}
                    onChange={(e) => {
                      const newTimes = e.target.checked
                        ? [...filters.arrivalTime, time.value]
                        : filters.arrivalTime.filter(t => t !== time.value);
                      handleFilterChange('arrivalTime', newTimes);
                    }}
                  />
                }
                label={time.label}
              />
            ))}
          </FormGroup>
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  // Render stops filter
  const renderStopsFilter = () => (
    <Accordion 
      expanded={expandedSections.stops} 
      onChange={() => toggleSection('stops')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlightIcon />
          <Typography>Stops</Typography>
          {filters.stops.length > 0 && (
            <Chip label={filters.stops.length} size="small" color="primary" />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          {[
            { value: 0, label: 'Non-stop' },
            { value: 1, label: '1 Stop' },
            { value: 2, label: '2+ Stops' }
          ].map(stop => (
            <FormControlLabel
              key={stop.value}
              control={
                <Checkbox
                  checked={filters.stops.includes(stop.value)}
                  onChange={(e) => {
                    const newStops = e.target.checked
                      ? [...filters.stops, stop.value]
                      : filters.stops.filter(s => s !== stop.value);
                    handleFilterChange('stops', newStops);
                  }}
                />
              }
              label={stop.label}
            />
          ))}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  );

  // Render amenities filter
  const renderAmenitiesFilter = () => (
    <Accordion 
      expanded={expandedSections.amenities} 
      onChange={() => toggleSection('amenities')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WifiIcon />
          <Typography>Amenities</Typography>
          {filters.amenities.length > 0 && (
            <Chip label={filters.amenities.length} size="small" color="primary" />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          {[
            { value: 'wifi', label: 'WiFi', icon: <WifiIcon /> },
            { value: 'meals', label: 'Meals', icon: <RestaurantIcon /> },
            { value: 'baggage', label: 'Baggage', icon: <LuggageIcon /> },
            { value: 'lounge', label: 'Lounge Access', icon: <BusinessIcon /> },
            { value: 'priority-boarding', label: 'Priority Boarding', icon: <SecurityIcon /> },
            { value: 'entertainment', label: 'Entertainment', icon: <WifiIcon /> }
          ].map(amenity => (
            <FormControlLabel
              key={amenity.value}
              control={
                <Checkbox
                  checked={filters.amenities.includes(amenity.value)}
                  onChange={(e) => {
                    const newAmenities = e.target.checked
                      ? [...filters.amenities, amenity.value]
                      : filters.amenities.filter(a => a !== amenity.value);
                    handleFilterChange('amenities', newAmenities);
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {amenity.icon}
                  {amenity.label}
                </Box>
              }
            />
          ))}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  );

  // Render advanced filters
  const renderAdvancedFilters = () => (
    <Accordion 
      expanded={expandedSections.advanced} 
      onChange={() => toggleSection('advanced')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon />
          <Typography>Advanced Filters</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Duration</Typography>
          <Slider
            value={filters.duration}
            onChange={(_, value) => handleFilterChange('duration', value)}
            valueLabelDisplay="auto"
            min={filterOptions.durationRange?.min || 0}
            max={filterOptions.durationRange?.max || 24}
            step={0.5}
            valueLabelFormat={(value) => `${value}h`}
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Booking Class</Typography>
          <FormGroup>
            {['economy', 'premium-economy', 'business', 'first'].map(className => (
              <FormControlLabel
                key={className}
                control={
                  <Checkbox
                    checked={filters.bookingClass.includes(className)}
                    onChange={(e) => {
                      const newClasses = e.target.checked
                        ? [...filters.bookingClass, className]
                        : filters.bookingClass.filter(c => c !== className);
                      handleFilterChange('bookingClass', newClasses);
                    }}
                  />
                }
                label={className.charAt(0).toUpperCase() + className.slice(1)}
              />
            ))}
          </FormGroup>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Refundable</Typography>
          <ToggleButtonGroup
            value={filters.refundable}
            exclusive
            onChange={(_, value) => handleFilterChange('refundable', value)}
            size="small"
          >
            <ToggleButton value={true}>Yes</ToggleButton>
            <ToggleButton value={false}>No</ToggleButton>
            <ToggleButton value={null}>Any</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.flexibleDates}
              onChange={(e) => handleFilterChange('flexibleDates', e.target.checked)}
            />
          }
          label="Flexible Dates"
        />
      </AccordionDetails>
    </Accordion>
  );

  // Render filter presets
  const renderFilterPresets = () => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Quick Filters
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {filterPresets.map(preset => (
          <Chip
            key={preset.id}
            icon={preset.icon}
            label={preset.name}
            onClick={() => handlePresetSelect(preset)}
            color={activePreset === preset.id ? 'primary' : 'default'}
            variant={activePreset === preset.id ? 'filled' : 'outlined'}
          />
        ))}
      </Box>
      
      {/* Custom presets */}
      {customFilters.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Your Presets
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {customFilters.map(preset => (
              <Chip
                key={preset.id}
                label={preset.name}
                onClick={() => handlePresetSelect(preset)}
                color={activePreset === preset.id ? 'primary' : 'default'}
                variant={activePreset === preset.id ? 'filled' : 'outlined'}
                onDelete={() => {
                  setCustomFilters(prev => prev.filter(p => p.id !== preset.id));
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );

  // Render active filters summary
  const renderActiveFilters = () => {
    const activeFilterCount = Object.values(filters).filter(value => 
      Array.isArray(value) ? value.length > 0 : value !== null && value !== false
    ).length;

    if (activeFilterCount === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2">
            Active Filters ({activeFilterCount})
          </Typography>
          <Button
            size="small"
            onClick={clearAllFilters}
            startIcon={<ClearIcon />}
          >
            Clear All
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filters.airlines.map(airline => (
            <Chip
              key={airline}
              label={airline}
              onDelete={() => handleFilterChange('airlines', filters.airlines.filter(a => a !== airline))}
              size="small"
            />
          ))}
          {filters.amenities.map(amenity => (
            <Chip
              key={amenity}
              label={amenity}
              onDelete={() => handleFilterChange('amenities', filters.amenities.filter(a => a !== amenity))}
              size="small"
            />
          ))}
          {filters.stops.map(stop => (
            <Chip
              key={stop}
              label={`${stop} stop${stop > 1 ? 's' : ''}`}
              onDelete={() => handleFilterChange('stops', filters.stops.filter(s => s !== stop))}
              size="small"
            />
          ))}
        </Box>
      </Box>
    );
  };

  if (flights.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Skeleton variant="rectangular" height={200} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Filters
        </Typography>
        <Box>
          <Button
            size="small"
            onClick={saveCustomPreset}
            startIcon={<StarBorderIcon />}
          >
            Save Preset
          </Button>
        </Box>
      </Box>

      {renderFilterPresets()}
      {renderActiveFilters()}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {renderPriceFilter()}
        {renderAirlineFilter()}
        {renderTimeFilters()}
        {renderStopsFilter()}
        {renderAmenitiesFilter()}
        {renderAdvancedFilters()}
      </Box>
    </Paper>
  );
};

export default AdvancedFilterSystem;
