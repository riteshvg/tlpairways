# Brevo Transactional SMS & WhatsApp Setup Guide for TLP Airways

## ⚠️ CRITICAL: Free Tier Limitations & Pricing

**Brevo's free tier does NOT include free SMS or WhatsApp messaging:**

| Channel | Free Tier | Cost | Recommendation |
|---------|-----------|------|----------------|
| **Email** | ✅ FREE (300/day) | $0 | ✅ **Use this** (already configured) |
| **SMS** | ❌ Pay-per-use | ~$0.01-0.03/SMS | 💰 Buy credits if needed (~$5-15/month for testing) |
| **WhatsApp** | ❌ NOT available | $499/month + message costs | ❌ **Skip** or use Twilio instead |

### For TLP Airways - Recommended Approach:
1. ✅ **Email Only** (FREE) - Already working, sufficient for most use cases
2. 💰 **Add SMS** (Optional) - Buy 100-500 credits (~$5-15) for critical notifications only
3. ❌ **Skip WhatsApp** - Too expensive ($499/month) unless you have high volume

### Cost Example for 300 Bookings/Month:
- Email: **FREE**
- SMS: **~$3-10/month**
- WhatsApp (Brevo): **$499/month** ❌
- WhatsApp (Twilio alternative): **~$1.50-6/month** ✅

---

## Overview

This guide outlines the steps to enable transactional SMS and WhatsApp messaging for TLP Airways using Brevo (formerly SendinBlue). These channels will be used for sending booking confirmations, flight updates, and other transactional notifications.

---

## Part 1: WhatsApp Setup

### Prerequisites
- Active Brevo account
- Facebook Business account
- WhatsApp Business account

### Step 1: Enable WhatsApp in Brevo

1. **Log in to Brevo Dashboard**
   - Go to https://app.brevo.com/

2. **Access Apps & Integrations**
   - Click on your profile/account name in the top navigation
   - Select **"Add more apps"** or **"Apps and Integrations"**

3. **Activate WhatsApp Feature**
   - Scroll down to find **WhatsApp**
   - Click **"Enable"** or **"Activate"**
   - WhatsApp will now appear in your Brevo dashboard

### Step 2: Set Up WhatsApp Business Account

