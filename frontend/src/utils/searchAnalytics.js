/**
 * Search Analytics Utilities
 * Provides functions for calculating distances, special days, and other search analytics
 */

import { differenceInDays, isWithinInterval, format } from 'date-fns';

// Special days configuration
const SPECIAL_DAYS = {
  // Indian Holidays
  '2025-01-26': { name: 'Republic Day', type: 'national', country: 'IN' },
  '2025-03-29': { name: 'Holi', type: 'festival', country: 'IN' },
  '2025-04-14': { name: 'Ambedkar Jayanti', type: 'national', country: 'IN' },
  '2025-04-17': { name: 'Ram Navami', type: 'religious', country: 'IN' },
  '2025-05-01': { name: 'Labour Day', type: 'national', country: 'IN' },
  '2025-08-15': { name: 'Independence Day', type: 'national', country: 'IN' },
  '2025-09-07': { name: 'Janmashtami', type: 'religious', country: 'IN' },
  '2025-10-02': { name: 'Gandhi Jayanti', type: 'national', country: 'IN' },
  '2025-10-12': { name: 'Dussehra', type: 'festival', country: 'IN' },
  '2025-10-20': { name: 'Diwali', type: 'festival', country: 'IN' },
  '2025-11-01': { name: 'Kannada Rajyotsava', type: 'regional', country: 'IN' },
  '2025-12-25': { name: 'Christmas', type: 'religious', country: 'IN' },
  
  // International Holidays
  '2025-01-01': { name: 'New Year', type: 'international', country: 'GLOBAL' },
  '2025-12-31': { name: 'New Year Eve', type: 'international', country: 'GLOBAL' },
  '2025-02-14': { name: 'Valentine\'s Day', type: 'commercial', country: 'GLOBAL' },
  '2025-03-08': { name: 'International Women\'s Day', type: 'international', country: 'GLOBAL' },
  '2025-05-12': { name: 'Mother\'s Day', type: 'commercial', country: 'GLOBAL' },
  '2025-06-16': { name: 'Father\'s Day', type: 'commercial', country: 'GLOBAL' },
  '2025-11-28': { name: 'Thanksgiving', type: 'national', country: 'US' },
  '2025-12-24': { name: 'Christmas Eve', type: 'religious', country: 'GLOBAL' },
  
  // UAE Holidays
  '2025-01-01': { name: 'New Year', type: 'national', country: 'AE' },
  '2025-03-21': { name: 'Eid al-Fitr', type: 'religious', country: 'AE' },
  '2025-06-16': { name: 'Eid al-Adha', type: 'religious', country: 'AE' },
  '2025-07-21': { name: 'Islamic New Year', type: 'religious', country: 'AE' },
  '2025-09-15': { name: 'Prophet Muhammad\'s Birthday', type: 'religious', country: 'AE' },
  '2025-12-02': { name: 'UAE National Day', type: 'national', country: 'AE' },
  
  // UK Holidays
  '2025-01-01': { name: 'New Year\'s Day', type: 'national', country: 'GB' },
  '2025-04-18': { name: 'Good Friday', type: 'religious', country: 'GB' },
  '2025-04-21': { name: 'Easter Monday', type: 'religious', country: 'GB' },
  '2025-05-05': { name: 'Early May Bank Holiday', type: 'national', country: 'GB' },
  '2025-05-26': { name: 'Spring Bank Holiday', type: 'national', country: 'GB' },
  '2025-08-25': { name: 'Summer Bank Holiday', type: 'national', country: 'GB' },
  '2025-12-25': { name: 'Christmas Day', type: 'religious', country: 'GB' },
  '2025-12-26': { name: 'Boxing Day', type: 'national', country: 'GB' },
  
  // US Holidays
  '2025-01-01': { name: 'New Year\'s Day', type: 'national', country: 'US' },
  '2025-01-20': { name: 'Martin Luther King Jr. Day', type: 'national', country: 'US' },
  '2025-02-17': { name: 'Presidents\' Day', type: 'national', country: 'US' },
  '2025-05-26': { name: 'Memorial Day', type: 'national', country: 'US' },
  '2025-07-04': { name: 'Independence Day', type: 'national', country: 'US' },
  '2025-09-01': { name: 'Labor Day', type: 'national', country: 'US' },
  '2025-10-13': { name: 'Columbus Day', type: 'national', country: 'US' },
  '2025-11-11': { name: 'Veterans Day', type: 'national', country: 'US' },
  '2025-11-27': { name: 'Thanksgiving', type: 'national', country: 'US' },
  '2025-12-25': { name: 'Christmas Day', type: 'religious', country: 'US' }
};

