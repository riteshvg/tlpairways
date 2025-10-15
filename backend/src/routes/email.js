const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

/**
 * Email API Routes
 * Handles all email-related endpoints
 */

/**
 * POST /api/email/booking-confirmation
 * Send booking confirmation email
 */
router.post('/booking-confirmation', async (req, res) => {
  try {
    const {
      email,
      pnr,
      passengerName,
      flights,
      passengers,
      totalAmount,
      currency,
      ancillaryServices,
      bookingDate
    } = req.body;

    // Validate required fields
    if (!email || !pnr || !passengerName || !flights) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, pnr, passengerName, flights'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    const result = await emailService.sendBookingConfirmation({
      email,
      pnr,
      passengerName,
      flights,
      passengers: passengers || [],
      totalAmount: totalAmount || 0,
      currency: currency || 'INR',
      ancillaryServices: ancillaryServices || [],
      bookingDate: bookingDate || new Date()
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Booking confirmation email sent successfully',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to send email',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Error in booking confirmation endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * POST /api/email/payment-receipt
 * Send payment receipt email
 */
router.post('/payment-receipt', async (req, res) => {
  try {
    const {
      email,
      pnr,
      transactionId,
      amount,
      currency,
      paymentMethod,
      paymentDate
    } = req.body;

    // Validate required fields
    if (!email || !pnr || !transactionId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, pnr, transactionId, amount'
      });
    }

    const result = await emailService.sendPaymentReceipt({
      email,
      pnr,
      transactionId,
      amount,
      currency: currency || 'INR',
      paymentMethod: paymentMethod || 'Card',
      paymentDate: paymentDate || new Date()
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Payment receipt email sent successfully',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to send email',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Error in payment receipt endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * POST /api/email/test
 * Test email configuration
 */
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    const result = await emailService.testEmailConfig(email);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to send test email',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Error in test email endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * GET /api/email/status
 * Check email service status
 */
router.get('/status', (req, res) => {
  const config = {
    service: process.env.EMAIL_SERVICE || 'Not configured',
    from: process.env.EMAIL_FROM || 'Not configured',
    user: process.env.EMAIL_USER ? '***' + process.env.EMAIL_USER.slice(-10) : 'Not configured',
    sendgrid: process.env.SENDGRID_API_KEY ? 'Configured' : 'Not configured',
    aws: process.env.AWS_ACCESS_KEY_ID ? 'Configured' : 'Not configured'
  };

  res.status(200).json({
    success: true,
    message: 'Email service is running',
    configuration: config
  });
});

module.exports = router;