1. **Create Facebook Business Account** (if you don't have one)
   - Go to https://business.facebook.com/
   - Click **"Create Account"**
   - Follow the setup wizard

2. **Create WhatsApp Business Account**
   - Follow Brevo's guide: [Getting started with WhatsApp campaigns in Brevo](https://help.brevo.com/hc/en-us/articles/4417084910866-Part-1-Link-your-WhatsApp-Business-account-to-Sendinblue)
   - Link your WhatsApp Business account to Brevo

3. **Verify Your Business**
   - Complete Facebook Business verification
   - This may take a few days

### Step 3: Create WhatsApp Message Templates

WhatsApp requires pre-approved templates for the first message to a user.

1. **Navigate to WhatsApp Campaigns**
   - In Brevo dashboard, go to **Campaigns** → **WhatsApp**

2. **Create a Template**
   - Click **"Create a campaign"** in the top right
   - Design your message template (e.g., booking confirmation)
   - Submit for approval (usually takes 24-48 hours)

3. **Get Template ID**
   - Once approved, use the [WhatsApp template list API](https://developers.brevo.com/api-reference/whatsapp/get-whats-app-campaigns) to fetch the `templateId`
   - Or find it in the Brevo dashboard under the template details

### Step 4: Send WhatsApp Messages via API

**Endpoint**: `POST https://api.brevo.com/v3/whatsapp/sendMessage`

**Example Request**:
```bash
curl --request POST \
  --url https://api.brevo.com/v3/whatsapp/sendMessage \
  --header 'accept: application/json' \
  --header 'api-key: YOUR_BREVO_API_KEY' \
  --header 'content-type: application/json' \
  --data '{
    "contactNumbers": ["919876543210"],
    "templateId": 465118589032810,
    "senderNumber": "917878172050"
  }'
```

**Request Parameters**:
- `contactNumbers`: Array of phone numbers (with country code, no spaces/characters)
  - Example: `"919876543210"` for India
- `templateId`: ID of your approved WhatsApp template
- `senderNumber`: Your WhatsApp Business number

**Response**:
- `201`: Message sent successfully
- `400`: Bad request (invalid parameters)

---

## Part 2: Transactional SMS Setup

### Prerequisites
- Active Brevo account
- API key from Brevo
- For US/Canada: Toll-free number registration required

### Step 1: Generate API Key

1. **Access API Settings**
   - Log in to Brevo dashboard
   - Go to **Settings** → **SMTP & API**

2. **Create API Key**
   - Click **"Generate a new API key"**
   - Name it (e.g., "TLP Airways Production")
   - Copy and save the API key securely
   - **Important**: You won't be able to see it again!

### Step 2: Understand SMS Types

**Transactional SMS**:
- Non-promotional messages
- Triggered by user actions (bookings, confirmations)
- No opt-out required
- Can be sent 24/7

**Marketing SMS**:
- Promotional content
- Requires opt-in
- Must include unsubscribe option `[STOP CODE]`
- Time restrictions apply (e.g., France: no SMS 10 PM - 8 AM)

### Step 3: Compliance Requirements

**For US/Canada Recipients**:
1. Register for a toll-free number
2. Follow local SMS marketing regulations
3. Comply with TCPA (Telephone Consumer Protection Act)

**For France**:
- No SMS between 10 PM and 8 AM
- No SMS on Sundays
- No SMS on French public holidays

**For India**:
- Register with DLT (Distributed Ledger Technology)
- Get sender ID approved
- Use approved templates

### Step 4: Send Transactional SMS via API

**Endpoint**: `POST https://api.brevo.com/v3/transactionalSMS/sms`

**Example Request**:
```bash
curl --request POST \
  --url https://api.brevo.com/v3/transactionalSMS/sms \
  --header 'accept: application/json' \
  --header 'api-key: YOUR_BREVO_API_KEY' \
  --header 'content-type: application/json' \
  --data '{
    "sender": "TLPAir",
    "recipient": "919876543210",
    "content": "Your booking PNR ABC123 is confirmed. Flight TL101 on 15 Jan 2026. Happy journey!",
    "type": "transactional"
  }'
```

**Request Parameters**:
- `sender`: Sender name or number (max 11 characters for alphanumeric)
- `recipient`: Mobile number with country code (no spaces/characters)
- `content`: Message text (max 160 characters for single SMS)
- `type`: `"transactional"` or `"marketing"`
- `webhookUrl` (optional): URL to receive delivery status

**Using Templates**:
```bash
curl --request POST \
  --url https://api.brevo.com/v3/transactionalSMS/sms \
  --header 'accept: application/json' \
  --header 'api-key: YOUR_BREVO_API_KEY' \
  --header 'content-type: application/json' \
  --data '{
    "sender": "TLPAir",
    "recipient": "919876543210",
    "templateId": 12345,
    "params": {
      "PNR": "ABC123",
      "FLIGHT": "TL101",
      "DATE": "15 Jan 2026"
    }
  }'
```

---

## Part 3: Integration with TLP Airways

### Current Setup

You already have Brevo configured for email:
```bash
BREVO_API_KEY=your-brevo-api-key-here
```

### Implementation Steps

#### 1. Create SMS Service

**File**: `backend/src/services/smsService.js`

```javascript
const brevo = require('@getbrevo/brevo');

// Initialize Brevo SMS API client
function getBrevoSMSClient() {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const apiInstance = new brevo.TransactionalSMSApi();
  apiInstance.setApiKey(
    brevo.TransactionalSMSApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );
  return apiInstance;
}

async function sendBookingConfirmationSMS(bookingData) {
  try {
    const apiInstance = getBrevoSMSClient();

    const sendTransacSms = new brevo.SendTransacSms();
    sendTransacSms.sender = process.env.SMS_SENDER_NAME || 'TLPAir';
    sendTransacSms.recipient = bookingData.phone;
    sendTransacSms.content = `Your booking ${bookingData.pnr} is confirmed. Flight ${bookingData.flightNumber} on ${bookingData.travelDate}. Happy journey!`;
    sendTransacSms.type = 'transactional';

    const result = await apiInstance.sendTransacSms(sendTransacSms);

    console.log('✅ SMS sent successfully:', result);
    return {
      success: true,
      messageId: result.messageId,
      message: 'SMS sent successfully'
    };
  } catch (error) {
    console.error('❌ SMS send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendBookingConfirmationSMS
};
```

#### 2. Create WhatsApp Service

**File**: `backend/src/services/whatsappService.js`

```javascript
const axios = require('axios');

async function sendBookingConfirmationWhatsApp(bookingData) {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    if (!process.env.WHATSAPP_TEMPLATE_ID) {
      throw new Error('WHATSAPP_TEMPLATE_ID is not configured');
    }

    const response = await axios.post(
      'https://api.brevo.com/v3/whatsapp/sendMessage',
      {
        contactNumbers: [bookingData.phone],
        templateId: parseInt(process.env.WHATSAPP_TEMPLATE_ID),
        senderNumber: process.env.WHATSAPP_SENDER_NUMBER,
        // Template parameters if your template has variables
        params: {
          PNR: bookingData.pnr,
          FLIGHT: bookingData.flightNumber,
          DATE: bookingData.travelDate
        }
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsApp sent successfully:', response.data);
    return {
      success: true,
      messageId: response.data.messageId,
      message: 'WhatsApp message sent successfully'
    };
  } catch (error) {
    console.error('❌ WhatsApp send error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

module.exports = {
  sendBookingConfirmationWhatsApp
};
```

#### 3. Update Environment Variables

Add to `backend/.env`:

```bash
# SMS Configuration
SMS_SENDER_NAME=TLPAir
SMS_ENABLED=true

# WhatsApp Configuration
WHATSAPP_ENABLED=true
WHATSAPP_TEMPLATE_ID=465118589032810  # Replace with your template ID
WHATSAPP_SENDER_NUMBER=917878172050   # Replace with your WhatsApp Business number
```

#### 4. Update Booking Confirmation Flow

**File**: `backend/src/routes/email.js`

```javascript
const { sendBookingConfirmationEmail } = require('../services/emailService');
const { sendBookingConfirmationSMS } = require('../services/smsService');
const { sendBookingConfirmationWhatsApp } = require('../services/whatsappService');

router.post('/send-booking-confirmation', async (req, res) => {
  try {
    const bookingData = req.body;

    // Send email
    const emailResult = await sendBookingConfirmationEmail(bookingData);

    // Send SMS if enabled
    let smsResult = { success: false, disabled: true };
    if (process.env.SMS_ENABLED === 'true') {
      smsResult = await sendBookingConfirmationSMS(bookingData);
    }

    // Send WhatsApp if enabled
    let whatsappResult = { success: false, disabled: true };
    if (process.env.WHATSAPP_ENABLED === 'true') {
      whatsappResult = await sendBookingConfirmationWhatsApp(bookingData);
    }

    res.json({
      success: true,
      email: emailResult,
      sms: smsResult,
      whatsapp: whatsappResult
    });
  } catch (error) {
    console.error('❌ Booking confirmation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

## Part 4: Testing

### Test SMS

```bash
curl --request POST \
  --url http://localhost:5001/api/sms/test \
  --header 'content-type: application/json' \
  --data '{
    "phone": "919876543210",
    "pnr": "ABC123",
    "flightNumber": "TL101",
    "travelDate": "15 Jan 2026"
  }'
```

### Test WhatsApp

```bash
curl --request POST \
  --url http://localhost:5001/api/whatsapp/test \
  --header 'content-type: application/json' \
  --data '{
    "phone": "919876543210",
    "pnr": "ABC123",
    "flightNumber": "TL101",
    "travelDate": "15 Jan 2026"
  }'
