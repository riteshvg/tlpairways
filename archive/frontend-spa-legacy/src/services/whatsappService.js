/**
 * WhatsApp Service
 * Handles sending WhatsApp messages via backend API
 */

// Get API URL from environment variable or use default
// In production, REACT_APP_API_URL should be set to the Railway backend URL
// Example: REACT_APP_API_URL=https://tlpairways.up.railway.app/api
const API_BASE_URL = (() => {
  // If REACT_APP_API_URL is explicitly set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Development fallback
  return 'http://localhost:3001/api';
})();

/**
 * Send WhatsApp message with booking confirmation details
 * @param {Object} bookingData - Booking information
 * @param {string} bookingData.phoneNumber - Phone number with country code (e.g., "919876543210")
 * @param {string} bookingData.pnr - Booking PNR
 * @param {string} bookingData.passengerName - Primary passenger name
 * @param {Object} bookingData.flight - Flight details
 * @param {string} bookingData.flight.flightNumber - Flight number
 * @param {string} bookingData.flight.origin - Origin airport code
 * @param {string} bookingData.flight.destination - Destination airport code
 * @param {string} bookingData.flight.departureDate - Departure date
 * @param {string} bookingData.flight.departureTime - Departure time
 * @param {number} bookingData.totalAmount - Total booking amount
 * @param {Object} returnFlight - Return flight details (optional)
 * @returns {Promise<Object>} Response from API
 */
export const sendBookingConfirmationWhatsApp = async (bookingData, returnFlight = null) => {
  try {
    // Format phone number (remove + if present, ensure it's just digits)
    const phoneNumber = bookingData.phoneNumber.replace(/[+\s-]/g, '');

    // Build template parameters according to flight_booking_confirmation template structure:
    // {{1}} = passengerName
    // {{2}} = ticketNumber (PNR)
    // {{3}} = route (e.g., "DEL-MAA")
    // {{4}} = travelDate
    // {{5}} = passengers count
    // {{6}} = email
    
    // Build route string - handle multiple formats
    const getAirportCode = (value) => {
      if (!value) return null;
      // If it's a string, return it
      if (typeof value === 'string') return value.toUpperCase();
      // If it's an object, try to extract code
      if (typeof value === 'object') {
        return (value.iata_code || value.code || value.originCode || value.destinationCode || '').toUpperCase();
      }
      return null;
    };

    const origin = getAirportCode(bookingData.flight?.origin) || 
                   getAirportCode(bookingData.flight?.originCode) || 
                   'N/A';
    const destination = getAirportCode(bookingData.flight?.destination) || 
                       getAirportCode(bookingData.flight?.destinationCode) || 
                       'N/A';
    
    const route = `${origin}-${destination}`;
    
    console.log('🔍 WhatsApp Service Route Debug:', {
      flight: bookingData.flight,
      origin,
      destination,
      route
    });
    
    // Format travel date
    const travelDate = bookingData.flight?.departureDate || bookingData.flight?.departureTime || 'N/A';
    
    // Get passenger count
    const passengersCount = bookingData.passengersCount || 1;
    
    // Get email
    const email = bookingData.email || 'N/A';

    const templateParams = {
      passengerName: bookingData.passengerName || 'Guest',
      ticketNumber: bookingData.pnr || 'N/A',
      route: route,
      travelDate: travelDate,
      passengersCount: String(passengersCount),
      email: email
    };

    const response = await fetch(`${API_BASE_URL}/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        templateName: 'flight_booking_confirmation',
        templateParams: templateParams
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send WhatsApp message');
    }

    return {
      success: true,
      messageId: data.messageId,
      message: data.message
    };
  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message'
    };
  }
};

/**
 * Check WhatsApp service status
 * @returns {Promise<Object>} Service status
 */
export const checkWhatsAppStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/whatsapp/status`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ WhatsApp status check error:', error);
    return {
      status: 'error',
      message: error.message || 'Failed to check WhatsApp service status'
    };
  }
};

export default {
  sendBookingConfirmationWhatsApp,
  checkWhatsAppStatus
};

