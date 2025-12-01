# Weather Email Flow - Complete Process

## Overview
This document describes the complete flow of how weather data is fetched from S3 and included in booking confirmation emails.

---

## Step-by-Step Flow

### STEP 1: User Completes Booking
**Location:** `frontend/src/components/BookingConfirmation.js`

**What Happens:**
- User completes payment and reaches the booking confirmation page
- Frontend collects all booking data including:
  - Destination airport code (e.g., "HYD")
  - Destination city name (e.g., "Hyderabad")
  - Passenger details, flight info, etc.

**Code Reference:**
```javascript
// Line ~718: Extract airport details
const destDetails = getAirportDetails(selectedFlights.onward.destination);
// This uses findAirportByCode() to get city name from airports.json
```

**Data Collected:**
```javascript
{
  to: "HYD",                    // Airport code
  toCity: "Hyderabad",          // City name (from airports.json)
  toAirport: "Rajiv Gandhi International Airport",
  // ... other booking data
}
```

---

### STEP 2: Frontend Sends Email Request
**Location:** `frontend/src/components/BookingConfirmation.js` (Line ~649)

**What Happens:**
- After 1.5 seconds delay, frontend calls email service
- Sends comprehensive booking data to backend API

**API Call:**
```javascript
POST /api/email/send-booking-confirmation
Content-Type: application/json

{
  "passengerName": "John Doe",
  "email": "john@example.com",
  "bookingId": "ABC123",
  "toCity": "Hyderabad",        // ← City name for weather lookup
  "to": "HYD",                  // ← Airport code (fallback)
  "from": "BOM",
  "fromCity": "Mumbai",
  // ... complete booking data
}
```

**Code Reference:**
```javascript
// Line ~815: toCity is sent to backend
toCity: destDetails.city || selectedFlights.onward.destinationCity || ''
```

---

### STEP 3: Backend Receives Request
**Location:** `backend/src/routes/email.js`

**What Happens:**
1. **Rate Limiting Check** (Line ~20)
   - Max 10 requests per minute per IP
   - Returns 429 if exceeded

2. **Validation Middleware** (Line ~30)
   - Validates email format, booking ID, required fields
   - Returns 400 with errors if validation fails

3. **Request Processing** (Line ~40)
   - Extracts booking data from request body
   - Prepares comprehensive booking data object

**Code Reference:**
```javascript
router.post('/send-booking-confirmation', 
  emailLimiter,           // Rate limiting
  validateBookingData,    // Validation
  async (req, res) => {
    // Process request
  }
);
```

---

### STEP 4: Email Service Normalizes City Name
**Location:** `backend/src/services/emailService.js` (Line ~72)

**What Happens:**
- Normalizes city name using `cityMapper`
- Handles airport codes (HYD → Hyderabad)
- Handles variations and case differences

**Code:**
```javascript
const { normalizeCityName } = require('../utils/cityMapper');
const cityForWeather = normalizeCityName(
  sanitizedData.toCity || sanitizedData.to || ''
);
// Example: "HYD" → "Hyderabad"
// Example: "hyderabad" → "Hyderabad"
```

**Result:**
- `cityForWeather = "Hyderabad"` (normalized)

---

### STEP 5: Weather Service Fetches from S3
**Location:** `backend/src/services/weatherService.js`

**What Happens:**

#### 5a. Check Cache (Line ~459)
```javascript
// Check if weather data is cached (5-minute TTL)
const cached = weatherCache.get(sanitizedCity);
if (cached && (now - cached.timestamp < CACHE_DURATION)) {
  return cached.data; // Return cached data
}
```

#### 5b. Search S3 Events Folder (Line ~275)
```javascript
// Search in events/YYYY/MM/DD/ folders
const todayPath = `events/2025/12/01/`;
const yesterdayPath = `events/2025/11/30/`; // Also check yesterday

// List up to 200 recent files
const listCommand = new ListObjectsV2Command({
  Bucket: bucket,
  Prefix: todayPath,
  MaxKeys: 200
});
```

