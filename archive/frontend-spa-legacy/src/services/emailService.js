/**
 * Email Service
 * Handles sending booking confirmation emails via backend API
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
 * @returns {Promise<Object>} Response from API
 */
export const sendBookingConfirmationEmail = async (bookingData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/email/send-booking-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }

    return {
      success: true,
      messageId: data.messageId,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
};

/**
 * Check email service status
 * @returns {Promise<Object>} Service status
 */
export const checkEmailStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/email/status`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Email status check error:', error);
    return {
      configured: false,
      message: error.message || 'Failed to check email service status'
    };
  }
};

export default {
  sendBookingConfirmationEmail,
  checkEmailStatus
};

