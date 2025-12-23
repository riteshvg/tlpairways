/**
 * Email Service using Brevo (SendinBlue) API
 * Handles sending transactional emails for TLP Airways with weather personalization
 */

const brevo = require('@getbrevo/brevo');
const { generateBookingConfirmationEmail, generateBookingConfirmationEmailText } = require('./emailTemplates');
const { getWeatherForCity } = require('./weatherService');
const { sanitizeString } = require('../utils/validators');
const { logEmailSent, logEmailFailed } = require('./loggerService');
const { isEmailEnabled } = require('./settingsService');

// Initialize Brevo API client
function getBrevoClient() {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const apiInstance = new brevo.TransactionalEmailsApi();
  // Set API key using setApiKey method
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
  return apiInstance;
}

/**
 * Send booking confirmation email
 * @param {Object} bookingData - Booking information
 * @param {string} bookingData.passengerName - Passenger name
 * @param {string} bookingData.email - Recipient email
 * @param {string} bookingData.bookingId - Booking ID/PNR
 * @param {string} bookingData.route - Route (e.g., "DEL-BOM")
 * @param {string} bookingData.travelDate - Travel date (YYYY-MM-DD)
 * @param {string} bookingData.passengers - Passenger count (e.g., "2 Adults")
 * @param {string} bookingData.from - Origin city (optional)
 * @param {string} bookingData.to - Destination city (optional)
 * @param {string} bookingData.flightNumber - Flight number (optional)
 * @param {number} bookingData.adults - Number of adults (optional)
 * @param {number} bookingData.children - Number of children (optional)
 * @returns {Promise<Object>} Result with success status and message ID
 */
async function sendBookingConfirmationEmail(bookingData) {
  try {
    // Check if email sending is enabled (checks both settings file and env variable)
    const emailEnabledFlag = isEmailEnabled();

    if (!emailEnabledFlag) {
      console.log('📧 Email sending is disabled. Skipping email for:', bookingData.email);
      return {
        success: true,
        messageId: 'disabled-' + Date.now(),
        message: 'Email sending is disabled (test mode)',
        weatherIncluded: false,
        disabled: true
      };
    }

    // Validate required fields
    if (!bookingData.email) {
      throw new Error('Recipient email is required');
    }

    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    if (!process.env.SENDER_EMAIL) {
      throw new Error('SENDER_EMAIL is not configured');
    }

    // Sanitize all string inputs to prevent XSS
    const sanitizedData = {
      ...bookingData,
      passengerName: sanitizeString(bookingData.passengerName || ''),
      email: bookingData.email, // Email is validated separately
      bookingId: sanitizeString(bookingData.bookingId || ''),
      route: sanitizeString(bookingData.route || ''),
      fromCity: sanitizeString(bookingData.fromCity || ''),
      toCity: sanitizeString(bookingData.toCity || ''),
      flightNumber: sanitizeString(bookingData.flightNumber || ''),
      airline: sanitizeString(bookingData.airline || '')
    };

    // Fetch weather data for destination city (non-blocking)
    let weatherData = null;
    let weatherIncluded = false;

    // Normalize city name (handles airport codes, variations, etc.)
    const { normalizeCityName } = require('../utils/cityMapper');
    const cityForWeather = normalizeCityName(sanitizedData.toCity || sanitizedData.to || '');

    if (cityForWeather) {
      try {
        weatherData = await getWeatherForCity(cityForWeather);
        if (weatherData) {
          weatherIncluded = true;
          // Add weather data to booking data for template
          sanitizedData.weatherData = weatherData;
          sanitizedData.hasWeather = true;
        } else {
          // Log for debugging (only if city was provided)
          if (sanitizedData.toCity || sanitizedData.to) {
            console.log(`⚠️ Weather data not found for city: ${cityForWeather} (from: ${sanitizedData.toCity || sanitizedData.to})`);
          }
        }
      } catch (weatherError) {
        // Don't block email sending if weather fetch fails
        console.warn('⚠️ Weather fetch failed, sending email without weather:', weatherError.message);
      }
    }

    // Initialize Brevo client
    const apiInstance = getBrevoClient();

    // Generate email content (with weather if available)
    const htmlContent = generateBookingConfirmationEmail(sanitizedData);
    const textContent = generateBookingConfirmationEmailText(sanitizedData);

    // Prepare email data
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `Booking Confirmed - ${bookingData.bookingId || 'TLP Airways'}`;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.sender = {
      name: process.env.SENDER_NAME || 'TLP Airways',
      email: process.env.SENDER_EMAIL
    };
    sendSmtpEmail.to = [
      {
        email: bookingData.email,
        name: bookingData.passengerName || 'Guest'
      }
    ];

    // Optional: Add reply-to
    if (process.env.REPLY_TO_EMAIL) {
      sendSmtpEmail.replyTo = {
        email: process.env.REPLY_TO_EMAIL,
        name: process.env.SENDER_NAME || 'TLP Airways'
      };
    }

    // Send email via Brevo API
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    logEmailSent(sanitizedData.bookingId, sanitizedData.email, weatherIncluded);

    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully',
      weatherIncluded: weatherIncluded
    };
  } catch (error) {
    logEmailFailed(bookingData.bookingId || 'unknown', error);

    // Extract error message
    let errorMessage = 'Failed to send email';
    if (error.response) {
      errorMessage = error.response.body?.message || error.response.text || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
}

/**
 * Test email service configuration
 * @returns {Object} Service status
 */
function getEmailServiceStatus() {
  const hasApiKey = !!process.env.BREVO_API_KEY;
  const hasSenderEmail = !!process.env.SENDER_EMAIL;
  const isConfigured = hasApiKey && hasSenderEmail;
  const emailEnabledFlag = isEmailEnabled();

  return {
    configured: isConfigured,
    enabled: emailEnabledFlag,
    hasApiKey,
    hasSenderEmail,
    senderEmail: process.env.SENDER_EMAIL || 'Not configured',
    senderName: process.env.SENDER_NAME || 'TLP Airways',
    message: !emailEnabledFlag
      ? 'Email service is disabled (test mode)'
      : isConfigured
        ? 'Email service is configured and ready'
        : 'Email service is not fully configured. Please set BREVO_API_KEY and SENDER_EMAIL'
  };
}

module.exports = {
  sendBookingConfirmationEmail,
  getEmailServiceStatus
};

