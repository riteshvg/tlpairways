# Confirmation Page: pageData and viewData Integration

## Overview
Reconstructed the `pageData` and `viewData` objects inside the `eventData` of the confirmation page's purchase event, matching the pattern used in the search results page.

## Changes Made

### 1. Import Helper Functions
Added imports from `dataLayer.ts`:
- `getSessionId()` - Get or create session ID
- `getPreviousPage()` - Get the previous page name from session storage
- `setCurrentPageAsPrevious()` - Set current page for next navigation
- `getUserAgentDetails()` - Get user agent, screen resolution, and viewport size

### 2. Added pageData Object
Created a comprehensive `pageData` object inside `eventData` with:

#### Basic Page Information
- `pageType`: 'confirmation'
- `pageName`: 'Booking Confirmation'
- `pageURL`: Current window location
- `referrer`: Document referrer
- `previousPage`: Retrieved from session storage
- `timestamp`: Current ISO timestamp
- `userAgent`: Browser user agent string
- `screenResolution`: Screen dimensions (e.g., "1728x1117")
- `viewportSize`: Viewport dimensions (e.g., "1132x968")

#### Page Metadata
- `pageTitle`: 'Booking Confirmed - TLP Airways'
- `pageCategory`: 'booking'
- `bookingStep`: 'confirmation'
- `bookingStepNumber`: 5
- `totalBookingSteps`: 5
- `sections`: ['bookingDetails', 'flightInfo', 'passengerInfo', 'paymentSummary']

#### Nested Objects in pageData
- **userData**: User authentication status, ID, email, segment
- **bookingContext**: PNR, booking status, selected flights (onward/return), total price, passengers
- **searchContext**: Complete search criteria, origin/destination, dates, passengers, revenue data, geography, etc.

### 3. Added viewData Object
Created a `viewData` object inside `eventData` with:
- `landingPage`: false (not a landing page)
- `userAuthenticated`: Boolean based on Auth0 user
- `userId`: Auth0 user ID or null
- `sessionId`: Session ID from session storage
- `userEmail`: User email or null
- `userLoyaltyTier`: null (placeholder)

### 4. Removed Duplicate Data
Removed duplicate sections that were redundant:
- ❌ Removed standalone `userData` (now in `pageData.userData`)
- ❌ Removed standalone `searchContext` (now in `pageData.searchContext`)
- ✅ Kept `customer`, `paymentDetails`, `booking`, and `sustainabilityImpact` as they contain purchase-specific data

### 5. Added Page Tracking
Added `setCurrentPageAsPrevious('Booking Confirmation')` after pushing the event to maintain proper page flow tracking.

## Event Structure

The purchase event now has this structure:

```javascript
{
  event: 'purchase',
  eventData: {
    pageData: {
      pageType: 'confirmation',
      pageName: 'Booking Confirmation',
      pageURL: '...',
      referrer: '...',
      previousPage: '...',
      timestamp: '...',
      userAgent: '...',
      screenResolution: '...',
      viewportSize: '...',
      pageTitle: '...',
      pageCategory: 'booking',
      bookingStep: 'confirmation',
      bookingStepNumber: 5,
      totalBookingSteps: 5,
      sections: [...],
      userData: {...},
      bookingContext: {...},
      searchContext: {...}
    },
    viewData: {
      landingPage: false,
      userAuthenticated: ...,
      userId: ...,
      sessionId: ...,
      userEmail: ...,
      userLoyaltyTier: null
    },
    revenue: {...},
    paymentDetails: {...},
    customer: {...},
    booking: {...},
    sustainabilityImpact: {...}
  },
  timestamp: '...'
}
```

## Benefits

1. **Consistent Structure**: Matches the pageView event structure from search results page
2. **Single Event**: All page context and purchase data in one comprehensive event
3. **No Duplicates**: Removed redundant data sections
4. **Complete Context**: Provides full page context (URL, referrer, user agent, etc.) alongside purchase data
5. **Proper Tracking**: Maintains page flow tracking with `setCurrentPageAsPrevious()`

## Testing

To verify the changes:
1. Complete a booking flow and navigate to the confirmation page
2. Check browser console for the purchase event
3. Verify the event contains both `pageData` and `viewData` objects
4. Confirm only ONE event is pushed (not two separate events)
5. Check Adobe Analytics debugger to verify single interact call

## Files Modified

- `/frontend-next/pages/confirmation.tsx` - Main changes to purchase event structure

## Date
2025-12-07

## Branch
MPA (changes not committed to main)
