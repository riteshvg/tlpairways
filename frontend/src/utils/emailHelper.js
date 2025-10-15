/**
 * Email Helper Utility
 * Functions to send emails from the frontend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Send booking confirmation email
 * @param {Object} bookingData - Booking details
 * @returns {Promise<Object>} - API response
 */
export const sendBookingConfirmationEmail = async (bookingData) => {
  try {
    const {
      email,
      pnr,
      passengerName,
      selectedFlights,
      travellerDetails,
      totalPrice,
      currency,
      selectedServices
    } = bookingData;

    // Format flight data for email
    const flights = {
      onward: selectedFlights.onward ? {
        flightNumber: selectedFlights.onward.flightNumber,
        origin: selectedFlights.onward.origin,
        destination: selectedFlights.onward.destination,
        departureTime: selectedFlights.onward.departureTime,
        arrivalTime: selectedFlights.onward.arrivalTime,
        duration: selectedFlights.onward.duration,
        cabinClass: selectedFlights.onward.cabinClass
      } : null,
      return: selectedFlights.return ? {
        flightNumber: selectedFlights.return.flightNumber,
        origin: selectedFlights.return.origin,
        destination: selectedFlights.return.destination,
        departureTime: selectedFlights.return.departureTime,
        arrivalTime: selectedFlights.return.arrivalTime,
        duration: selectedFlights.return.duration,
        cabinClass: selectedFlights.return.cabinClass
      } : null
    };

    // Format ancillary services
    const ancillaryServices = selectedServices ? Object.entries(selectedServices)
      .filter(([key, value]) => value && value.selected)
      .map(([key, value]) => ({
        name: value.name || key,
        price: value.price || 0
      })) : [];

    const payload = {
      email,
      pnr,
      passengerName,
      flights,
      passengers: travellerDetails || [],
      totalAmount: totalPrice || 0,
      currency: currency || 'INR',
      ancillaryServices,
      bookingDate: new Date().toISOString()
    };

    const response = await fetch(`${API_BASE_URL}/email/booking-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Booking confirmation email sent successfully');
      return {
        success: true,
        message: 'Email sent successfully',
        data: result
      };
    } else {
      console.error('❌ Failed to send booking confirmation email:', result.error);
      return {
        success: false,
        error: result.error || 'Failed to send email'
      };
    }

  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
};

/**
 * Send payment receipt email
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} - API response
 */
export const sendPaymentReceiptEmail = async (paymentData) => {
  try {
    const {
      email,
      pnr,
      transactionId,
      amount,
      currency,
      paymentMethod
    } = paymentData;

    const payload = {
      email,
      pnr,
      transactionId,
      amount,
      currency: currency || 'INR',
      paymentMethod: paymentMethod || 'Card',
      paymentDate: new Date().toISOString()
    };

    const response = await fetch(`${API_BASE_URL}/email/payment-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Payment receipt email sent successfully');
      return {
        success: true,
        message: 'Email sent successfully',
        data: result
      };
    } else {
      console.error('❌ Failed to send payment receipt email:', result.error);
      return {
        success: false,
        error: result.error || 'Failed to send email'
      };
    }

  } catch (error) {
    console.error('❌ Error sending payment receipt email:', error);
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
};

/**
 * Test email configuration
 * @param {string} email - Test email address
 * @returns {Promise<Object>} - API response
 */
export const testEmailConfig = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/email/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('❌ Error testing email config:', error);
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
};

/**
 * Check email service status
 * @returns {Promise<Object>} - Service status
 */
export const checkEmailServiceStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/email/status`);
    const result = await response.json();
    return result;

  } catch (error) {
    console.error('❌ Error checking email service status:', error);
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
};

export default {
  sendBookingConfirmationEmail,
  sendPaymentReceiptEmail,
  testEmailConfig,
  checkEmailServiceStatus
};