#### 5c. Parse Each Event File (Line ~340)
```javascript
// For each event file:
const jsonData = JSON.parse(content);

// Extract weather payload
if (jsonData.data.payload && jsonData.data.payload.city) {
  weatherCity = jsonData.data.payload.city;      // "Hyderabad"
  weatherPayload = jsonData.data.payload;        // Full weather data
}
```

**S3 Event File Structure:**
```json
{
  "timestamp": "2025-12-01T10:39:58.117Z",
  "event_id": "542a7305-ddba-415c-83f6-a3c46def7bf3",
  "data": {
    "xdm": { /* analytics data */ },
    "payload": {
      "city": "Hyderabad",
      "temperature": 82.81,
      "humidity": 44,
      "sunrise": 1764550815,
      "sunset": 1764591018,
      "weather": "haze",
      "timestamp": "2025-12-01T10:39:58.117Z"
    }
  }
}
```

#### 5d. Match City Name (Line ~370)
```javascript
// Use cityMapper to match cities
const cityMatch = citiesMatch(weatherCity, city);
// "Hyderabad" matches "Hyderabad" ✅
// "HYD" matches "Hyderabad" ✅
```

#### 5e. Validate Weather Data (Line ~379)
```javascript
const validatedData = validateWeatherData({ payload: weatherPayload });
// Checks:
// - City name is valid
// - Temperature is in valid range (-50°C to 60°C)
// - Humidity is 0-100%
// - Weather condition is a string
```

#### 5f. Format Weather Data (Line ~483)
```javascript
// Convert temperature (handles Fahrenheit, Kelvin, Celsius)
const temperatureCelsius = convertToCelsius(rawData.temperature);
// 82.81°F → 28.2°C

const temperatureFahrenheit = convertToFahrenheit(rawData.temperature, 'auto');
// 82.81°F → 82.8°F

// Format sunrise/sunset
const sunrise = formatUnixTime(rawData.sunrise);
// 1764550815 → "6:15 AM"

// Get weather icon
const icon = getWeatherIcon(rawData.weather);
// "haze" → "🌫️"
```

**Formatted Weather Data:**
```javascript
{
  city: "Hyderabad",
  temperatureCelsius: 28.2,
  temperatureFahrenheit: 82.8,
  humidity: 44,
  weather: "haze",
  icon: "🌫️",
  sunrise: "6:15 AM",
  sunset: "6:45 PM",
  timestamp: "2025-12-01T10:39:58.117Z"
}
```

#### 5g. Cache Result (Line ~504)
```javascript
weatherCache.set(sanitizedCity, {
  data: weatherData,
  timestamp: Date.now()
});
// Cache for 5 minutes
```

---

### STEP 6: Weather Data Added to Email Template
**Location:** `backend/src/services/emailService.js` (Line ~78)

**What Happens:**
- Weather data is merged with booking data
- `hasWeather` flag is set to true

**Code:**
```javascript
if (weatherData) {
  weatherIncluded = true;
  sanitizedData.weatherData = weatherData;
  sanitizedData.hasWeather = true;
}
```

**Booking Data with Weather:**
```javascript
{
  passengerName: "John Doe",
  email: "john@example.com",
  bookingId: "ABC123",
  toCity: "Hyderabad",
  // ... other booking data
  hasWeather: true,              // ← Flag for template
  weatherData: {                 // ← Weather data
    city: "Hyderabad",
    temperatureCelsius: 28.2,
    temperatureFahrenheit: 82.8,
    humidity: 44,
    weather: "haze",
    icon: "🌫️",
    sunrise: "6:15 AM",
    sunset: "6:45 PM"
  }
}
```

---

### STEP 7: Email Template Generates HTML
**Location:** `backend/src/services/emailTemplates.js` (Line ~544)

**What Happens:**
- Email template checks `hasWeather` flag
- If true, generates weather section HTML
- Weather section inserted after "Check-in Information"

**Code:**
```javascript
// Line ~544: Conditional weather section
${bookingData.hasWeather && bookingData.weatherData ? `
  <!-- Weather Section HTML -->
` : ''}
```

