/**
 * Validation Utilities
 * Comprehensive input validation for email service
 */

/**
 * Validate email address (RFC 5322 compliant)
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false; // RFC 5321 limit
  
  // RFC 5322 compliant regex (simplified)
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate booking ID (alphanumeric, 6-20 chars)
 * @param {string} bookingId - Booking ID to validate
 * @returns {boolean} True if valid
 */
function isValidBookingId(bookingId) {
  if (!bookingId || typeof bookingId !== 'string') return false;
  const regex = /^[A-Z0-9]{6,20}$/i; // Case insensitive
  return regex.test(bookingId);
}

/**
 * Validate phone number (E.164 or local format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove spaces, dashes, parentheses, plus sign
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Check if has 10-15 digits
  const regex = /^[1-9]\d{9,14}$/;
  return regex.test(cleaned);
}

/**
 * Validate amount (positive, reasonable range)
 * @param {number|string} amount - Amount to validate
 * @returns {boolean} True if valid
 */
function isValidAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000000;
}

/**
 * Validate passenger count (positive integer, max 9)
 * @param {number|string} count - Passenger count to validate
 * @returns {boolean} True if valid
 */
function isValidPassengerCount(count) {
  const num = parseInt(count, 10);
  return !isNaN(num) && num > 0 && num <= 9;
}

/**
 * Validate city code (3-letter IATA)
 * @param {string} code - City code to validate
 * @returns {boolean} True if valid
 */
function isValidCityCode(code) {
  if (!code || typeof code !== 'string') return false;
  const regex = /^[A-Z]{3}$/;
  return regex.test(code);
}

/**
 * Validate date is in future
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid future date
 */
function isValidFutureDate(dateString) {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    const now = new Date();
    return !isNaN(date.getTime()) && date > now;
  } catch {
    return false;
  }
}

/**
 * Validate time format (HH:MM)
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid
 */
function isValidTime(time) {
  if (!time || typeof time !== 'string') return false;
  const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
}

/**
 * Sanitize string (prevent XSS)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 500); // Max length
}

/**
 * Validate temperature range (-50°C to 60°C)
 * Handles Kelvin (>200), Fahrenheit (50-150), and Celsius (-50 to 60)
 * @param {number} temp - Temperature in any unit
 * @returns {boolean} True if valid
 */
function isValidTemperature(temp) {
  if (typeof temp !== 'number' || isNaN(temp)) return false;
  
  let celsius;
  // If temperature is > 200, assume Kelvin
  if (temp > 200) {
    celsius = temp - 273.15;
  }
  // If temperature is between 50-150, likely Fahrenheit
  else if (temp >= 50 && temp <= 150) {
    celsius = (temp - 32) * 5/9;
  }
  // Otherwise assume already in Celsius
  else {
    celsius = temp;
  }
  
  return celsius >= -50 && celsius <= 60;
}

/**
 * Validate humidity percentage (0-100)
 * @param {number} humidity - Humidity percentage
 * @returns {boolean} True if valid
 */
function isValidHumidity(humidity) {
  if (typeof humidity !== 'number' || isNaN(humidity)) return false;
  return humidity >= 0 && humidity <= 100;
}

/**
 * Validate city name (non-empty string)
 * @param {string} city - City name to validate
 * @returns {boolean} True if valid
 */
function isValidCity(city) {
  return city && typeof city === 'string' && city.trim().length > 0;
}

/**
 * Validate Unix timestamp
 * @param {number} timestamp - Unix timestamp
 * @returns {boolean} True if valid
 */
function isValidUnixTimestamp(timestamp) {
  if (typeof timestamp !== 'number' || isNaN(timestamp)) return false;
  // Check if timestamp is reasonable (between 2000 and 2100)
  const date = new Date(timestamp * 1000);
  return date.getFullYear() >= 2000 && date.getFullYear() <= 2100;
}

/**
 * Validate booking data structure
 * @param {Object} bookingData - Booking data to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateBookingData(bookingData) {
  const errors = [];

  // Required fields
  if (!bookingData.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(bookingData.email)) {
    errors.push('Invalid email format');
  }

  if (!bookingData.bookingId) {
    errors.push('Booking ID is required');
  } else if (!isValidBookingId(bookingData.bookingId)) {
    errors.push('Invalid booking ID format (must be 6-20 alphanumeric characters)');
  }

  if (!bookingData.passengerName) {
    errors.push('Passenger name is required');
  }

  if (!bookingData.toCity) {
    errors.push('Destination city is required');
  }

  // Optional but validated if provided
  if (bookingData.phone && !isValidPhoneNumber(bookingData.phone)) {
    errors.push('Invalid phone number format');
  }

  if (bookingData.totalAmount !== undefined && !isValidAmount(bookingData.totalAmount)) {
    errors.push('Invalid amount (must be positive and less than 1,000,000)');
  }

  if (bookingData.totalPassengers !== undefined && !isValidPassengerCount(bookingData.totalPassengers)) {
    errors.push('Invalid passenger count (must be 1-9)');
  }

  if (bookingData.from && !isValidCityCode(bookingData.from)) {
    errors.push('Invalid origin city code (must be 3-letter IATA code)');
  }

  if (bookingData.to && !isValidCityCode(bookingData.to)) {
    errors.push('Invalid destination city code (must be 3-letter IATA code)');
  }

  if (bookingData.travelDate && !isValidFutureDate(bookingData.travelDate)) {
    errors.push('Travel date must be in the future');
  }

  if (bookingData.departureTime && !isValidTime(bookingData.departureTime)) {
    errors.push('Invalid departure time format (must be HH:MM)');
  }

  if (bookingData.arrivalTime && !isValidTime(bookingData.arrivalTime)) {
    errors.push('Invalid arrival time format (must be HH:MM)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  isValidEmail,
  isValidBookingId,
  isValidPhoneNumber,
  isValidAmount,
  isValidPassengerCount,
  isValidCityCode,
  isValidFutureDate,
  isValidTime,
  sanitizeString,
  isValidTemperature,
  isValidHumidity,
  isValidCity,
  isValidUnixTimestamp,
  validateBookingData
};

