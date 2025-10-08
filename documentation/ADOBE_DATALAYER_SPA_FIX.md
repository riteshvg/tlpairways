# Adobe Data Layer SPA Duplication Fix

## Problem
In Single Page Applications (SPAs), the `window.adobeDataLayer` array grows with each page navigation. When Adobe Launch data elements use array indexing like `adobeDataLayer[n].pageData.pageType`, they may pick up values from previous pages instead of the current page.

### Example of the Issue:
```javascript
// Page 1: Search Results
adobeDataLayer[0] = { event: 'pageView', pageData: { pageType: 'search-results' } }

// Page 2: Traveller Details (navigated via SPA)
adobeDataLayer[1] = { event: 'pageView', pageData: { pageType: 'traveller-details' } }

// Problem: If data element uses adobeDataLayer[0].pageData.pageType
// It will still show 'search-results' on the traveller details page!
```

## Solution Implemented

We've implemented a **Computed State Pattern** that maintains the current page data in a separate object that gets replaced (not appended) on each page change.

### How It Works

#### 1. Computed State Object
```javascript
window._adobeDataLayerState = {
  pageData: { /* current page data only */ },
  searchContext: { /* current search context */ },
  bookingContext: { /* current booking context */ },
  userContext: { /* user data - persists */ },
  eventData: { /* latest event data */ },
  _lastUpdated: '2025-10-07T04:00:00.000Z'
}
```

#### 2. Automatic Updates
Every time an event is pushed to the data layer, the relevant parts of `computedState` are automatically updated:

```javascript
// When this is pushed:
window.adobeDataLayer.push({
  event: 'pageView',
  pageData: { pageType: 'confirmation' },
  searchContext: { origin: 'DEL', destination: 'BOM' }
});

// computedState is automatically updated:
window._adobeDataLayerState = {
  pageData: { pageType: 'confirmation' },  // Replaced, not appended
  searchContext: { origin: 'DEL', destination: 'BOM' },  // Replaced
  userContext: { /* preserved from before */ }
}
```

## Implementation in Adobe Launch

### Current Approach (PROBLEMATIC):
```javascript
// Data Element: Page Type
// Path: adobeDataLayer[0].pageData.pageType
// Problem: Always gets first event, not current page
```

### New Approach (CORRECT):
```javascript
// Data Element: Page Type
// Custom Code:
return window._adobeDataLayerState 
  ? window._adobeDataLayerState.pageData?.pageType 
  : null;

// Or use the helper function:
return _satellite.getVar('airlinesDataLayer').getComputedState().pageData?.pageType;
```

## Data Element Examples

### 1. Page Data Elements
```javascript
// Page Type
return window._adobeDataLayerState?.pageData?.pageType || '';

// Page Name
return window._adobeDataLayerState?.pageData?.pageName || '';

// Page Category
return window._adobeDataLayerState?.pageData?.pageCategory || '';

// Booking Step
return window._adobeDataLayerState?.pageData?.bookingStep || '';
```

### 2. Search Context Elements
```javascript
// Origin
return window._adobeDataLayerState?.searchContext?.origin || '';

// Destination
return window._adobeDataLayerState?.searchContext?.destination || '';

// Departure Date
return window._adobeDataLayerState?.searchContext?.departureDate || '';

// Total Passengers
return window._adobeDataLayerState?.searchContext?.passengers?.total || 0;
```

### 3. Booking Context Elements
```javascript
// PNR
return window._adobeDataLayerState?.bookingContext?.pnr || '';

// Booking Step
return window._adobeDataLayerState?.bookingContext?.bookingStep || '';

// Total Passengers
return window._adobeDataLayerState?.bookingContext?.passengersBreakdown?.totalPassengers || 0;
```

### 4. Purchase Event Elements
```javascript
// Transaction ID
return window._adobeDataLayerState?.eventData?.revenue?.transactionId || '';

// Total Revenue
return window._adobeDataLayerState?.eventData?.revenue?.totalRevenue || 0;

// Payment Method
return window._adobeDataLayerState?.eventData?.paymentDetails?.paymentType || '';
```

