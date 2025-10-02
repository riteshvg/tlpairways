# Enhanced Search Results Data Layer

## Overview
Comprehensive data layer implementation for search results page with detailed analytics, revenue tracking, and user behavior insights.

## Key Features

### 1. Distance Calculation
- **Function**: `calculateDistance(origin, destination)`
- **Method**: Haversine formula for accurate geographical distance
- **Output**: Distance in kilometers between origin and destination airports
- **Use Case**: Route analytics, pricing algorithms, user experience

### 2. Special Days Detection
- **Function**: `getSpecialDay(date, country)`
- **Coverage**: 
  - Indian holidays (Republic Day, Diwali, Holi, etc.)
  - International holidays (New Year, Christmas, etc.)
  - UAE holidays (Eid, National Day, etc.)
  - UK holidays (Bank holidays, Easter, etc.)
  - US holidays (Thanksgiving, Independence Day, etc.)
- **Output**: Boolean flag and special day details
- **Use Case**: Pricing strategies, demand forecasting, marketing campaigns

### 3. Search Query Parameters
```javascript
search_criteria: {
  origin_airport: 'BOM',
  origin_city: 'Mumbai',
  origin_country: 'India',
  destination_airport: 'DXB',
  destination_city: 'Dubai',
  destination_country: 'UAE',
  departure_date: '2025-10-15',
  return_date: '2025-10-22', // null for one-way
  trip_type: 'round_trip', // one_way, round_trip, multi_city
  passengers: {
    adults: 2,
    children: 1,
    infants: 0,
    total: 3
  },
  cabin_class: 'economy', // economy, premium_economy, business, first
  flexible_dates: false,
  direct_flights_only: false
}
```

### 4. Enhanced Flight Objects
```javascript
flights: [
  {
    // Flight Identification
    flight_id: 'TL_BOM_DXB_001',
    flight_number: 'TL 401',
    airline_code: 'TL',
    airline_name: 'TL Airways',
    aircraft_type: 'Boeing 787',
    
    // Route Information
    route: 'BOM-DXB',
    origin: {
      airport_code: 'BOM',
      airport_name: 'Chhatrapati Shivaji Maharaj International',
      city: 'Mumbai',
      country: 'India',
      terminal: 'T2'
    },
    destination: {
      airport_code: 'DXB',
      airport_name: 'Dubai International Airport',
      city: 'Dubai',
      country: 'UAE',
      terminal: 'T3'
    },
    
    // Timing
    departure_datetime: '2025-10-15T14:30:00+05:30',
    arrival_datetime: '2025-10-15T17:45:00+04:00',
    departure_time: '14:30',
    arrival_time: '17:45',
    departure_timezone: 'Asia/Kolkata',
    arrival_timezone: 'Asia/Dubai',
    flight_duration_minutes: 195,
    flight_duration_display: '3h 15m',
    
    // Stops & Connections
    stops: 0,
    stop_details: [], // for connecting flights
    is_direct: true,
    layover_duration: null,
    
    // Pricing
    price: {
      base_fare: 28000,
      taxes_fees: 4500,
      total_price: 32500,
      currency: 'INR',
      price_per_passenger: 32500,
      total_for_all_passengers: 97500,
      fare_class: 'V', // booking class
      fare_basis: 'VLOWSEAS'
    },
    
    // Availability & Booking
    seats_available: 15,
    cabin_class: 'economy',
    booking_class: 'V',
    refundable: false,
    changeable: true,
    change_fee: 2500,
    baggage: {
      carry_on: '7kg',
      checked: '23kg',
      excess_baggage_fee: 1500
    },
    
    // Services
    meal_service: true,
    wifi_available: true,
    entertainment: true,
    power_outlet: true,
    
    // Ranking & Display
    result_position: 1,
    is_recommended: true,
    is_fastest: false,
    is_cheapest: true,
    popularity_score: 85
  }
]
```

### 5. User Preferences
```javascript
user_preferences: {
  preferred_airlines: ['TL Airways'],
  preferred_cabin_class: 'economy',
  price_sensitivity: 'high', // low, medium, high
  loyalty_status: 'silver', // none, silver, gold, platinum
  frequent_routes: ['BOM-DXB', 'DEL-LHR'],
  booking_window_days: 45, // days before departure
  previous_searches: 3,
  session_search_count: 1
}
```

### 6. Revenue Analytics
```javascript
revenue_data: {
  potential_revenue: 97500, // total for all passengers
  avg_revenue_per_user: 97500,
  booking_probability_score: 0.75,
  estimated_conversion_value: 73125,
  revenue_bucket: 'high_value' // low_value, medium_value, high_value
}
```

### 7. Geography & Route Analytics
```javascript
geography: {
  user_location: {
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    timezone: 'Asia/Kolkata',
    ip_country: 'IN',
    currency: 'INR',
    language: 'en-IN'
  },
  route_analytics: {
    route_popularity_rank: 3,
    seasonal_demand: 'high',
    business_leisure_ratio: '40:60',
    avg_advance_booking: 35, // days
    peak_travel_months: ['November', 'December', 'January']
  }
}
```

## Implementation

### Files Created/Modified:
1. **`utils/searchAnalytics.js`** - Utility functions for calculations
2. **`services/EnhancedSearchResultsDataLayer.js`** - Main data layer service
3. **`components/SearchResults.js`** - Updated to use enhanced data layer
4. **`components/EnhancedSearchResultsTest.js`** - Test component

### Usage:
```javascript
import enhancedSearchResultsDataLayer from '../services/EnhancedSearchResultsDataLayer';

// Initialize search
enhancedSearchResultsDataLayer.initializeSearch(searchId);

// Track search results
enhancedSearchResultsDataLayer.trackSearchResults(
  searchParams,
  flights,
  user,
  airports
);

// Track abandonment
enhancedSearchResultsDataLayer.trackSearchAbandonment();
```

## Data Layer Events

### 1. search-results-displayed
Main event containing all search results data with comprehensive analytics.

### 2. flight-viewed
Individual flight view tracking (when flight comes into viewport).

### 3. search-abandoned
Tracks when user leaves search results without booking.

## Business Value

### Analytics & Insights:
- **Route Performance**: Track popular routes and demand patterns
- **Revenue Optimization**: Identify high-value search sessions
- **User Behavior**: Understand search patterns and preferences
- **Pricing Strategy**: Analyze price sensitivity and special day impacts

### Marketing & Personalization:
- **Targeted Campaigns**: Use special days for promotional campaigns
- **Dynamic Pricing**: Adjust prices based on demand and special events
- **User Segmentation**: Segment users based on preferences and behavior
- **Conversion Optimization**: Identify factors that drive bookings

### Operational Intelligence:
- **Capacity Planning**: Understand demand patterns for route planning
- **Service Enhancement**: Identify popular services and amenities
- **Revenue Forecasting**: Predict revenue based on search patterns
- **Competitive Analysis**: Track airline preferences and market share

## Testing

Use the `EnhancedSearchResultsTest` component to:
1. Generate sample search results data
2. View comprehensive data layer events
3. Test all analytics calculations
4. Verify special days detection
5. Validate revenue calculations

## Future Enhancements

1. **Real-time Pricing**: Dynamic pricing based on demand
2. **Personalization**: AI-driven recommendations
3. **A/B Testing**: Test different search result layouts
4. **Predictive Analytics**: Forecast booking probability
5. **Cross-sell Opportunities**: Identify ancillary service opportunities