/**
 * Calculate distance between two airports using Haversine formula
 * @param {Object} origin - Origin airport with lat/lng
 * @param {Object} destination - Destination airport with lat/lng
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (origin, destination) => {
  if (!origin?.coordinates || !destination?.coordinates) {
    return null;
  }

  const R = 6371; // Earth's radius in kilometers
  const lat1 = origin.coordinates.latitude * Math.PI / 180;
  const lat2 = destination.coordinates.latitude * Math.PI / 180;
  const deltaLat = (destination.coordinates.latitude - origin.coordinates.latitude) * Math.PI / 180;
  const deltaLng = (destination.coordinates.longitude - origin.coordinates.longitude) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

/**
 * Check if a date falls on a special day
 * @param {Date} date - Date to check
 * @param {string} country - Country code to check special days for
 * @returns {Object|null} Special day information or null
 */
export const getSpecialDay = (date, country = 'IN') => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const specialDay = SPECIAL_DAYS[dateStr];
  
  if (specialDay && (specialDay.country === country || specialDay.country === 'GLOBAL')) {
    return {
      is_special: true,
      special_day: specialDay.name,
      special_type: specialDay.type,
      country: specialDay.country
    };
  }
  
  return {
    is_special: false,
    special_day: null,
    special_type: null,
    country: null
  };
};

/**
 * Get user location information based on IP address with multiple fallback services
 * @returns {Promise<Object>} User location data
 */
export const getUserLocation = async () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language || 'en';
  
  // Try multiple IP geolocation services as fallbacks (CORS-friendly)
  const services = [
    'https://ipapi.co/json/',
    'https://ip-api.com/json/',
    'https://api.db-ip.com/v2/free/self',
    'https://freeipapi.com/api/json'
  ];
  
  for (const service of services) {
    try {
      console.log(`Trying IP geolocation service: ${service}`);
      const response = await fetch(service, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('IP geolocation data received:', data);
      
      // Handle different API response formats
      let locationData = {};
      
      if (service.includes('ipapi.co')) {
        locationData = {
          country: data.country_name || 'Unknown',
          state: data.region || 'Unknown',
          city: data.city || 'Unknown',
          timezone: data.timezone || timezone,
          ipCountry: data.country_code || 'Unknown',
          currency: data.currency || 'USD',
          language: data.languages ? data.languages.split(',')[0] : language
        };
      } else if (service.includes('ip-api.com')) {
        locationData = {
          country: data.country || 'Unknown',
          state: data.regionName || 'Unknown',
          city: data.city || 'Unknown',
          timezone: data.timezone || timezone,
          ipCountry: data.countryCode || 'Unknown',
          currency: data.currency || 'USD',
          language: language
        };
      } else if (service.includes('db-ip.com')) {
        locationData = {
          country: data.countryName || 'Unknown',
          state: data.stateProv || 'Unknown',
          city: data.city || 'Unknown',
          timezone: data.timeZone || timezone,
          ipCountry: data.countryCode || 'Unknown',
          currency: 'USD',
          language: language
        };
      } else if (service.includes('freeipapi.com')) {
        locationData = {
          country: data.countryName || 'Unknown',
          state: data.stateName || 'Unknown',
          city: data.cityName || 'Unknown',
          timezone: data.timeZone || timezone,
          ipCountry: data.countryCode || 'Unknown',
          currency: 'USD',
          language: language
        };
      } else {
        // Generic fallback for other services
        locationData = {
          country: data.country || data.country_name || 'Unknown',
          state: data.region || data.state || 'Unknown',
          city: data.city || 'Unknown',
          timezone: data.timezone || timezone,
          ipCountry: data.country_code || data.countryCode || 'Unknown',
          currency: data.currency || 'USD',
          language: language
        };
      }
      
      // Validate that we got meaningful data
      if (locationData.country !== 'Unknown' && locationData.country !== '') {
        console.log('Successfully got location data:', locationData);
        return locationData;
      }
      
    } catch (error) {
      console.warn(`Failed to get location from ${service}:`, error.message);
      continue; // Try next service
    }
  }
  
  // If all services fail, use browser-based fallback with better defaults
  console.warn('All IP geolocation services failed, using browser-based fallback');
  
  // Try to extract country from timezone
  const timezoneCountry = getCountryFromTimezone(timezone);
  
  return {
    country: timezoneCountry || 'Unknown',
    state: 'Unknown',
    city: 'Unknown',
    timezone: timezone,
    ipCountry: timezoneCountry || 'Unknown',
    currency: getCurrencyFromTimezone(timezone),
    language: language
  };
};

