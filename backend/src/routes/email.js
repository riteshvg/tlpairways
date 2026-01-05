const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { sendBookingConfirmationEmail, getEmailServiceStatus } = require('../services/emailService');
const { validateBookingData: validateBookingDataUtil } = require('../utils/validators');
const { logValidationSummary } = require('../services/loggerService');

// Rate limiting: 10 requests per minute per IP
const emailLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // Max 10 requests
  message: {
    success: false,
    error: 'Too many email requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Validation middleware for booking data
 */
function validateBookingData(req, res, next) {
  const validationResult = validateBookingDataUtil(req.body);

  logValidationSummary(validationResult);

  if (!validationResult.valid) {
    return res.status(400).json({
      success: false,
      errors: validationResult.errors
    });
  }

  next();
}

/**
 * POST /api/email/send-booking-confirmation
 * Send booking confirmation email with comprehensive booking data and weather personalization
 * 
 * Body: See complete data structure in documentation/EMAIL_INTEGRATION_GUIDE.md
 * 
 * Rate Limited: 10 requests per minute per IP
 * Validated: All required fields and formats are validated
 */
router.post('/send-booking-confirmation',
  emailLimiter,           // Rate limiting
  validateBookingData,    // Validation middleware
  async (req, res) => {
    try {
      const {
        // Passenger Information
        passengerName,
        email,
        phone,

        // Booking Reference
        bookingId,
        pnr,
        bookingDate,
        bookingStatus,

        // Flight Details
        flightNumber,
        airline,
        aircraftType,

        // Route Information
        from,
        fromCity,
        fromAirport,
        fromTerminal,
        to,
        toCity,
        toAirport,
        toTerminal,
        route,

        // Timing
        travelDate,
        departureTime,
        arrivalTime,
        duration,

        // Trip Type & Return Flight
        tripType,
        returnFlight,

        // Passengers
        adults,
        children,
        infants,
        totalPassengers,
        passengers,

        // Class & Fare
        travelClass,
        fareType,

        // Pricing
        baseFare,
        taxes,
        totalAmount,
        currency,
        paymentMethod,
        paymentStatus,

        // Baggage
        cabinBaggage,
        checkinBaggage,

        // Check-in Information
        webCheckinOpens,
        reportingTime,
        gateClosingTime,

        // Links
        bookingUrl,
        checkinUrl,
        eTicketUrl,
        manageBookingUrl
      } = req.body;

      // Data is already validated by middleware
      // Prepare comprehensive booking data
      const bookingData = {
        // Passenger Information
        passengerName: passengerName || 'Guest',
        email: email,
        phone: phone || 'Not provided',

        // Booking Reference
        bookingId: bookingId,
        pnr: pnr || bookingId,
        bookingDate: bookingDate || new Date().toISOString(),
        bookingStatus: bookingStatus || 'Confirmed',

        // Flight Details
        flightNumber: flightNumber || 'N/A',
        airline: airline || 'TLP Airways',
        aircraftType: aircraftType || 'Boeing 737-800',

        // Route Information
        from: from || 'N/A',
        fromCity: fromCity || '',
        fromAirport: fromAirport || '',
        fromTerminal: fromTerminal || 'TBD',
        to: to || 'N/A',
        toCity: toCity || '',
        toAirport: toAirport || '',
        toTerminal: toTerminal || 'TBD',
        route: route || (from && to ? `${from}-${to}` : 'N/A'),

        // Timing
        travelDate: travelDate || 'N/A',
        departureTime: departureTime || '10:30',
        arrivalTime: arrivalTime || '12:45',
        duration: duration || null, // Will be calculated if not provided

        // Trip Type & Return Flight
        tripType: tripType || 'oneway',
        returnFlight: returnFlight || null,

        // Passengers
        adults: adults || 1,
        children: children || 0,
        infants: infants || 0,
        totalPassengers: totalPassengers || (adults || 1) + (children || 0) + (infants || 0),
        passengers: passengers || [],

        // Class & Fare
        travelClass: travelClass || 'Economy',
        fareType: fareType || 'Regular',

        // Pricing
        baseFare: baseFare || 0,
        taxes: taxes || 0,
        totalAmount: totalAmount || 0,
        currency: currency || 'INR',
        paymentMethod: paymentMethod || 'Credit Card',
        paymentStatus: paymentStatus || 'Paid',

        // Baggage
        cabinBaggage: cabinBaggage || '7 kg',
        checkinBaggage: checkinBaggage || '15 kg',

        // Check-in Information (will be calculated if not provided)
        webCheckinOpens: webCheckinOpens || null,
        reportingTime: reportingTime || null,
        gateClosingTime: gateClosingTime || null,

        // Links
        bookingUrl: bookingUrl || null,
        checkinUrl: checkinUrl || null,
        eTicketUrl: eTicketUrl || null,
        manageBookingUrl: manageBookingUrl || null
      };

      // Send email
      const result = await sendBookingConfirmationEmail(bookingData);

      if (result.success) {
        res.json({
          success: true,
          message: 'Booking confirmation email sent successfully',
          messageId: result.messageId,
          weatherIncluded: result.weatherIncluded || false
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || 'Failed to send email',
          details: result.details
        });
      }
    } catch (error) {
      console.error('❌ Email route error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

/**
 * GET /api/email/status
 * Check email service status
 */
router.get('/status', (req, res) => {
  try {
    const status = getEmailServiceStatus();
    res.json(status);
  } catch (error) {
    console.error('❌ Email status check error:', error);
    res.status(500).json({
      configured: false,
      error: error.message || 'Failed to check email service status'
    });
  }
});

/**
 * GET /api/email/settings
 * Get email settings
 */
router.get('/settings', (req, res) => {
  try {
    const { getAllSettings } = require('../services/settingsService');
    const settings = getAllSettings();
    res.json(settings);
  } catch (error) {
    console.error('❌ Error getting email settings:', error);
    res.status(500).json({
      error: error.message || 'Failed to get email settings'
    });
  }
});

/**
 * POST /api/email/settings
 * Update email settings
 * Body: { emailEnabled: boolean }
 */
router.post('/settings', (req, res) => {
  try {
    const { setEmailEnabled } = require('../services/settingsService');
    const { emailEnabled } = req.body;

    if (typeof emailEnabled !== 'boolean') {
      return res.status(400).json({
        error: 'emailEnabled must be a boolean value'
      });
    }

    const success = setEmailEnabled(emailEnabled);

    if (success) {
      const { getAllSettings } = require('../services/settingsService');
      const settings = getAllSettings();
      res.json({
        success: true,
        message: `Email sending ${emailEnabled ? 'enabled' : 'disabled'}`,
        settings
      });
    } else {
      // Settings couldn't be saved to file (common in production with ephemeral filesystem)
      const { getAllSettings } = require('../services/settingsService');
      const settings = getAllSettings();

      res.status(200).json({
        success: false,
        warning: 'Settings could not be persisted to disk',
        message: 'To persist this setting in production, set the EMAIL_ENABLED environment variable',
        settings,
        recommendation: {
          action: 'Set environment variable',
          variable: 'EMAIL_ENABLED',
          value: emailEnabled.toString(),
          note: 'Environment variables take precedence over file-based settings'
        }
      });
    }
  } catch (error) {
    console.error('❌ Error updating email settings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update email settings'
    });
  }
});

module.exports = router;

