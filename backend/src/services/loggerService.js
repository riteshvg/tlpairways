/**
 * Centralized Logging Service
 * Provides structured logging for email and weather operations
 */

/**
 * Log weather fetch attempt
 * @param {string} city - City name
 * @param {boolean} success - Whether fetch was successful
 * @param {Object} data - Weather data (if successful)
 */
function logWeatherFetch(city, success, data = null) {
  const timestamp = new Date().toISOString();
  if (success) {
    console.log(`[${timestamp}] ✅ Weather fetch SUCCESS: ${city}`, {
      temperature: data?.temperatureCelsius,
      condition: data?.weather,
      humidity: data?.humidity
    });
  } else {
    console.log(`[${timestamp}] ❌ Weather fetch FAILED: ${city}`);
  }
}

/**
 * Log validation error
 * @param {string} field - Field name
 * @param {*} value - Field value
 * @param {string} reason - Reason for validation failure
 */
function logValidationError(field, value, reason) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ⚠️ Validation Error: ${field}`, {
    value: typeof value === 'string' ? value.substring(0, 100) : value,
    reason: reason
  });
}

/**
 * Log email sent successfully
 * @param {string} bookingId - Booking ID
 * @param {string} email - Recipient email
 * @param {boolean} weatherIncluded - Whether weather was included
 */
function logEmailSent(bookingId, email, weatherIncluded) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📧 Email sent: ${bookingId}`, {
    to: email,
    weather: weatherIncluded ? '✅' : '❌'
  });
}

/**
 * Log email send failure
 * @param {string} bookingId - Booking ID
 * @param {Error} error - Error object
 */
function logEmailFailed(bookingId, error) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ Email failed: ${bookingId}`, {
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
}

/**
 * Log S3 error
 * @param {string} operation - S3 operation name
 * @param {string} city - City name
 * @param {Error} error - Error object
 */
function logS3Error(operation, city, error) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ S3 Error: ${operation}`, {
    city: city,
    error: error.message,
    code: error.code || error.name
  });
}

/**
 * Log cache hit/miss
 * @param {string} city - City name
 * @param {boolean} hit - Whether cache hit
 */
function logCache(city, hit) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${hit ? '💾' : '🔍'} Cache ${hit ? 'HIT' : 'MISS'}: ${city}`);
}

/**
 * Log validation summary
 * @param {Object} validationResult - Result from validateBookingData
 */
function logValidationSummary(validationResult) {
  const timestamp = new Date().toISOString();
  if (validationResult.valid) {
    console.log(`[${timestamp}] ✅ Validation passed`);
  } else {
    console.error(`[${timestamp}] ❌ Validation failed:`, {
      errors: validationResult.errors
    });
  }
}

module.exports = {
  logWeatherFetch,
  logValidationError,
  logEmailSent,
  logEmailFailed,
  logS3Error,
  logCache,
  logValidationSummary
};