/**
 * Extract country from timezone
 * @param {string} timezone - Timezone string
 * @returns {string} Country code or name
 */
const getCountryFromTimezone = (timezone) => {
  const timezoneMap = {
    'Asia/Kolkata': 'India',
    'Asia/Calcutta': 'India',
    'America/New_York': 'United States',
    'America/Los_Angeles': 'United States',
    'America/Chicago': 'United States',
    'Europe/London': 'United Kingdom',
    'Europe/Paris': 'France',
    'Europe/Berlin': 'Germany',
    'Asia/Tokyo': 'Japan',
    'Asia/Shanghai': 'China',
    'Australia/Sydney': 'Australia',
    'America/Toronto': 'Canada',
    'Europe/Rome': 'Italy',
    'Europe/Madrid': 'Spain',
    'Asia/Dubai': 'United Arab Emirates',
    'Asia/Singapore': 'Singapore',
    'Asia/Hong_Kong': 'Hong Kong',
    'Europe/Amsterdam': 'Netherlands',
    'Europe/Stockholm': 'Sweden',
    'Europe/Copenhagen': 'Denmark'
  };
  
  return timezoneMap[timezone] || null;
};

/**
 * Get currency from timezone
 * @param {string} timezone - Timezone string
 * @returns {string} Currency code
 */
const getCurrencyFromTimezone = (timezone) => {
  const currencyMap = {
    'Asia/Kolkata': 'INR',
    'Asia/Calcutta': 'INR',
    'America/New_York': 'USD',
    'America/Los_Angeles': 'USD',
    'America/Chicago': 'USD',
    'Europe/London': 'GBP',
    'Europe/Paris': 'EUR',
    'Europe/Berlin': 'EUR',
    'Asia/Tokyo': 'JPY',
    'Asia/Shanghai': 'CNY',
    'Australia/Sydney': 'AUD',
    'America/Toronto': 'CAD',
    'Europe/Rome': 'EUR',
    'Europe/Madrid': 'EUR',
    'Asia/Dubai': 'AED',
    'Asia/Singapore': 'SGD',
    'Asia/Hong_Kong': 'HKD',
    'Europe/Amsterdam': 'EUR',
    'Europe/Stockholm': 'SEK',
    'Europe/Copenhagen': 'DKK'
  };
  
  return currencyMap[timezone] || 'USD';
};

