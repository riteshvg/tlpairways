# Fix: Duplicate userData Events Resolved

## Issue
When a user signed in on the homepage, **two userData events** were being created in the Adobe Data Layer:

1. **First event** - Default anonymous userData with `hashedUserId: null`
2. **Second event** - Real authenticated userData with actual `hashedUserId` value

This created confusion and made it difficult to identify which userData event to use.

## Root Cause
The `initializeDefaultUserData()` method was doing two things:
1. Setting userData in computed state (`window._adobeDataLayerState.userData`)
2. **Pushing a `userDataInitialized` event** to the data layer array

The push to the array created the first userData event with null values.

## Solution
**Only set userData in computed state, do NOT push to the data layer array.**

### Before (Problematic Code)
```javascript
initializeDefaultUserData() {
  // ... validation code ...
  
  const defaultUserData = {
    hashedUserId: null,
    // ... other default values
  };
  
  // Set in computed state
  window._adobeDataLayerState.userData = defaultUserData;
  
  // ❌ PROBLEM: This creates the first userData event
  window.adobeDataLayer.push({
    event: 'userDataInitialized',
    userData: defaultUserData
  });
}
```

### After (Fixed Code)
```javascript
initializeDefaultUserData() {
  // ... validation code ...
  
  const defaultUserData = {
    hashedUserId: null,
    loyaltyTier: 'none',
    registrationDate: null,
    userSegment: 'anonymous',
    emailDomain: null,
    isEmailVerified: false,
    lastLogin: null,
    loginCount: 0,
    isAuthenticated: false
  };
  
  // ✅ ONLY set in computed state, do NOT push to array
  // This ensures userData is available for data elements without creating a duplicate event
  // The real userData event will be pushed when user authenticates via trackLoginSuccess()
  window._adobeDataLayerState.userData = defaultUserData;
  
  console.log('✅ Default userData initialized in computed state (no event pushed):', defaultUserData);
}
```

## How It Works Now

### Anonymous User Flow
1. Page loads
2. ✅ `initializeDefaultUserData()` sets userData in computed state (no event)
3. ✅ userData available for data elements immediately
4. ✅ **No userData event in data layer array** (clean!)

### Authenticated User Flow
1. Page loads
2. ✅ `initializeDefaultUserData()` sets anonymous userData in computed state
3. ⏳ Auth0 loads and detects session
4. ✅ `trackLoginSuccess()` called
5. ✅ **Single userData event pushed** with real hashedUserId
6. ✅ Computed state updated with authenticated userData

## Benefits

✅ **Single userData Event** - Only one userData event per authentication state
✅ **Clean Data Layer** - No duplicate events with null values
✅ **Still Available** - userData still available in computed state immediately
✅ **Better Analytics** - Easier to identify and use the correct userData

## Data Layer Structure

### Before Fix (Duplicate Events)
```javascript
window.adobeDataLayer = [
  {
    event: 'userDataInitialized',  // ❌ Duplicate with null values
    userData: {
      hashedUserId: null,
      isAuthenticated: false,
      // ... other null/default values
    }
  },
  {
    event: 'userData',  // ✅ Real userData
    userData: {
      hashedUserId: 'abc123xyz',
      isAuthenticated: true,
      loyaltyTier: 'gold',
      // ... real values
    }
  }
]
```

### After Fix (Single Event)
```javascript
window.adobeDataLayer = [
  {
    event: 'userData',  // ✅ Only one userData event
    userData: {
      hashedUserId: 'abc123xyz',
      isAuthenticated: true,
      loyaltyTier: 'gold',
      // ... real values
    }
  }
]
```

## Computed State (Always Available)
```javascript
// This is ALWAYS available, even before any events are pushed
window._adobeDataLayerState.userData = {
  hashedUserId: null,  // or real value after authentication
  isAuthenticated: false,  // or true after authentication
  // ... other values
}
```

## For Adobe Launch Data Elements

Your data elements should continue to use the **computed state** approach:

```javascript
// This works immediately and always has the latest value
return window._adobeDataLayerState?.userData?.hashedUserId || 'anonymous';
```

**Why this works:**
- Computed state is updated immediately (no event needed)
- Always has the latest userData (anonymous or authenticated)
- No need to search through data layer array

## Testing

### Test 1: Anonymous User
```javascript
// In browser console:
console.log(window.adobeDataLayer.filter(e => e.userData));
// Should return: [] (empty - no userData events)

console.log(window._adobeDataLayerState?.userData);
// Should return: { hashedUserId: null, isAuthenticated: false, ... }
```

### Test 2: Authenticated User
```javascript
// After login:
console.log(window.adobeDataLayer.filter(e => e.userData));
// Should return: [{ event: 'userData', userData: { hashedUserId: 'abc123', ... } }]
// Only ONE userData event!

console.log(window._adobeDataLayerState?.userData);
// Should return: { hashedUserId: 'abc123', isAuthenticated: true, ... }
```

## Files Modified
- `/frontend/src/services/AirlinesDataLayer.js` - `initializeDefaultUserData()` method

## Deployment
- ✅ Committed to main branch
- ✅ Pushed to origin/main
- ✅ Railway will auto-deploy

## Impact
- **Breaking Changes:** None
- **Data Elements:** Continue to work as before (using computed state)
- **Analytics:** Cleaner data layer with single userData event
- **Performance:** Slightly better (fewer events in array)

## Summary
✅ **Problem:** Duplicate userData events (one with null, one with real values)
✅ **Solution:** Only set userData in computed state, don't push event on init
✅ **Result:** Single userData event per authentication state
✅ **Impact:** Cleaner data layer, easier to use, no breaking changes

---

**Status:** ✅ Fixed and deployed
**Commit:** ed91324
**Branch:** main (synced with enhancements)
