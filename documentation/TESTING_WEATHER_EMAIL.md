# Testing Weather Email Integration

## Quick Test Guide

### Prerequisites

1. **Backend server running:**
   ```bash
   cd backend
   npm start
   # Or use: ./start-dev.sh
   ```

2. **Environment variables configured:**
   - `BREVO_API_KEY` - Your Brevo API key
   - `SENDER_EMAIL` - Verified sender email
   - `AWS_ACCESS_KEY_ID` - AWS credentials
   - `AWS_SECRET_ACCESS_KEY` - AWS credentials
   - `AWS_S3_BUCKET` - S3 bucket name
   - `AWS_S3_EVENTS_PATH` - Events folder path (default: `events/`)

3. **Weather data in S3:**
   - Weather events should exist in `events/YYYY/MM/DD/` folders
   - Events should have `data.payload` with weather information

## Test Methods

### Method 1: Test Script (Recommended)

**Step 1:** Update the test email address in the script:
```bash
# Edit backend/src/scripts/test-email-with-weather.js
# Change: email: process.env.TEST_EMAIL || 'test@example.com'
# To your actual email address
```

**Step 2:** Run the test script:
```bash
cd backend
node src/scripts/test-email-with-weather.js
```

**Expected Output:**
```
✅ Backend server is running

🧪 Testing Email with Weather Integration...

📧 Sending test email to: your-email@example.com
🌍 Destination city: Dubai
   (Weather data will be fetched from events folder)

✅ Email sent successfully!
   Message ID: 123456789
   Weather included: ✅ Yes

📬 Check your inbox at: your-email@example.com
   Look for the weather section in the email (blue gradient box)
```

### Method 2: Test via API (Postman/cURL)

**Using cURL:**
```bash
curl -X POST http://localhost:3001/api/email/send-booking-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "passengerName": "Test User",
    "email": "your-email@example.com",
    "bookingId": "TEST123",
    "toCity": "Dubai",
    "from": "BOM",
    "to": "DXB",
    "travelDate": "2025-12-30",
    "departureTime": "10:30",
    "arrivalTime": "12:45",
    "totalAmount": 5450,
    "totalPassengers": 1
  }'
```

**Using Postman:**
- Method: `POST`
- URL: `http://localhost:3001/api/email/send-booking-confirmation`
- Headers: `Content-Type: application/json`
- Body: Use the JSON from Method 1 test script

### Method 3: Test via Application

1. **Complete a booking** in the application
2. **Use a destination city** that has weather data in S3 (e.g., Dubai, Mumbai, Delhi)
3. **Complete the booking flow** to trigger the confirmation email
4. **Check your email** for the booking confirmation with weather

## What to Look For in the Email

### Weather Section Appearance

The weather section appears **after "Check-in Information"** and **before "Quick Actions"** in the email.

**Visual Design:**
- **Blue gradient background** (different from teal branding)
- **Large temperature display** (36px font)
- **Weather emoji icon** (☀️, ⛅, ☁️, 🌧️, etc.)
- **Responsive layout** (stacks on mobile)

**Content Displayed:**
1. **Temperature:**
   - Large display: `26.3°C`
   - Smaller text below: `79.4°F`

2. **Condition:**
   - Weather description: `few clouds`
   - Humidity: `42%`

3. **Sunrise/Sunset** (if available):
   - 🌅 Sunrise: `6:15 AM`
   - 🌇 Sunset: `6:45 PM`

### Example Weather Section

```
┌─────────────────────────────────────────┐
│  ⛅ Weather in Dubai                     │
│                                         │
│  Temperature        Condition          │
│     26.3°C         few clouds           │
│     79.4°F         Humidity: 42%       │
│                                         │
│  🌅 Sunrise: 6:15 AM                     │
│  🌇 Sunset: 6:45 PM                      │
│                                         │
│  Current weather at your destination    │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Weather Not Appearing

**Check 1: Weather data exists in S3**
```bash
# List recent events
aws s3 ls s3://tlpairways-event-data-prod/events/2025/12/01/ --recursive | tail -10

# Check if weather payload exists
aws s3 cp s3://tlpairways-event-data-prod/events/2025/12/01/08/{event-id}.json - | jq '.data.payload'
```

**Check 2: City name matches**
- Weather service searches for city name in `data.payload.city`
- Make sure the city name in booking matches exactly (case-insensitive)
- Example: "Dubai" in booking should match "Dubai" in weather payload

**Check 3: Backend logs**
```bash
# Check backend console for weather fetch logs
# Look for:
# ✅ Weather fetch SUCCESS: Dubai
# or
# ❌ Weather fetch FAILED: Dubai
```

**Check 4: Email service logs**
```bash
# Check for:
# 📧 Email sent: TEST123
#   to: your-email@example.com
#   weather: ✅ (or ❌)
```

### Email Not Sending

**Check 1: Brevo configuration**
```bash
# Test email service status
curl http://localhost:3001/api/email/status
```

**Check 2: Validation errors**
- Check API response for validation errors
- Ensure all required fields are provided
- Check email format is valid

**Check 3: Rate limiting**
- Max 10 requests per minute per IP
- Wait 1 minute if rate limited

### Testing Different Cities

To test with different cities, update the `toCity` field:

```javascript
// In test script or API call
{
  "toCity": "Mumbai",  // or "Delhi", "New York", etc.
  // ... rest of booking data
}
```

**Note:** Weather will only appear if:
1. Weather data exists in S3 events folder for that city
2. City name matches exactly (case-insensitive)
3. Weather data is in recent events (today or yesterday)

## Testing Checklist

- [ ] Backend server is running
- [ ] Environment variables are set
- [ ] Weather data exists in S3 for test city
- [ ] Test email address is valid
- [ ] Email sent successfully
- [ ] Weather section appears in email
- [ ] Temperature displays correctly (Celsius and Fahrenheit)
- [ ] Weather condition displays correctly
- [ ] Humidity displays correctly
- [ ] Sunrise/sunset display (if available)
- [ ] Email looks good on mobile (responsive)

## Next Steps

After successful testing:
1. Test with real booking flow
2. Verify weather appears for all destination cities
3. Check email rendering in different email clients
4. Monitor logs for any errors
5. Deploy to production

