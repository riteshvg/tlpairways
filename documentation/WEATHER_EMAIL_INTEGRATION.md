# Weather Email Integration Guide

## Overview

This document describes the S3 weather integration for TLP Airways booking confirmation emails. The system fetches weather data from AWS S3 (populated by Adobe Event Forwarding) and personalizes emails with destination city weather information.

## Architecture

```
Adobe Event Forwarding → AWS S3 → Weather Service → Email Service → Brevo API → User Email
```

## Features

- ✅ Fetches weather data from AWS S3
- ✅ In-memory caching (5-minute TTL)
- ✅ Comprehensive input validation
- ✅ Graceful degradation (email sent even if weather unavailable)
- ✅ Rate limiting (10 requests/minute per IP)
- ✅ Detailed logging
- ✅ Production-ready error handling

## Setup

### 1. AWS S3 Configuration

1. Create an S3 bucket for weather data
2. Create IAM user with S3 read permissions
3. Get access key ID and secret access key
4. Configure in `.env`:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-weather-bucket-name
AWS_S3_PATH=weather-data/
```

### 2. S3 File Structure

Weather data is stored in the **events folder** with timestamped structure by Adobe Event Forwarding:

- `events/YYYY/MM/DD/HH/{event-id}.json`

**File Format (from Adobe Event Forwarding):**

```json
{
  "timestamp": "2025-12-01T08:24:12.143800Z",
  "event_id": "407dc535-adf3-4e4b-8ce4-420add782d64",
  "data": {
    "xdm": {
      // ... XDM analytics data ...
    },
    "payload": {
      "city": "Dubai",
      "temperature": 82.33,
      "humidity": 42,
      "sunrise": 1764557249,
      "sunset": 1764595709,
      "weather": "few clouds",
      "timestamp": "2025-12-01T08:24:10.871Z"
    }
  }
}
```

**Note:** The service automatically searches recent files in the events folder and extracts weather data from the `data.payload` object.

### 3. Environment Variables

Add to `backend/.env`:

```env
# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-weather-bucket-name
AWS_S3_EVENTS_PATH=events/

# Weather Cache
WEATHER_CACHE_DURATION=300000  # 5 minutes

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000     # 1 minute
RATE_LIMIT_MAX_REQUESTS=10     # Max requests per window

# Brevo Email (existing)
BREVO_API_KEY=your-brevo-api-key
SENDER_EMAIL=noreply@tlpairways.com
SENDER_NAME=TLP Airways
```

## API Usage

### Send Booking Confirmation Email with Weather

**Endpoint:** `POST /api/email/send-booking-confirmation`

**Rate Limit:** 10 requests per minute per IP

**Request Body:**

```json
{
  "passengerName": "Riya Chopra",
  "email": "riya@example.com",
  "bookingId": "V1P650",
  "toCity": "Dubai",
  "from": "BOM",
  "to": "DXB",
  "travelDate": "2025-12-30",
  "departureTime": "10:30",
  "arrivalTime": "12:45",
  "totalAmount": 5450,
  "totalPassengers": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Booking confirmation email sent successfully",
  "messageId": "123456789",
  "weatherIncluded": true
}
```

**Validation Errors:**

```json
{
  "success": false,
  "errors": [
    "Email is required",
    "Invalid email format",
    "Booking ID is required"
  ]
}
```

## Validation Rules

### Required Fields
- `email` - Valid email address (RFC 5322)
- `bookingId` - 6-20 alphanumeric characters
- `passengerName` - Non-empty string
- `toCity` - Non-empty string (destination city)

### Optional Validated Fields
- `phone` - E.164 or local format
- `totalAmount` - Positive number, max 1,000,000
- `totalPassengers` - Integer 1-9
- `from` / `to` - 3-letter IATA codes
- `travelDate` - Future date
- `departureTime` / `arrivalTime` - HH:MM format

## Weather Data Format

The weather service returns:

```javascript
{
  city: "Dubai",
  temperatureCelsius: 26.3,
  temperatureFahrenheit: 79.3,
  humidity: 42,
  weather: "few clouds",
  icon: "⛅",
  sunrise: "6:15 AM",
  sunset: "6:45 PM",
  timestamp: "2025-12-01T08:24:10.871Z"
}
```

## Email Template

The weather section appears in the email after "Check-in Information" and before "Quick Actions". It features:

- Blue gradient background (different from teal branding)
- Large temperature display (Celsius and Fahrenheit)
- Weather condition with emoji icon
- Humidity percentage
- Sunrise/sunset times (if available)

The section only appears if weather data is successfully fetched.

## Testing

### 1. Test Validators

```bash
cd backend
node src/tests/test-validators.js
```

### 2. Test Weather Service

```bash
cd backend
node src/tests/test-weather-service.js
```

**Note:** Requires AWS credentials in `.env`

### 3. Test Email API with Validation

```bash
cd backend
# Start server first
npm start

