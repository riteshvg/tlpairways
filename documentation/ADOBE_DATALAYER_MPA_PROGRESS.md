# Adobe Data Layer - MPA Implementation Progress

## ✅ Completed

### 1. **Core Data Layer Utilities** (`lib/analytics/dataLayer.ts`)
- `pushToDataLayer()` - Generic push function
- `pushPageView()` - Enhanced pageView events with full metadata
- `pushUserContext()` - User authentication state tracking
- `pushSearchContext()` - Flight search tracking
- `pushBookingContext()` - Booking flow tracking
- `pushPurchase()` - Purchase/conversion tracking
- `pushCustomEvent()` - Custom event tracking
- Session management (sessionId, previousPage tracking)
- User agent detection (screen resolution, viewport size)
- SHA-256 hashing for sensitive data

### 2. **React Hooks** (`lib/analytics/useAnalytics.ts`)
- `usePageView()` - Automatic page view tracking
- `useAnalytics()` - Hook providing all tracking functions

### 3. **Homepage Implementation** (`pages/index.tsx`)
- ✅ Enhanced pageView tracking with sections
- ✅ User context tracking
- ✅ Session ID tracking
- ✅ Previous page tracking

## 📋 Next Steps - Remaining Pages

### **Search Page** (`pages/search.tsx`)
```typescript
usePageView({
  pageType: 'search',
  pageName: 'Flight Search',
  pageCategory: 'booking',
  searchType: 'flight',
  sections: ['search-form', 'filters', 'quick-actions']
});
```

### **Search Results** (`pages/search-results.tsx`)
```typescript
usePageView({
  pageType: 'searchResults',
  pageName: 'Search Results',
  pageCategory: 'booking',
  searchType: 'flightResults',
  sections: ['resultsList', 'filters', 'sorting']
});

// Track search context
trackSearch({
  searchId: generateSearchId(),
  origin: 'DEL',
  destination: 'MAA',
  departureDate: '2025-12-23',
  returnDate: '2025-12-25',
  passengers: 1,
  tripType: 'roundtrip',
  cabinClass: 'economy',
  originAirportName: 'Indira Gandhi International Airport',
  destinationAirportName: 'Chennai International Airport',
  originCity: 'Delhi',
  destinationCity: 'Chennai'
});
```

### **Traveller Details** (`pages/traveller-details.tsx`)
```typescript
usePageView({
  pageType: 'traveller-details',
  pageName: 'Traveller Details - TLP Airways',
  pageCategory: 'booking',
  bookingStep: 'traveller-details',
  bookingStepNumber: 1,
  totalBookingSteps: 4,
  sections: ['passengerForm', 'contactDetails', 'specialRequests'],
  passengerCount: passengers.length
});

// Track booking context
trackBooking({
  bookingId: generateBookingId(),
  pnr: generatePNR(),
  bookingStatus: 'in-progress',
  bookingStep: 'passenger-details',
  bookingStepNumber: 1,
  totalSteps: 4,
  selectedFlights: { outbound, return },
  passengers: passengersData,
  pricing: pricingData
});
```

### **Ancillary Services** (`pages/ancillary-services.tsx`)
```typescript
usePageView({
  pageType: 'ancillary-services',
  pageName: 'Ancillary Services',
  pageCategory: 'booking',
  bookingStep: 'ancillary-services',
  bookingStepNumber: 2,
  totalBookingSteps: 4,
  sections: ['seat-selection', 'meal-selection', 'baggage', 'extras']
});

// Track ancillary selection
trackCustomEvent('proceedToAncillaryServices', {
  bookingContext: { ... },
  selectedFlights: { ... },
  passengersBreakdown: { ... }
});
```

### **Payment** (`pages/payment.tsx`)
```typescript
usePageView({
  pageType: 'booking',
  pageName: 'Payment',
  pageCategory: 'booking',
  bookingStep: 'payment',
  sections: ['payment-form', 'price-breakdown', 'security-info']
});

// Track proceed to payment
trackCustomEvent('proceedToPayment', {
  bookingContext: { ... },
  selectedFlights: { ... },
  ancillaryServices: { ... },
  pricing: { ... }
});
```

### **Confirmation** (`pages/confirmation.tsx`)
```typescript
usePageView({
  pageType: 'confirmation',
  pageName: 'Booking Confirmation',
  pageCategory: 'booking',
  bookingStep: 'confirmation',
  sections: ['booking-details', 'payment-summary', 'next-steps']
});

// Track purchase
trackPurchase({
  transactionId: 'TXN...',
  totalRevenue: 25601,
  currency: 'INR',
  products: [
    { productId: 'base fare', productName: 'Flight TX9569', ... },
    { productId: 'seat', productName: 'Seat 3M', ... },
    // ... all ancillaries
  ],
  paymentMethod: 'netbanking',
  bookingReference: 'W6A3YA',
  paymentDetails: { ... },
  customer: { ... },
  searchContext: { ... }
});
```

## 🔍 Data Layer Structure Comparison

### SPA vs MPA - Feature Parity

| Feature | SPA | MPA | Status |
|---------|-----|-----|--------|
| **pageView Events** | ✅ | ✅ | Complete |
| **User Context** | ✅ | ✅ | Complete |
| **Session Tracking** | ✅ | ✅ | Complete |
| **Search Context** | ✅ | ⏳ | Utility ready, needs page implementation |
| **Booking Context** | ✅ | ⏳ | Utility ready, needs page implementation |
| **Purchase Events** | ✅ | ⏳ | Utility ready, needs page implementation |
| **Form Context** | ✅ | ⏳ | Needs implementation |
| **Ancillary Tracking** | ✅ | ⏳ | Needs implementation |
| **Consent Events** | ✅ | ✅ | Complete |
| **Hash Sensitive Data** | ✅ | ✅ | Complete |

## 📊 Testing Checklist

### Local Testing
- [ ] Open browser console at `http://localhost:3000`
- [ ] Check `window.adobeDataLayer` array
- [ ] Verify pageView event structure
- [ ] Verify userContext event
- [ ] Navigate between pages and check previousPage tracking
- [ ] Check sessionId persistence

### Console Commands for Testing
```javascript
// View data layer
console.table(window.adobeDataLayer);

// Get specific events
window.adobeDataLayer.filter(e => e.event === 'pageView');
window.adobeDataLayer.filter(e => e.event === 'userContextUpdated');

// Check session ID
sessionStorage.getItem('tlp_session_id');

// Check previous page
sessionStorage.getItem('tlp_previous_page');
```

## 🎯 Implementation Priority

1. **High Priority** (Core booking flow):
   - Search Results page
   - Traveller Details page
   - Payment page
   - Confirmation page

2. **Medium Priority** (Enhanced tracking):
   - Ancillary Services page
   - Form context tracking
   - Error tracking

3. **Low Priority** (Nice to have):
   - Profile page
   - Settings page
   - My Bookings page

## 📝 Notes

- All utility functions are SSR-safe (check `typeof window !== 'undefined'`)
- Session ID persists in sessionStorage (cleared on browser close)
- Previous page tracking uses sessionStorage
- Consent events are already integrated via ConsentContext
- SHA-256 hashing available for PII (email, phone)

## 🚀 Ready to Deploy

Once all pages are implemented, the MPA will have **full feature parity** with the SPA's Adobe Data Layer implementation!
