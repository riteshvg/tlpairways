const express = require('express');
const router = express.Router();
const { sendBookingConfirmationEmail, getEmailServiceStatus } = require('../services/emailService');

/**
 * POST /api/email/send-booking-confirmation
 * Send booking confirmation email with comprehensive booking data
 * 
 * Body: See complete data structure in documentation/EMAIL_INTEGRATION_GUIDE.md
 */
router.post('/send-booking-confirmation', async (req, res) => {
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

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address format'
      });
    }

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
        messageId: result.messageId
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

module.exports = router;

