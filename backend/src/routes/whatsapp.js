const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * WhatsApp API Route
 * Sends WhatsApp messages using configured provider
 * Supports multiple providers: Twilio, Meta WhatsApp Business API, etc.
 */

/**
 * POST /api/whatsapp/send
 * Send WhatsApp message to a phone number
 * 
 * Body:
 * {
 *   to: "91XXXXXXXXXX", // Phone number with country code (no +)
 *   templateName: "booking_confirmation", // Template name
 *   templateParams: { // Template parameters
 *     pnr: "ABC123",
 *     passengerName: "John Doe",
 *     flightNumber: "TL101",
 *     origin: "DEL",
 *     destination: "BOM",
 *     departureDate: "2025-01-20",
 *     departureTime: "10:00",
 *     // ... other template parameters
 *   }
 * }
 */
router.post('/send', async (req, res) => {
  try {
    const { to, templateName, templateParams } = req.body;

    // Validate required fields
    if (!to || !templateName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to and templateName are required'
      });
    }

    // Validate phone number format (should be digits only, with country code)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(to.replace(/\+/g, ''))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Use country code + number (e.g., 919876543210)'
      });
    }

    // Get WhatsApp provider configuration
    const provider = process.env.WHATSAPP_PROVIDER || 'twilio'; // twilio, meta, custom
    const apiKey = process.env.WHATSAPP_API_KEY || process.env.TWILIO_AUTH_TOKEN;
    const accountSid = process.env.WHATSAPP_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
    const fromNumber = process.env.WHATSAPP_FROM_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER;
    const apiUrl = process.env.WHATSAPP_API_URL;

    let result;

    switch (provider.toLowerCase()) {
      case 'twilio':
        result = await sendViaTwilio(to, templateName, templateParams, {
          accountSid,
          apiKey,
          fromNumber
        });
        break;

      case 'meta':
      case 'whatsapp_business':
        result = await sendViaMeta(to, templateName, templateParams, {
          apiKey,
          apiUrl,
          phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID
        });
        break;

      case 'custom':
        result = await sendViaCustom(to, templateName, templateParams, {
          apiUrl,
          apiKey
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Unsupported WhatsApp provider: ${provider}. Supported: twilio, meta, custom`
        });
    }

    if (result.success) {
      res.json({
        success: true,
        message: 'WhatsApp message sent successfully',
        messageId: result.messageId,
        provider: provider
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send WhatsApp message'
      });
    }
  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Send WhatsApp message via Twilio
 */
async function sendViaTwilio(to, templateName, templateParams, config) {
  try {
    const { accountSid, apiKey, fromNumber } = config;

    if (!accountSid || !apiKey || !fromNumber) {
      throw new Error('Missing Twilio configuration. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER');
    }

    // Format phone number for Twilio (add whatsapp: prefix)
    const formattedTo = `whatsapp:+${to}`;
    const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

    // Build message body from template
    const messageBody = buildMessageFromTemplate(templateName, templateParams);

    // Twilio API endpoint
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const response = await axios.post(
      twilioUrl,
      new URLSearchParams({
        From: formattedFrom,
        To: formattedTo,
        Body: messageBody
      }),
      {
        auth: {
          username: accountSid,
          password: apiKey
        }
      }
    );

    return {
      success: true,
      messageId: response.data.sid
    };
  } catch (error) {
    console.error('Twilio WhatsApp error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Send WhatsApp message via Meta WhatsApp Business API
 */
async function sendViaMeta(to, templateName, templateParams, config) {
  try {
    const { apiKey, apiUrl, phoneNumberId } = config;

    if (!apiKey || !phoneNumberId) {
      throw new Error('Missing Meta configuration. Set WHATSAPP_API_KEY and WHATSAPP_PHONE_NUMBER_ID');
    }

    const metaUrl = apiUrl || `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    // Format phone number for Meta (with country code, no +)
    const formattedTo = to.startsWith('+') ? to.substring(1) : to;

    // Build template message for Meta
    const templateMessage = buildMetaTemplateMessage(templateName, templateParams);
    
    console.log('📤 Sending WhatsApp via Meta:', {
      to: formattedTo,
      templateName: templateName,
      templateParams: templateParams,
      templateMessage: templateMessage
    });

    const response = await axios.post(
      metaUrl,
      {
        messaging_product: 'whatsapp',
        to: formattedTo,
        type: 'template',
        template: templateMessage
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.messages[0]?.id
    };
  } catch (error) {
    console.error('Meta WhatsApp error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

/**
 * Send WhatsApp message via custom API
 */
async function sendViaCustom(to, templateName, templateParams, config) {
  try {
    const { apiUrl, apiKey } = config;

    if (!apiUrl) {
      throw new Error('Missing custom API URL. Set WHATSAPP_API_URL');
    }

    const response = await axios.post(
      apiUrl,
      {
        to,
        templateName,
        templateParams
      },
      {
        headers: {
          'Authorization': apiKey ? `Bearer ${apiKey}` : undefined,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.messageId || response.data.id
    };
  } catch (error) {
    console.error('Custom WhatsApp API error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
}

/**
 * Build message body from template name and parameters
 * This is a simple template engine - you can enhance this based on your needs
 */
function buildMessageFromTemplate(templateName, params = {}) {
  // Default booking confirmation template
  const templates = {
    booking_confirmation: `🎉 Booking Confirmed!

PNR: ${params.pnr || 'N/A'}
Passenger: ${params.passengerName || 'N/A'}

Flight Details:
${params.flightNumber ? `Flight: ${params.flightNumber}` : ''}
${params.origin && params.destination ? `Route: ${params.origin} → ${params.destination}` : ''}
${params.departureDate ? `Date: ${params.departureDate}` : ''}
${params.departureTime ? `Time: ${params.departureTime}` : ''}

${params.totalAmount ? `Total Amount: ₹${params.totalAmount}` : ''}

Thank you for choosing TLP Airways!
Safe travels! ✈️`
  };

  // If template exists, use it; otherwise return a generic message
  if (templates[templateName]) {
    let message = templates[templateName];
    // Replace any remaining placeholders
    Object.keys(params).forEach(key => {
      message = message.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), params[key] || 'N/A');
    });
    return message;
  }

  // Fallback: build a generic message
  return `Hello! Your ${templateName} is confirmed. ${JSON.stringify(params)}`;
}

/**
 * Build Meta WhatsApp Business API template message
 * Meta requires approved templates, so this uses the template name directly
 */
function buildMetaTemplateMessage(templateName, params = {}) {
  const components = [];
  
  // Handle HEADER component if template has header parameters
  // For "flight_booking_confirmation" template, header is static text, so no header params
  
  // Handle BODY component with parameters
  // Template expects: {{1}} = passenger name, {{2}} = ticket number (PNR), {{3}} = route, 
  // {{4}} = travel date, {{5}} = passengers count, {{6}} = email
  if (templateName === 'flight_booking_confirmation') {
    // Build route from origin and destination if not provided directly
    let route = params.route;
    if (!route && params.origin && params.destination) {
      route = `${params.origin}-${params.destination}`;
    }
    
    const bodyParams = [
      params.passengerName || 'Guest',
      params.ticketNumber || params.pnr || 'N/A',
      route || 'N/A',
      params.travelDate || params.departureDate || 'N/A',
      String(params.passengersCount || params.passengers || '1'),
      params.email || 'N/A'
    ];
    
    components.push({
      type: 'body',
      parameters: bodyParams.map(value => ({
        type: 'text',
        text: String(value)
      }))
    });
  } else {
    // Generic template handling - map all params in order
    if (Object.keys(params).length > 0) {
      const bodyParams = Object.values(params).slice(0, 10); // Meta allows max 10 parameters
      
      components.push({
        type: 'body',
        parameters: bodyParams.map(value => ({
          type: 'text',
          text: String(value)
        }))
      });
    }
  }

  return {
    name: templateName,
    language: {
      code: 'en'
    },
    components: components.length > 0 ? components : undefined
  };
}

/**
 * GET /api/whatsapp/status
 * Check WhatsApp service status
 */
router.get('/status', (req, res) => {
  const provider = process.env.WHATSAPP_PROVIDER || 'twilio';
  const hasConfig = !!(
    process.env.WHATSAPP_API_KEY || 
    process.env.TWILIO_AUTH_TOKEN ||
    process.env.WHATSAPP_API_URL
  );

  res.json({
    status: hasConfig ? 'configured' : 'not_configured',
    provider: provider,
    message: hasConfig 
      ? `WhatsApp service is configured for ${provider}` 
      : 'WhatsApp service is not configured. Please set environment variables.'
  });
});

module.exports = router;

