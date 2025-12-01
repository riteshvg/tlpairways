/**
 * Email Service using Brevo (SendinBlue) API
 * Handles sending transactional emails for TLP Airways
 */

const brevo = require('@getbrevo/brevo');
const { generateBookingConfirmationEmail, generateBookingConfirmationEmailText } = require('./emailTemplates');

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

    // Initialize Brevo client
    const apiInstance = getBrevoClient();

    // Generate email content
    const htmlContent = generateBookingConfirmationEmail(bookingData);
    const textContent = generateBookingConfirmationEmailText(bookingData);

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

    console.log('✅ Booking confirmation email sent successfully:', {
      messageId: result.messageId,
      to: bookingData.email,
      bookingId: bookingData.bookingId
    });

    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    
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

  return {
    configured: isConfigured,
    hasApiKey,
    hasSenderEmail,
    senderEmail: process.env.SENDER_EMAIL || 'Not configured',
    senderName: process.env.SENDER_NAME || 'TLP Airways',
    message: isConfigured 
      ? 'Email service is configured and ready' 
      : 'Email service is not fully configured. Please set BREVO_API_KEY and SENDER_EMAIL'
  };
}

module.exports = {
  sendBookingConfirmationEmail,
  getEmailServiceStatus
};