# In another terminal
node src/tests/test-email-validation.js
```

## Error Handling

### Weather Fetch Failures

- **S3 Connection Error:** Email sent without weather
- **City Not Found:** Email sent without weather
- **Invalid Data:** Email sent without weather
- **Timeout:** Email sent without weather (5-second timeout)

All errors are logged but never block email sending.

### Validation Failures

- Returns `400 Bad Request` with detailed error messages
- All validation errors are logged

### Rate Limiting

- Returns `429 Too Many Requests` when limit exceeded
- Message: "Too many email requests, please try again later"

## Logging

All operations are logged with timestamps:

```
[2025-12-01T08:24:10.871Z] ✅ Weather fetch SUCCESS: Dubai
[2025-12-01T08:24:10.871Z] 📧 Email sent: V1P650
[2025-12-01T08:24:10.871Z] ⚠️ Validation Error: email
```

## Performance

- **Caching:** Weather data cached for 5 minutes (configurable)
- **Timeout:** S3 requests timeout after 5 seconds
- **Rate Limiting:** Prevents abuse (10 req/min per IP)

## Security

- ✅ Input sanitization (XSS prevention)
- ✅ Rate limiting
- ✅ AWS credentials in environment variables only
- ✅ No sensitive data in logs
- ✅ Validation on all inputs

## Troubleshooting

### Weather Not Appearing in Emails

1. Check AWS credentials are configured
2. Verify S3 bucket name and path
3. Check file naming matches expected patterns
4. Verify file format matches Adobe Event Forwarding structure
5. Check logs for S3 errors

### Validation Errors

1. Check all required fields are present
2. Verify email format is valid
3. Check booking ID is 6-20 alphanumeric characters
4. Verify amounts are positive numbers
5. Check passenger count is 1-9

### Rate Limiting

- Wait 1 minute between requests
- Use different IP addresses for testing
- Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env` for development

## Files Created

- `backend/src/services/weatherService.js` - S3 weather fetching
- `backend/src/utils/validators.js` - Input validation
- `backend/src/services/loggerService.js` - Centralized logging
- `backend/src/tests/test-validators.js` - Validator tests
- `backend/src/tests/test-weather-service.js` - Weather service tests
- `backend/src/tests/test-email-validation.js` - API validation tests

## Files Modified

- `backend/src/services/emailService.js` - Added weather fetching
- `backend/src/services/emailTemplates.js` - Added weather section
- `backend/src/routes/email.js` - Added validation and rate limiting
- `backend/env.template.txt` - Added AWS configuration

## Next Steps

1. Configure AWS S3 bucket and credentials
2. Upload sample weather data files
3. Test weather fetching
4. Test complete email flow
5. Deploy to production

## Support

For issues or questions:
- Check logs for detailed error messages
- Review validation error responses
- Test individual components using test suites
- Verify environment variables are set correctly

