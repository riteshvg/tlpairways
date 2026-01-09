/**
 * Flight Duration Calculator with Timezone Support
 * 
 * Calculates realistic flight durations based on:
 * - Distance (Haversine formula)
 * - Aircraft type and cruising speed
 * - Taxi time, takeoff, landing
 * - Timezone differences
 */

// Airport timezone database (Indian airports + major international)
const AIRPORT_TIMEZONES = {
  // Indian airports (IST - UTC+5:30)
  'DEL': 'Asia/Kolkata',
  'BOM': 'Asia/Kolkata',
  'BLR': 'Asia/Kolkata',
  'MAA': 'Asia/Kolkata',
  'CCU': 'Asia/Kolkata',
  'HYD': 'Asia/Kolkata',
  'AMD': 'Asia/Kolkata',
  'COK': 'Asia/Kolkata',
  'GOI': 'Asia/Kolkata',
  'PNQ': 'Asia/Kolkata',
  'JAI': 'Asia/Kolkata',
  'LKO': 'Asia/Kolkata',
  'IXC': 'Asia/Kolkata',
  'GAU': 'Asia/Kolkata',
  'IXB': 'Asia/Kolkata',
  'PAT': 'Asia/Kolkata',
  'RPR': 'Asia/Kolkata',
  'NAG': 'Asia/Kolkata',
  'BBI': 'Asia/Kolkata',
  'TRV': 'Asia/Kolkata',
  'VNS': 'Asia/Kolkata',
  'IXA': 'Asia/Kolkata',
  'IXJ': 'Asia/Kolkata',
  'IXZ': 'Asia/Kolkata',
  'ATQ': 'Asia/Kolkata',
  'SXR': 'Asia/Kolkata',
  'IXL': 'Asia/Kolkata',
  'IXU': 'Asia/Kolkata',
  'IXR': 'Asia/Kolkata',
  
  // International
  'DXB': 'Asia/Dubai',
  'DOH': 'Asia/Qatar',
  'AUH': 'Asia/Dubai',
  'SIN': 'Asia/Singapore',
  'KUL': 'Asia/Kuala_Lumpur',
  'BKK': 'Asia/Bangkok',
  'HKG': 'Asia/Hong_Kong',
  'ICN': 'Asia/Seoul',
  'NRT': 'Asia/Tokyo',
  'HND': 'Asia/Tokyo',
  'LHR': 'Europe/London',
  'CDG': 'Europe/Paris',
  'FRA': 'Europe/Berlin',
  'AMS': 'Europe/Amsterdam',
  'JFK': 'America/New_York',
  'EWR': 'America/New_York',
  'LAX': 'America/Los_Angeles',
  'SFO': 'America/Los_Angeles',
  'ORD': 'America/Chicago',
  'SYD': 'Australia/Sydney',
  'MEL': 'Australia/Melbourne',
};

/**
 * Calculate realistic flight duration based on distance and aircraft type
 * @param {number} distance - Distance in kilometers
 * @param {string} aircraftType - Type of aircraft (optional)
 * @returns {object} Duration in hours and minutes, plus formatted string
 */
export const calculateRealisticDuration = (distance, aircraftType = 'narrow-body') => {
  // Realistic cruising speeds by aircraft type
  const CRUISING_SPEEDS = {
    'narrow-body': 850,    // Boeing 737, A320 - ~850 km/h
    'wide-body': 900,      // Boeing 777, A330 - ~900 km/h
    'regional': 600,       // ATR, small jets - ~600 km/h
    'long-haul': 920,      // Boeing 787, A350 - ~920 km/h
  };

  // Ground operations and overhead
  const TAXI_TIME = 15;          // minutes (taxi, takeoff, landing)
  const CLIMB_DESCENT = 15;      // minutes (climb to cruise, descend)
  const BUFFER = 5;              // minutes (buffer/contingency)
  
  // Determine aircraft based on distance if not specified
  let aircraft = aircraftType;
  if (aircraftType === 'auto') {
    if (distance > 4000) aircraft = 'long-haul';
    else if (distance > 2000) aircraft = 'wide-body';
    else if (distance > 500) aircraft = 'narrow-body';
    else aircraft = 'regional';
  }
  
  const cruiseSpeed = CRUISING_SPEEDS[aircraft] || 850;
  
  // Calculate flight time
  const cruiseTimeHours = distance / cruiseSpeed;
  const cruiseTimeMinutes = cruiseTimeHours * 60;
  
  // Total time including ground operations
  const totalMinutes = Math.round(cruiseTimeMinutes + TAXI_TIME + CLIMB_DESCENT + BUFFER);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return {
    hours,
    minutes,
    totalMinutes,
    formatted: `${hours}h ${minutes}m`
  };
};