**Weather Section HTML Structure:**
```html
<table style="background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);">
  <tr>
    <td>
      <h3>🌫️ Weather in Hyderabad</h3>
      
      <table>
        <tr>
          <td>
            <div>Temperature</div>
            <div style="font-size: 36px;">28.2°C</div>
            <div style="font-size: 12px;">82.8°F</div>
          </td>
          <td>
            <div>Condition</div>
            <div style="font-size: 18px;">haze</div>
            <div style="font-size: 12px;">Humidity: 44%</div>
          </td>
        </tr>
      </table>
      
      <div>
        🌅 Sunrise: 6:15 AM
        🌇 Sunset: 6:45 PM
      </div>
      
      <p>Current weather at your destination</p>
    </td>
  </tr>
</table>
```

---

### STEP 8: Email Sent via Brevo API
**Location:** `backend/src/services/emailService.js` (Line ~84)

**What Happens:**
- HTML email content generated
- Email sent via Brevo (SendinBlue) API
- Response includes message ID

**Code:**
```javascript
const sendSmtpEmail = new brevo.SendSmtpEmail();
sendSmtpEmail.subject = `Booking Confirmed - ${bookingId}`;
sendSmtpEmail.htmlContent = htmlContent;  // Includes weather section
sendSmtpEmail.to = [{ email: bookingData.email, name: passengerName }];

const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
```

**Response:**
```javascript
{
  success: true,
  messageId: "123456789",
  weatherIncluded: true  // ← Confirms weather was included
}
```

---

### STEP 9: User Receives Email
**What User Sees:**

**Email Structure:**
1. Header (TLP Airways branding)
2. Flight Summary
3. Passenger Details
4. Booking Information
5. Payment Summary
6. Baggage Allowance
7. Check-in Information
8. **🌫️ Weather in Hyderabad** ← **WEATHER SECTION** (Blue gradient box)
   - Large temperature: **28.2°C**
   - Fahrenheit: **82.8°F**
   - Condition: **haze**
   - Humidity: **44%**
   - Sunrise: **6:15 AM**
   - Sunset: **6:45 PM**
9. Quick Actions
10. Important Information
11. Footer

**Visual Appearance:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  🌫️ Weather in Hyderabad                    │
│                                             │
│  ┌──────────────┐    ┌──────────────┐      │
│  │ Temperature  │    │  Condition   │      │
│  │              │    │              │      │
│  │   28.2°C     │    │    haze      │      │
│  │   82.8°F     │    │ Humidity: 44%│      │
│  └──────────────┘    └──────────────┘      │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  🌅 Sunrise: 6:15 AM  🌇 Sunset: 6:45 PM  │
│                                             │
│  Current weather at your destination       │
│                                             │
└─────────────────────────────────────────────┘
```

**Design Features:**
- **Blue gradient background** (#0EA5E9 to #0284C7)
- **Large temperature display** (36px font)
- **Weather emoji icon** (auto-selected based on condition)
- **Responsive layout** (stacks on mobile)
- **Only appears if weather data found**

---

## Error Handling & Fallbacks

### If Weather Data Not Found:
1. **Email still sends** (graceful degradation)
2. **Weather section is hidden** (`hasWeather: false`)
3. **Logs warning**: `⚠️ Weather data not found for city: Hyderabad`
4. **User receives email** without weather section

### If S3 Connection Fails:
1. **Email still sends**
2. **Weather section is hidden**
3. **Logs error**: `❌ S3 Error: GetObject`
4. **No impact on email delivery**

### If City Name Doesn't Match:
1. **Email still sends**
2. **Weather section is hidden**
3. **Logs**: `⚠️ Weather data not found for city: [city]`
4. **System tries multiple matching strategies**

---

## Performance Optimizations

### 1. Caching (5-minute TTL)
- Weather data cached in memory
- Subsequent requests for same city are instant
- Reduces S3 API calls

### 2. Search Optimization
- Searches only today's and yesterday's folders
- Limits to 50 most recent files
- Stops searching once match found

### 3. Non-Blocking
- Weather fetch doesn't block email sending
- Email sends even if weather fetch fails
- Async/await for all I/O operations

---

## Data Flow Diagram

```
User Booking
    ↓
Frontend (BookingConfirmation.js)
    ├─ Extract city name from airport code
    ├─ HYD → "Hyderabad" (via findAirportByCode)
    └─ Send to backend: { toCity: "Hyderabad", to: "HYD" }
         ↓
