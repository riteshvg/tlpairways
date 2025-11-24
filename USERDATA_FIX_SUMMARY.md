# userData Availability Fix - Summary

## Changes Made

### 1. **AirlinesDataLayer.js** - Added Default userData Initialization

#### Change 1: Initialize Default userData on Data Layer Init
**File:** `/frontend/src/services/AirlinesDataLayer.js`
**Line:** ~42

Added call to `initializeDefaultUserData()` in the `initializeDataLayer()` method to ensure userData is available immediately.

#### Change 2: New Method - `initializeDefaultUserData()`
**File:** `/frontend/src/services/AirlinesDataLayer.js`
**Lines:** ~315-352

Created new method that:
- Sets default anonymous userData in `window._adobeDataLayerState.userData`
- Pushes `userDataInitialized` event to data layer array
- Ensures userData is ALWAYS available, even before Auth0 loads

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

#### Change 3: Enhanced `setUserData()` Method
**File:** `/frontend/src/services/AirlinesDataLayer.js`
**Lines:** ~439-457

Updated to:
- Add `isAuthenticated: true` flag when setting real user data
- Update `window._adobeDataLayerState.userData` (computed state)
- Push to data layer array (event history)

### 2. **useHomepageDataLayer.js** - Active User Context Updates

#### Change: Enhanced Auth0 User Data Effect
**File:** `/frontend/src/hooks/useHomepageDataLayer.js`
**Lines:** ~76-120

Updated the useEffect that monitors Auth0 authentication to:
- Push `userContextUpdated` event when authentication state changes
- Update userData with authenticated user info when logged in
- Reset to anonymous state when logged out
- Include helper function `hashUserId()` for PII protection

## How It Works

### Timeline for Anonymous User
1. ✅ Page loads → Data Layer initializes
2. ✅ `initializeDefaultUserData()` runs → Sets anonymous userData
3. ✅ `userDataInitialized` event pushed
4. ✅ **userData is now available for data elements**
5. ⏳ Auth0 loads in background (doesn't block)

### Timeline for Pre-Logged User
1. ✅ Page loads → Data Layer initializes
2. ✅ `initializeDefaultUserData()` runs → Sets anonymous userData
3. ✅ `userDataInitialized` event pushed
4. ✅ **userData is now available for data elements** (anonymous initially)
5. ⏳ Auth0 detects existing session
6. ✅ `userContextUpdated` event pushed → Updates userData
7. ✅ `trackLoginSuccess()` called → Full user profile set
8. ✅ **userData now contains authenticated user info**

### Timeline for User Login
1. ✅ User clicks login → Auth0 redirect
2. ✅ User returns → Page loads
3. ✅ Data Layer initializes with anonymous userData
4. ✅ **userData available immediately**
5. ⏳ Auth0 completes authentication
6. ✅ `userContextUpdated` event → Updates userData
7. ✅ `trackLoginSuccess()` → Full profile set
8. ✅ **userData contains authenticated info**

## Accessing userData in Adobe Launch

### Recommended Method (Computed State)
```javascript
// Always available, synchronous access
return window._adobeDataLayerState?.userData || {};
```

### Specific Properties
```javascript
// User ID
return window._adobeDataLayerState?.userData?.hashedUserId || 'anonymous';

// Authentication Status
return window._adobeDataLayerState?.userData?.isAuthenticated || false;

// Loyalty Tier
return window._adobeDataLayerState?.userData?.loyaltyTier || 'none';
```

## Key Benefits

✅ **Always Available**: userData exists from the moment the page loads
✅ **No Race Conditions**: Doesn't depend on Auth0 loading timing
✅ **Synchronous Access**: Data elements can read it immediately
✅ **Automatic Updates**: Updates when authentication state changes
✅ **Safe Defaults**: Anonymous state prevents errors
✅ **PII Protection**: Uses hashed user IDs

## Testing

To verify the fix works:

1. **Open browser console**
2. **Check initial state:**
   ```javascript
   console.log(window._adobeDataLayerState?.userData);
   // Should show anonymous userData immediately
   ```

3. **Monitor updates:**
   ```javascript
   window.adobeDataLayer.push(function(dl) {
     dl.addEventListener('adobeDataLayer:change', function(event) {
       if (event.data?.userData) {
         console.log('userData updated:', event.data.userData);
       }
     });
   });
   ```

4. **Test scenarios:**
   - Load page as anonymous user → userData should be anonymous
   - Load page as logged-in user → userData should update to authenticated
   - Login on homepage → userData should update after login

## Files Modified

1. `/frontend/src/services/AirlinesDataLayer.js`
   - Added `initializeDefaultUserData()` method
   - Updated `initializeDataLayer()` to call it
   - Enhanced `setUserData()` to update computed state

2. `/frontend/src/hooks/useHomepageDataLayer.js`
   - Enhanced Auth0 user data effect
   - Added `userContextUpdated` event pushing
   - Added `hashUserId()` helper function

## Documentation Created

1. `/USERDATA_AVAILABILITY_GUIDE.md`
   - Comprehensive guide for accessing userData
   - Data element examples
   - Best practices
   - Debugging tips

2. `/USERDATA_FIX_SUMMARY.md` (this file)
   - Summary of changes
   - How it works
   - Testing instructions

## Next Steps

1. **Test in browser** - Verify userData is available on page load
2. **Update Adobe Launch data elements** - Use recommended access methods
3. **Test all scenarios** - Anonymous, pre-logged, and login flows
4. **Monitor console logs** - Check for userData initialization messages

## Support

If you encounter any issues:
1. Check browser console for userData initialization logs
2. Verify `window._adobeDataLayerState.userData` exists
3. Check that `isAuthenticated` flag updates correctly
4. Review the comprehensive guide in `USERDATA_AVAILABILITY_GUIDE.md`