```

---

## Part 5: Best Practices

### 1. Phone Number Formatting
- Always include country code
- Remove spaces, dashes, parentheses
- Example: `919876543210` (not `+91 98765 43210`)

### 2. Message Content
- Keep SMS under 160 characters
- Use clear, concise language
- Include essential info: PNR, flight number, date

### 3. Error Handling
- Log all send attempts
- Retry failed messages
- Alert on repeated failures

### 4. Cost Management
- SMS and WhatsApp have per-message costs
- Monitor usage in Brevo dashboard
- Set up billing alerts

### 5. Compliance
- Get user consent before sending
- Provide opt-out mechanism
- Respect time zones and quiet hours
- Follow local regulations (GDPR, TCPA, etc.)

---

## Part 6: Pricing (Approximate)

### SMS Pricing
- India: ~₹0.15 - ₹0.25 per SMS
- US/Canada: ~$0.01 - $0.02 per SMS
- Europe: ~€0.05 - €0.10 per SMS

### WhatsApp Pricing
- Business-initiated conversations: ~$0.005 - $0.02 per message
- User-initiated conversations: Free for 24 hours

### Email (for reference)
- Free tier: 300 emails/day
- Paid: Starting at €25/month for 20,000 emails

---

## Part 7: Monitoring & Analytics

### Brevo Dashboard
- Track delivery rates
- Monitor bounce rates
- View engagement metrics

### API Webhooks
Set up webhooks to receive delivery status:

```javascript
// Webhook endpoint
router.post('/webhooks/sms-status', (req, res) => {
  const { event, messageId, status } = req.body;
  
  console.log(`SMS ${messageId}: ${status}`);
  
  // Update database
  // Send alerts if needed
  
  res.status(200).send('OK');
});
```

---

## Summary Checklist

### WhatsApp Setup
- [ ] Enable WhatsApp in Brevo dashboard
- [ ] Create Facebook Business account
- [ ] Create WhatsApp Business account
- [ ] Link accounts
- [ ] Create and approve message templates
- [ ] Get template IDs
- [ ] Test sending messages

### SMS Setup
- [ ] Generate Brevo API key
- [ ] Understand compliance requirements
- [ ] Register sender ID (if required)
- [ ] Create SMS templates (optional)
- [ ] Test sending messages

### Integration
- [ ] Install Brevo SDK: `npm install @getbrevo/brevo`
- [ ] Create SMS service
- [ ] Create WhatsApp service
- [ ] Update environment variables
- [ ] Update booking confirmation flow
- [ ] Test end-to-end flow

### Production
- [ ] Set up monitoring
- [ ] Configure webhooks
- [ ] Set up billing alerts
- [ ] Document for team
- [ ] Train support staff

---

## Support Resources

- **Brevo Documentation**: https://developers.brevo.com/
- **WhatsApp API Reference**: https://developers.brevo.com/api-reference/whatsapp
- **SMS API Reference**: https://developers.brevo.com/api-reference/sms
- **Brevo Support**: https://help.brevo.com/

---

**Next Steps**: Start with WhatsApp setup as it requires more time for approvals. While waiting, implement and test SMS functionality.