/**
 * Calculate route analytics
 * @param {string} origin - Origin airport code
 * @param {string} destination - Destination airport code
 * @returns {Object} Route analytics data
 */
export const getRouteAnalytics = (origin, destination) => {
  // Simplified route analytics - in real implementation, this would come from analytics data
  const route = `${origin}-${destination}`;
  
  const routeData = {
    'BOM-DXB': { rank: 1, demand: 'very_high', ratio: '30:70', avg_booking: 25 },
    'DEL-LHR': { rank: 2, demand: 'high', ratio: '50:50', avg_booking: 45 },
    'BOM-LHR': { rank: 3, demand: 'high', ratio: '40:60', avg_booking: 35 },
    'DEL-DXB': { rank: 4, demand: 'high', ratio: '35:65', avg_booking: 30 },
    'BOM-SIN': { rank: 5, demand: 'medium', ratio: '25:75', avg_booking: 20 },
    'DEL-SIN': { rank: 6, demand: 'medium', ratio: '30:70', avg_booking: 25 },
    'BOM-BKK': { rank: 7, demand: 'medium', ratio: '20:80', avg_booking: 15 },
    'DEL-BKK': { rank: 8, demand: 'medium', ratio: '25:75', avg_booking: 18 },
    'BOM-CMB': { rank: 9, demand: 'high', ratio: '15:85', avg_booking: 10 },
    'DEL-CMB': { rank: 10, demand: 'medium', ratio: '20:80', avg_booking: 12 }
  };

  const data = routeData[route] || { rank: 99, demand: 'low', ratio: '50:50', avg_booking: 30 };
  
  return {
    route_popularity_rank: data.rank,
    seasonal_demand: data.demand,
    business_leisure_ratio: data.ratio,
    avg_advance_booking: data.avg_booking,
    peak_travel_months: ['November', 'December', 'January', 'March', 'April']
  };
};

/**
 * Calculate revenue analytics
 * @param {Array} flights - Array of flight objects
 * @param {number} passengerCount - Number of passengers
 * @returns {Object} Revenue analytics
 */
export const calculateRevenueAnalytics = (flights, passengerCount) => {
  if (!flights || flights.length === 0) {
    return {
      potential_revenue: 0,
      avg_revenue_per_user: 0,
      booking_probability_score: 0,
      estimated_conversion_value: 0,
      revenue_bucket: 'low_value'
    };
  }

  const totalRevenue = flights.reduce((sum, flight) => {
    return sum + (flight.price?.amount || 0) * passengerCount;
  }, 0);

  const avgRevenue = totalRevenue / flights.length;
  const bookingProbability = Math.min(0.9, Math.max(0.1, 1 - (flights.length - 1) * 0.1));
  const conversionValue = totalRevenue * bookingProbability;

  let revenueBucket = 'low_value';
  if (totalRevenue > 100000) revenueBucket = 'high_value';
  else if (totalRevenue > 50000) revenueBucket = 'medium_value';

  return {
    potential_revenue: totalRevenue,
    avg_revenue_per_user: avgRevenue,
    booking_probability_score: bookingProbability,
    estimated_conversion_value: conversionValue,
    revenue_bucket: revenueBucket
  };
};

/**
 * Get user preferences (simplified)
 * @param {Object} user - User object
 * @param {Object} searchHistory - Search history
 * @returns {Object} User preferences
 */
export const getUserPreferences = (user, searchHistory = {}) => {
  return {
    preferred_airlines: user?.preferredAirlines || ['TL Airways'],
    preferred_cabin_class: user?.preferredCabinClass || 'economy',
    price_sensitivity: user?.priceSensitivity || 'medium',
    loyalty_status: user?.loyaltyTier || 'none',
    frequent_routes: user?.frequentRoutes || [],
    booking_window_days: searchHistory.avgBookingWindow || 30,
    previous_searches: searchHistory.totalSearches || 0,
    session_search_count: searchHistory.sessionSearches || 1
  };
};
