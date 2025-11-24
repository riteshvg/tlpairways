# Adobe Data Layer - userData Availability Guide

## Problem Statement
When a user is pre-logged in or logs in on the homepage, the `userData` object in `adobeDataLayer` was not immediately available, causing data element code to fail.

## Solution Implemented

### 1. **Default userData Initialization**
The `AirlinesDataLayer` now initializes a default anonymous `userData` object immediately when the data layer is created. This ensures `userData` is **always available**, even before Auth0 completes loading.

**Location:** `/frontend/src/services/AirlinesDataLayer.js`

**Default userData structure:**
```javascript
{
  hashedUserId: null,
  loyaltyTier: 'none',
  registrationDate: null,
  userSegment: 'anonymous',
  emailDomain: null,
  isEmailVerified: false,
  lastLogin: null,
  loginCount: 0,
  isAuthenticated: false
}
```

### 2. **Computed State Updates**
The `userData` object is now stored in **both** locations:
- **Data Layer Array**: `window.adobeDataLayer` (event history)
- **Computed State**: `window._adobeDataLayerState.userData` (current state)

This ensures your data elements can access userData synchronously at any time.

### 3. **Authentication State Updates**
When a user logs in or their authentication state changes:
- The `setUserData()` method updates both the array and computed state
- The homepage hook pushes `userContextUpdated` events
- The `isAuthenticated` flag is automatically set to `true`

## How to Access userData in Adobe Launch Data Elements

### Method 1: Using Computed State (Recommended)
```javascript
// This is ALWAYS available, even on initial page load
return window._adobeDataLayerState?.userData || {};
```

### Method 2: Using getState() Method
```javascript
// Adobe Data Layer standard method
return window.adobeDataLayer?.getState()?.userData || {};
```

### Method 3: Finding Latest userData Event
```javascript
// Search through data layer array for most recent userData
if (window.adobeDataLayer && window.adobeDataLayer.length > 0) {
  // Search backwards for most recent userData event
  for (let i = window.adobeDataLayer.length - 1; i >= 0; i--) {
    if (window.adobeDataLayer[i].userData) {
      return window.adobeDataLayer[i].userData;
    }
  }
}
// Fallback to computed state
return window._adobeDataLayerState?.userData || {};
```

### Method 4: Specific User Properties
```javascript
// Access specific properties
return {
  userId: window._adobeDataLayerState?.userData?.hashedUserId || 'anonymous',
  isAuthenticated: window._adobeDataLayerState?.userData?.isAuthenticated || false,
  loyaltyTier: window._adobeDataLayerState?.userData?.loyaltyTier || 'none',
  userSegment: window._adobeDataLayerState?.userData?.userSegment || 'anonymous'
};
```

## Data Element Examples

### Example 1: User ID Data Element
```javascript
// Data Element: User ID
return window._adobeDataLayerState?.userData?.hashedUserId || 'anonymous';
```

### Example 2: User Authentication Status
```javascript
// Data Element: Is Authenticated
return window._adobeDataLayerState?.userData?.isAuthenticated || false;
```

### Example 3: Loyalty Tier
```javascript
// Data Element: Loyalty Tier
return window._adobeDataLayerState?.userData?.loyaltyTier || 'none';
```

### Example 4: Complete User Object
```javascript
// Data Element: User Data Object
var userData = window._adobeDataLayerState?.userData;
if (!userData) {
  // Fallback: search data layer array
  if (window.adobeDataLayer && window.adobeDataLayer.length > 0) {
    for (var i = window.adobeDataLayer.length - 1; i >= 0; i--) {
      if (window.adobeDataLayer[i].userData) {
        userData = window.adobeDataLayer[i].userData;
        break;
      }
    }
  }
}
return userData || {
  hashedUserId: 'anonymous',
  isAuthenticated: false,
  userSegment: 'anonymous',
  loyaltyTier: 'none'
};
```

## Event Timeline

### On Page Load (Anonymous User)
1. ✅ Data Layer initialized
2. ✅ Default anonymous `userData` set in computed state
3. ✅ `userDataInitialized` event pushed
4. ✅ Page view tracked
5. ⏳ Auth0 loads in background

### On Page Load (Pre-logged User)
1. ✅ Data Layer initialized
2. ✅ Default anonymous `userData` set in computed state
3. ✅ `userDataInitialized` event pushed
4. ✅ Page view tracked
5. ⏳ Auth0 loads and detects existing session
6. ✅ `userContextUpdated` event pushed with authenticated data
7. ✅ `trackLoginSuccess` called
8. ✅ `userData` event pushed with full user profile

### On User Login
1. ✅ User clicks login
2. ✅ Auth0 redirect flow
3. ✅ User returns to homepage
4. ✅ Auth0 completes authentication
5. ✅ `userContextUpdated` event pushed
6. ✅ `trackLoginSuccess` called
7. ✅ `userData` event pushed with full user profile

## Debugging

### Check if userData is Available
```javascript
// In browser console
console.log('Computed State:', window._adobeDataLayerState?.userData);
console.log('Data Layer Array:', window.adobeDataLayer);
console.log('Latest userData:', window.adobeDataLayer.filter(e => e.userData).pop());
```

### Monitor userData Changes
```javascript
// Listen for userData updates
window.adobeDataLayer = window.adobeDataLayer || [];
window.adobeDataLayer.push(function(dl) {
  dl.addEventListener('adobeDataLayer:change', function(event) {
    if (event.data?.userData) {
      console.log('🔄 userData updated:', event.data.userData);
    }
  });
});
```

## Best Practices

1. **Always use optional chaining** (`?.`) when accessing userData properties
2. **Always provide fallback values** for when userData might not exist
3. **Use computed state** (`window._adobeDataLayerState.userData`) for synchronous access
4. **Check `isAuthenticated` flag** to determine if user data is real or anonymous
5. **Never expose PII** - always use `hashedUserId` instead of real user IDs

## Summary

With these changes:
- ✅ `userData` is **always available** in the data layer
- ✅ Works for anonymous users, pre-logged users, and newly logged-in users
- ✅ Synchronously accessible via computed state
- ✅ Automatically updates when authentication state changes
- ✅ Safe fallback values prevent data element errors

Your data elements should now work reliably at all times!
