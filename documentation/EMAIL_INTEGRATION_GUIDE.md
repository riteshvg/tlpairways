# Brevo Email Integration Guide

## Overview

TLP Airways now sends automated booking confirmation emails using Brevo (SendinBlue) API. Emails are sent automatically when users complete their booking.

## Features

- ✅ Automatic email sending on booking confirmation
- ✅ Beautiful teal/turquoise branded HTML email template
- ✅ Responsive design (mobile-friendly)
- ✅ Plain text fallback for email clients
- ✅ Non-blocking (doesn't delay confirmation page)
- ✅ Error handling and logging

## Email Template Design

The email template uses TLP Airways brand colors:

- **Header**: Teal gradient (`#14B8A6` → `#0F766E`)
- **Cards**: Light teal background (`#F0FDFA`)
- **Buttons**: Orange accent (`#F97316`)
- **Text**: Dark teal headings (`#134E4A`), gray body (`#6B7280`)
- **Borders**: Light teal (`#CCFBF1`)

## Setup Instructions

### 1. Get Brevo API Key

1. Sign up at https://www.brevo.com (formerly SendinBlue)
2. Go to Settings → API Keys
3. Create a new API key
4. Copy the API key

### 2. Configure Environment Variables

Add to `backend/.env`:

```env
BREVO_API_KEY=your-brevo-api-key-here
SENDER_EMAIL=noreply@tlpairways.com
SENDER_NAME=TLP Airways
```

**Important**: 
- `SENDER_EMAIL` must be verified in your Brevo account
- Go to Brevo → Senders → Add a sender and verify the email

### 3. Verify Sender Email

1. Log in to Brevo dashboard
2. Go to **Senders & IP** → **Senders**
3. Click **Add a sender**
4. Enter your sender email (e.g., `noreply@tlpairways.com`)
5. Verify the email (check inbox for verification link)

## Testing

### Test Email Service Status

```bash
cd backend
node src/scripts/testEmail.js
```

### Test Sending Email

```bash
cd backend
node src/scripts/testEmail.js test@example.com
```

### Test via API

```bash
# Check status
curl http://localhost:3001/api/email/status

# Send test email
curl -X POST http://localhost:3001/api/email/send-booking-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "passengerName": "Test User",
    "email": "test@example.com",
    "bookingId": "TEST123",
    "route": "DEL-BOM",
    "travelDate": "2025-01-25",
    "passengers": "1 Adult",
    "flightNumber": "TL101"
  }'
```

## How It Works

### Flow

1. User completes booking on confirmation page
2. `BookingConfirmation` component automatically triggers email sending
3. Frontend calls `/api/email/send-booking-confirmation`
4. Backend uses Brevo API to send email
5. Email arrives in user's inbox within seconds

### Data Flow

```
BookingConfirmation.js
  ↓ (extracts booking data)
emailService.js (frontend)
  ↓ (POST /api/email/send-booking-confirmation)
email.js (backend route)
  ↓ (validates and processes)
emailService.js (backend)
  ↓ (generates HTML template)
emailTemplates.js
  ↓ (sends via Brevo API)
Brevo → User's Inbox
```

## Email Template Parameters

The email template receives:

- `passengerName` - Passenger full name
- `email` - Recipient email address
- `bookingId` - Booking PNR/ID
- `route` - Route (e.g., "DEL-BOM")
- `travelDate` - Travel date (YYYY-MM-DD)
- `passengers` - Passenger count (e.g., "2 Adults, 1 Child")
- `from` - Origin city (optional)
- `to` - Destination city (optional)
- `flightNumber` - Flight number (optional)
- `adults` - Number of adults (optional)
- `children` - Number of children (optional)

## Files Created

### Backend
- `backend/src/services/emailService.js` - Brevo API integration
- `backend/src/services/emailTemplates.js` - HTML email templates
- `backend/src/routes/email.js` - Email API routes
- `backend/src/scripts/testEmail.js` - Test script

### Frontend
- `frontend/src/services/emailService.js` - Frontend API calls

### Updated Files
- `backend/src/index.js` - Added email route
- `frontend/src/components/BookingConfirmation.js` - Added email sending
- `backend/env.template.txt` - Added Brevo configuration

## Troubleshooting

### Email not sending

1. **Check environment variables**:
   ```bash
   cd backend
   node src/scripts/testEmail.js
   ```

2. **Verify sender email**:
   - Must be verified in Brevo dashboard
   - Check Senders & IP → Senders

3. **Check API key**:
   - Ensure `BREVO_API_KEY` is correct
   - API key should start with `xkeysib-...`

4. **Check logs**:
   - Backend console will show email sending status
   - Look for `✅` or `❌` messages

### Email arrives but looks broken

- Email clients have limited CSS support
- Template uses inline CSS for maximum compatibility
- Test in Gmail, Outlook, Apple Mail

### Email not arriving

1. Check spam folder
2. Verify sender email is verified in Brevo
3. Check Brevo dashboard → Statistics for delivery status
4. Ensure recipient email is valid

## Production Checklist

- [ ] Brevo API key configured
- [ ] Sender email verified in Brevo
- [ ] Test email sent successfully
- [ ] Email template renders correctly
- [ ] Mobile responsive design verified
- [ ] Error handling tested
- [ ] Logging configured

## API Endpoints

### POST `/api/email/send-booking-confirmation`

Send booking confirmation email.

**Request Body:**
```json
{
  "passengerName": "Rajesh Kumar",
  "email": "customer@example.com",
  "bookingId": "TLP2024001",
  "route": "DEL-BOM",
  "travelDate": "2025-01-25",
  "passengers": "2 Adults",
  "from": "Delhi",
  "to": "Mumbai",
  "flightNumber": "TL101",
  "adults": 2,
  "children": 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking confirmation email sent successfully",
  "messageId": "brevo-message-id"
}
```

### GET `/api/email/status`

Check email service configuration status.

**Response:**
```json
{
  "configured": true,
  "hasApiKey": true,
  "hasSenderEmail": true,
  "senderEmail": "noreply@tlpairways.com",
  "senderName": "TLP Airways",
  "message": "Email service is configured and ready"
}
```

## Brand Colors Reference

```css
--primary: #14B8A6;           /* Teal - Main brand color */
--primary-dark: #0F766E;      /* Dark Teal - Secondary */
--primary-light: #5EEAD4;     /* Light Teal - Accents */
--accent: #F97316;            /* Orange - CTAs */
--card-background: #F0FDFA;   /* Light teal for cards */
--text-primary: #134E4A;      /* Dark teal for headings */
--text-secondary: #6B7280;    /* Gray for body text */
--border: #CCFBF1;            /* Light teal border */
```

## Support

For issues:
1. Check backend logs for error messages
2. Verify Brevo API key and sender email
3. Test using the test script
4. Check Brevo dashboard for delivery statistics