/**
 * Calculate arrival time considering timezone differences
 * @param {string} departureTime - ISO format departure time
 * @param {number} durationMinutes - Flight duration in minutes
 * @param {string} originTimezone - Origin airport timezone (IANA format)
 * @param {string} destTimezone - Destination airport timezone (IANA format)
 * @returns {string} Arrival time in ISO format
 */
export const calculateArrivalTime = (departureTime, durationMinutes, originTimezone, destTimezone) => {
  try {
    const departure = new Date(departureTime);
    
    // Add flight duration to departure time
    const arrivalUTC = new Date(departure.getTime() + (durationMinutes * 60 * 1000));
    
    return arrivalUTC.toISOString();
  } catch (error) {
    console.error('Error calculating arrival time:', error);
    // Fallback: simple addition
    const departure = new Date(departureTime);
    const arrival = new Date(departure.getTime() + (durationMinutes * 60 * 1000));
    return arrival.toISOString();
  }
};

/**
 * Get timezone for an airport code
 * @param {string} iataCode - Airport IATA code
 * @returns {string} IANA timezone string
 */
export const getAirportTimezone = (iataCode) => {
  return AIRPORT_TIMEZONES[iataCode] || 'Asia/Kolkata'; // Default to IST
};

/**
 * Calculate flight duration accounting for timezone display
 * This is what passengers see - actual time difference including timezone
 * @param {string} departureTime - ISO departure time
 * @param {string} arrivalTime - ISO arrival time
 * @param {string} originCode - Origin airport IATA code
 * @param {string} destCode - Destination airport IATA code
 * @returns {string} Duration formatted as "Xh Ym"
 */
export const getDisplayDuration = (departureTime, arrivalTime, originCode, destCode) => {
  try {
    const dept = new Date(departureTime);
    const arr = new Date(arrivalTime);
    
    // Calculate actual flight duration (what passenger experiences)
    const durationMs = arr - dept;
    const totalMinutes = Math.round(durationMs / (60 * 1000));
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error calculating display duration:', error);
    return '2h 0m';
  }
};

/**
 * Enhanced flight duration calculator with all features
 * @param {object} params - Parameters object
 * @returns {object} Complete flight timing information
 */
export const calculateFlightTiming = ({
  distance,
  originCode,
  destCode,
  departureTime,
  aircraftType = 'auto'
}) => {
  // Calculate realistic flight duration
  const duration = calculateRealisticDuration(distance, aircraftType);
  
  // Get timezones
  const originTz = getAirportTimezone(originCode);
  const destTz = getAirportTimezone(destCode);
  
  // Calculate arrival time
  const arrivalTime = calculateArrivalTime(
    departureTime,
    duration.totalMinutes,
    originTz,
    destTz
  );
  
  // Get display duration (what passenger sees)
  const displayDuration = getDisplayDuration(departureTime, arrivalTime, originCode, destCode);
  
  return {
    duration: duration.formatted,
    durationMinutes: duration.totalMinutes,
    departureTime,
    arrivalTime,
    displayDuration,
    timezones: {
      origin: originTz,
      destination: destTz
    }
  };
};

export default {
  calculateRealisticDuration,
  calculateArrivalTime,
  getAirportTimezone,
  getDisplayDuration,
  calculateFlightTiming,
};