Backend API (email.js)
    ├─ Rate limiting check
    ├─ Validation
    └─ Call emailService.sendBookingConfirmationEmail()
         ↓
Email Service (emailService.js)
    ├─ Normalize city name: "Hyderabad"
    └─ Call weatherService.getWeatherForCity("Hyderabad")
         ↓
Weather Service (weatherService.js)
    ├─ Check cache (5-min TTL)
    ├─ If not cached:
    │   ├─ Search S3: events/2025/12/01/
    │   ├─ Parse event files
    │   ├─ Extract data.payload.city
    │   ├─ Match city: "Hyderabad" === "Hyderabad"
    │   ├─ Validate weather data
    │   ├─ Format: 82.81°F → 28.2°C
    │   └─ Cache result
    └─ Return: { city, temperatureCelsius, weather, ... }
         ↓
Email Service (emailService.js)
    ├─ Add weatherData to bookingData
    ├─ Set hasWeather: true
    └─ Call emailTemplates.generateBookingConfirmationEmail()
         ↓
Email Template (emailTemplates.js)
    ├─ Check hasWeather flag
    ├─ If true: Generate weather section HTML
    └─ Return complete HTML email
         ↓
Brevo API
    ├─ Send email via Brevo
    └─ Return messageId
         ↓
User Email Inbox
    └─ Email with weather section displayed
```

---

## Key Files & Functions

| File | Function | Purpose |
|------|----------|---------|
| `frontend/src/components/BookingConfirmation.js` | `getAirportDetails()` | Extract city name from airport code |
| `frontend/src/components/BookingConfirmation.js` | `sendEmail()` | Send booking data to backend |
| `backend/src/routes/email.js` | `validateBookingData` | Validate request data |
| `backend/src/services/emailService.js` | `sendBookingConfirmationEmail()` | Main email sending function |
| `backend/src/services/emailService.js` | `normalizeCityName()` | Normalize city name |
| `backend/src/services/weatherService.js` | `getWeatherForCity()` | Fetch weather from S3 |
| `backend/src/services/weatherService.js` | `searchWeatherInEventsFolder()` | Search S3 events folder |
| `backend/src/services/weatherService.js` | `convertToCelsius()` | Convert temperature |
| `backend/src/services/weatherService.js` | `getWeatherIcon()` | Get weather emoji |
| `backend/src/services/emailTemplates.js` | `generateBookingConfirmationEmail()` | Generate HTML email |
| `backend/src/utils/cityMapper.js` | `normalizeCityName()` | Map airport codes to cities |
| `backend/src/utils/cityMapper.js` | `citiesMatch()` | Match city names |

---

## Testing the Flow

### Test Step 1: Check Frontend City Extraction
```javascript
// In browser console on booking confirmation page
console.log(destDetails.city); // Should show "Hyderabad" not "HYD"
```

### Test Step 2: Check Backend Receives City
```bash
# Check backend logs
# Should see: "toCity: Hyderabad"
```

### Test Step 3: Check Weather Fetch
```bash
# Check backend logs
# Should see: "✅ Weather fetch SUCCESS: Hyderabad"
```

### Test Step 4: Check Email Generation
```bash
# Check backend logs
# Should see: "📧 Email sent: ABC123 { weather: ✅ }"
```

### Test Step 5: Check Email Received
- Open email inbox
- Look for blue gradient weather section
- Verify temperature, condition, humidity displayed

---

## Summary

**Complete Flow:**
1. User books flight → Frontend extracts city name
2. Frontend sends email request → Backend receives
3. Backend normalizes city → Weather service searches S3
4. Weather data found → Formatted and cached
5. Weather added to email → Template generates HTML
6. Email sent via Brevo → User receives email
7. Weather section displayed → Blue gradient box with temperature

**Key Points:**
- ✅ Works for all cities in airports.json
- ✅ Handles airport codes (HYD → Hyderabad)
- ✅ Gracefully degrades if weather not found
- ✅ Cached for performance (5-minute TTL)
- ✅ Non-blocking (email sends even if weather fails)
- ✅ Beautiful visual design (blue gradient, large temperature)