## API Methods

### Available Methods in AirlinesDataLayer

#### `setComputedState(stateData)`
Manually set computed state (usually not needed, happens automatically):
```javascript
airlinesDataLayer.setComputedState({
  customData: { key: 'value' }
});
```

#### `clearPageState(keysToKeep)`
Clear page-specific data on navigation (preserves user context):
```javascript
// Clear all page data but keep user context
airlinesDataLayer.clearPageState(['userContext', 'sessionId']);
```

#### `getComputedState()`
Get current computed state:
```javascript
const currentState = airlinesDataLayer.getComputedState();
console.log(currentState.pageData.pageType);  // Current page only
```

## Usage in Components

### Example: usePageView Hook
```javascript
useEffect(() => {
  // Clear previous page state before setting new page data
  airlinesDataLayer.clearPageState();
  
  // Push new page view
  window.adobeDataLayer.push({
    event: 'pageView',
    pageData: { pageType: 'current-page' }
  });
  
  // computedState is automatically updated
}, [location.pathname]);
```

## Migration Guide

### Step 1: Update Data Elements in Adobe Launch
Change from:
```javascript
_satellite.getVar('Page Type')  // Old: adobeDataLayer[0].pageData.pageType
```

To:
```javascript
return window.adobeDataLayer?.computedState?.pageData?.pageType || '';
```

### Step 2: Test Each Data Element
1. Navigate through the booking flow
2. Check browser console: `window.adobeDataLayer.computedState`
3. Verify only current page data is present
4. Verify values update on each page change

### Step 3: Update Rules (if needed)
Rules that listen for events can continue as-is. The computed state is for data elements that need current page values.

## Benefits

1. ✅ **No Stale Data**: Only current page values are available
2. ✅ **Consistent Values**: Same path always returns current page data
3. ✅ **Easy Migration**: Update data elements once, works everywhere
4. ✅ **Backwards Compatible**: Event array still exists for event-based rules
5. ✅ **Memory Efficient**: State object is small, array is pruned
6. ✅ **User Context Preserved**: User/session data persists across pages

## Testing

### Console Testing
```javascript
// After navigating to confirmation page
console.log(window._adobeDataLayerState);

// Expected output:
{
  pageData: { pageType: 'confirmation', ... },
  searchContext: { origin: 'DEL', ... },
  bookingContext: { pnr: 'ABC123', ... },
  eventData: { revenue: { ... } },
  userContext: { userId: 'user@example.com', ... },
  _lastUpdated: '2025-10-07T04:00:00.000Z'
}

// Navigate to different page
// _adobeDataLayerState.pageData should immediately update to new page
```

## Troubleshooting

### Issue: Data element returns null
**Solution**: Check that the exact path exists in state:
```javascript
console.log(window._adobeDataLayerState.pageData);
```

### Issue: Old values still showing
**Solution**: Ensure the component is calling `clearPageState()` before pushing new data, or verify `pushToDataLayer` is being used (it auto-updates).

### Issue: Need to preserve custom data across pages
**Solution**: Add your key to the preserve list:
```javascript
airlinesDataLayer.clearPageState(['userContext', 'sessionId', 'yourCustomKey']);
```

## Best Practices

1. **Always use `computedState` for data elements** that need current page values
2. **Use array indexing only for event-based rules** (e.g., "when purchase event happens")
3. **Clear page state on navigation** if manually managing data layer
4. **Test data elements on each page** to verify correct values
5. **Use optional chaining** (`?.`) in data elements for safety

## Example Data Element Code

```javascript
// Data Element: Current Page Type
// Type: Custom Code
// Code:
return (function() {
  try {
    return window._adobeDataLayerState?.pageData?.pageType || '';
  } catch(e) {
    console.error('Error getting page type:', e);
    return '';
  }
})();
```

## Support

For issues or questions about the computed state pattern, check:
1. Browser console: `window._adobeDataLayerState`
2. Event array: `window.adobeDataLayer` (for event history)
3. Debug logs: Enable in `AirlinesDataLayer.js` (development mode)

