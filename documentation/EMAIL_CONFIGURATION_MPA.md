# Email Configuration for MPA (Next.js)

## Overview
The MPA confirmation page now sends booking confirmation emails automatically when users complete their booking, matching the SPA functionality.

## Setup Required

### 1. Environment Variable
Add the following to your `.env.local` file in `frontend-next/`:

```bash
# Backend API URL for email service
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# For production (Railway):
# NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
```

### 2. Backend Service
The email functionality uses the existing backend email service:
- **Endpoint**: `POST /api/email/send-booking-confirmation`
- **Provider**: Brevo (formerly Sendinblue)
- **Rate Limit**: 10 requests per minute per IP

The backend service is already configured in the SPA and uses:
- `backend/src/routes/email.js`
- `backend/src/services/emailService.js`
- `backend/src/services/emailTemplates.js`

### 3. Backend Environment Variables
Ensure these are set in your backend `.env`:

```bash
# Brevo API Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=noreply@tlpairways.com
BREVO_SENDER_NAME=TLP Airways

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

## How It Works

### Trigger
- Fires **1.5 seconds** after confirmation page loads
- Only sends once per page load (using `hasSentEmail.current` ref)
- Requires valid email address and booking data

### Email Content
The confirmation email includes:
- **Passenger Information**: Name, email, phone
- **Booking Reference**: PNR, booking ID
- **Flight Details**: Flight number, airline, aircraft type
- **Route Information**: Origin/destination cities, airports, terminals
- **Timing**: Travel dates, departure/arrival times, duration
- **Passengers**: Count and individual details with seats/meals
- **Pricing**: Base fare, taxes, total amount
- **Baggage**: Cabin and check-in allowances
- **Return Flight**: If round trip booking
- **Weather**: Destination weather forecast (added by backend)

### UI Indicators
The confirmation page shows three states:
1. **Sending**: "Sending confirmation email to..." with spinner
2. **Sent**: "✅ Confirmation email sent to..."
3. **Pending**: "A confirmation email will be sent to..."

## Testing

### Local Testing
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend-next && ./start-mpa.sh`
3. Complete a booking flow
4. Check console for email logs
5. Check recipient inbox for confirmation email

### Production Testing
1. Ensure `NEXT_PUBLIC_API_URL` points to Railway backend
2. Ensure backend Brevo credentials are configured
3. Complete test booking
4. Verify email delivery

## Error Handling
- Email failures are logged but don't break the page
- User still sees booking confirmation even if email fails
- Errors are logged to console for debugging

## Files Modified
- `frontend-next/lib/services/emailService.ts` (new)
- `frontend-next/pages/confirmation.tsx` (updated)

## Backend Files (already exist)
- `backend/src/routes/email.js`
- `backend/src/services/emailService.js`
- `backend/src/services/emailTemplates.js`
- `backend/src/utils/validators.js`

## Next Steps
1. Add `NEXT_PUBLIC_API_URL` to `.env.local`
2. Test locally
3. Add environment variable to Railway deployment
4. Deploy and test in production
