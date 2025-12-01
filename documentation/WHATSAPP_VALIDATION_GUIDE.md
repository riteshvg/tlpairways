# WhatsApp Integration Validation Guide

## Quick Validation Steps

### Step 1: Verify Environment Variables

Check that your `backend/.env` file has the required variables:

```bash
cd backend
cat .env | grep WHATSAPP
```

You should see:
```
WHATSAPP_PROVIDER=meta
WHATSAPP_API_KEY=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
```

### Step 2: Start Backend Server

**Option A: Use your start script (Recommended)**
```bash
./start-dev.sh
```
This starts both backend (port 3001) and frontend (port 3002).

**Option B: Start manually**
```bash
cd backend
npm start
# or for development
npm run dev
```

The server should start on port 3001 (as configured in start-dev.sh).

### Step 3: Test Status Endpoint

**Option A: Using curl**
```bash
curl http://localhost:3001/api/whatsapp/status
```

**Option B: Using the test script**
```bash
cd backend
node src/scripts/testWhatsApp.js
```

**Expected Response:**
```json
{
  "status": "configured",
  "provider": "meta",
  "message": "WhatsApp service is configured for meta"
}
```

### Step 4: Test Sending a Message

**Option A: Using curl**
```bash
curl -X POST http://localhost:3001/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "919876543210",
    "templateName": "flight_booking_confirmation",
    "templateParams": {
      "passengerName": "Test User",
      "ticketNumber": "TEST123456",
      "route": "DEL-BOM",
      "travelDate": "2025-01-25",
      "passengersCount": "1",
      "email": "test@example.com"
    }
  }'
```

**Option B: Using the test script**
```bash
cd backend
node src/scripts/testWhatsApp.js 919876543210
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "WhatsApp message sent successfully",
  "messageId": "wamid.xxx...",
  "provider": "meta"
}
```

**Expected Response (Error):**
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Step 5: Test via Frontend

1. Start the frontend:
```bash
cd frontend
npm start
```

2. Complete a booking flow:
   - Search for flights
   - Select flights
   - Fill traveller details (check "Receive booking details on WhatsApp")
   - Complete payment
   - On confirmation page, WhatsApp should send automatically

3. Check browser console for logs:
   - Look for: `✅ WhatsApp message sent successfully`

## Common Issues & Solutions

### Issue: "Missing Meta configuration"
**Solution:** Ensure all environment variables are set in `backend/.env`

### Issue: "Invalid phone number format"
**Solution:** Phone number should be digits only with country code (e.g., `919876543210` for India)

### Issue: "Template not found"
**Solution:** Ensure template name matches exactly: `flight_booking_confirmation`

### Issue: "Invalid OAuth access token"
**Solution:** 
- Check if your access token is expired
- Generate a new token from Meta Developer Console
- For production, use a System User Token (permanent)

### Issue: "Phone number not registered"
**Solution:** 
- For testing, ensure the phone number has opted in to receive messages
- Check Meta Business Manager → WhatsApp → Phone Numbers

## Validation Checklist

- [ ] Environment variables set in `backend/.env`
- [ ] Backend server running on port 5000
- [ ] Status endpoint returns "configured"
- [ ] Test message sends successfully
- [ ] Template parameters map correctly
- [ ] Frontend integration works end-to-end

## Debugging

### Check Backend Logs
```bash
# Look for WhatsApp-related logs
cd backend
npm run dev
# Watch for: 📤 Sending WhatsApp via Meta
```

### Check Meta API Response
The backend logs will show:
- Request data sent to Meta
- Response from Meta API
- Any error messages

### Test Template Parameters
Verify parameters are in correct order:
1. passengerName
2. ticketNumber (PNR)
3. route (e.g., "DEL-BOM")
4. travelDate (YYYY-MM-DD format)
5. passengersCount (as string)
6. email

## Next Steps

Once validation passes:
1. Test with a real booking flow
2. Monitor Meta Business Manager for message delivery
3. Check message delivery status in Meta dashboard
4. Set up webhooks for delivery receipts (optional)

