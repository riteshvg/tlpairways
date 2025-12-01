# WhatsApp Template Data Flow

## Data Source Overview

All WhatsApp template data points come from the React Router `location.state` object, which is passed when navigating to the BookingConfirmation page.

## Data Flow Path

```
TravellerDetails Page
  ↓ (user fills form)
AncillaryServices Page  
  ↓ (user selects services)
Payment Page
  ↓ (user completes payment)
BookingConfirmation Page
  ↓ (extracts data from location.state)
WhatsApp Service
  ↓ (maps to template parameters)
Meta WhatsApp API
```

## Data Points Mapping

### Template Parameter: {{1}} - Passenger Name
**Source:** `travellerDetails[0].firstName + travellerDetails[0].lastName`
- **Origin:** TravellerDetails form (user input)
- **Path:** `location.state.travellerDetails[0]`
- **Code Location:** `BookingConfirmation.js:509-512`
```javascript
const primaryPassenger = travellerDetails?.[0];
const passengerName = primaryPassenger
  ? `${primaryPassenger.firstName || ''} ${primaryPassenger.lastName || ''}`.trim()
  : 'Guest';
```

### Template Parameter: {{2}} - Ticket Number (PNR)
**Source:** `pnr` (Booking Reference)
- **Origin:** Generated in SearchResults page OR fallback generation
- **Path:** `location.state.pnr` → `bookingDetails.pnr`
- **Code Location:** `BookingConfirmation.js:134, 150-157`
```javascript
pnr: passedPNR || airlinesDataLayer.generateBookingReference()
```

### Template Parameter: {{3}} - Route
**Source:** `origin + "-" + destination` (e.g., "DEL-BOM")
- **Origin:** Selected flight from SearchResults
- **Path:** `location.state.selectedFlights.onward.origin` + `destination`
- **Code Location:** `BookingConfirmation.js:561-564, whatsappService.js:38-40`
```javascript
const origin = selectedFlights.onward.origin?.iata_code || selectedFlights.onward.originCode;
const destination = selectedFlights.onward.destination?.iata_code || selectedFlights.onward.destinationCode;
const route = `${origin}-${destination}`;
```

### Template Parameter: {{4}} - Travel Date
**Source:** `selectedFlights.onward.departureTime` OR `userDepartureDate`
- **Origin:** User-selected date from flight search OR flight's departure time
- **Path:** `location.state.selectedFlights.onward.departureTime` OR `location.state.departureDate`
- **Format:** `YYYY-MM-DD` (e.g., "2025-01-25")
- **Code Location:** `BookingConfirmation.js:543-552, 565`
```javascript
const formatTravelDate = (dateStr) => {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return isValid(date) ? format(date, 'yyyy-MM-dd') : dateStr;
};
departureDate: formatTravelDate(selectedFlights.onward.departureTime || userDepartureDate)
```

### Template Parameter: {{5}} - Passengers Count
**Source:** `numPassengers` (calculated from passengers breakdown)
- **Origin:** User selection in flight search (adults + children + infants)
- **Path:** `location.state.passengers` OR `travellerDetails.length`
- **Code Location:** `BookingConfirmation.js:140, 560`
```javascript
const numPassengers = (location.state?.passengers || travellerDetails?.length || 1);
passengersCount: numPassengers
```

### Template Parameter: {{6}} - Email
**Source:** `contactInfo.email` OR `travellerDetails[0].email`
- **Origin:** Contact information form in TravellerDetails page
- **Path:** `location.state.contactInfo.email` OR `location.state.travellerDetails[0].email`
- **Code Location:** `BookingConfirmation.js:559`
```javascript
email: contactInfo?.email || travellerDetails?.[0]?.email || 'N/A'
```

## Complete Data Extraction (BookingConfirmation.js)

```javascript
// All data comes from location.state passed from Payment page
const {
  selectedFlights,      // Flight details (onward, return)
  travellerDetails,    // Array of passenger info
  contactInfo,         // { email, phone, whatsappNotification }
  pnr: passedPNR,      // Booking reference
  departureDate: userDepartureDate,
  returnDate: userReturnDate,
  passengers           // { adult, child, infant }
} = location.state || {};
```

## Data Flow Through Components

### 1. TravellerDetails Component
**File:** `frontend/src/components/TravellerDetails.js`
- Captures: `email`, `phone`, `whatsappNotification`, `travellers[]`
- Passes to: AncillaryServices via `navigate('/ancillary-services', { state: {...} })`

### 2. AncillaryServices Component  
**File:** `frontend/src/components/AncillaryServices.js`
- Adds: `selectedServices` (seats, baggage, meals, etc.)
- Passes to: Payment via `navigate('/payment', { state: {...} })`

### 3. Payment Component
**File:** `frontend/src/components/Payment.js`
- Adds: `paymentDetails`, `totalAmount`
- Passes to: BookingConfirmation via `navigate('/confirmation', { state: {...} })`

### 4. BookingConfirmation Component
**File:** `frontend/src/components/BookingConfirmation.js`
- Extracts all data from `location.state`
- Formats and prepares for WhatsApp
- Calls: `sendBookingConfirmationWhatsApp(bookingData)`

### 5. WhatsApp Service
**File:** `frontend/src/services/whatsappService.js`
- Maps booking data to template parameters
- Sends to backend API: `POST /api/whatsapp/send`

### 6. Backend WhatsApp Route
**File:** `backend/src/routes/whatsapp.js`
- Receives template parameters
- Builds Meta WhatsApp template message
- Sends to Meta WhatsApp Business API

## Key Data Sources Summary

| Data Point | Source Component | State Path | Fallback |
|------------|-----------------|------------|----------|
| Passenger Name | TravellerDetails | `travellerDetails[0].firstName + lastName` | "Guest" |
| PNR | SearchResults | `location.state.pnr` | Generated fallback |
| Route | SearchResults | `selectedFlights.onward.origin + destination` | "N/A" |
| Travel Date | Flight Search | `selectedFlights.onward.departureTime` OR `userDepartureDate` | "N/A" |
| Passengers Count | Flight Search | `passengers` OR `travellerDetails.length` | 1 |
| Email | TravellerDetails | `contactInfo.email` OR `travellerDetails[0].email` | "N/A" |
| Phone Number | TravellerDetails | `contactInfo.phone` | Required (validation) |

## Important Notes

1. **Phone Number Formatting:** 
   - Automatically adds country code `91` if missing (assumes India)
   - Removes all non-digit characters
   - Code: `BookingConfirmation.js:503-506`

2. **Date Formatting:**
   - Travel date must be `YYYY-MM-DD` format for template
   - Uses `date-fns` library for parsing and formatting
   - Code: `BookingConfirmation.js:543-552`

3. **Route Format:**
   - Always `ORIGIN-DESTINATION` (e.g., "DEL-BOM")
   - Uses airport IATA codes
   - Code: `whatsappService.js:38-40`

4. **Data Validation:**
   - WhatsApp only sends if `contactInfo.whatsappNotification === true`
   - Requires: phone, PNR, and selectedFlights
   - Code: `BookingConfirmation.js:486-494`

