# Independent userData Object Implementation

## Overview
Implemented independent `userData` object in Adobe Data Layer that is pushed separately from `pageView` events, matching the homepage pattern across all booking pages.

## Implementation Date
December 18, 2025

## Requirement
The `userData` object should:
1. Be pushed as a **separate, independent object** to the data layer (not nested in pageView)
2. Only be present when a user is **authenticated** (signed in)
3. Persist across **all pages** from sign-in until the confirmation page
4. Follow the same structure as the homepage implementation

## Data Layer Structure

### Independent userData Object
```json
{
    "userData": {
        "isAuthenticated": true,
        "userId": "auth0|6936a0a2c89c6cc72e10dd4a",
        "userSegment": "registered"
    }
}
```

### Followed by userContextUpdated Event
```json
{
    "event": "userContextUpdated",
    "userData": {
        "isAuthenticated": true,
        "userId": "auth0|6936a0a2c89c6cc72e10dd4a",
        "userSegment": "registered"
    }
}
```

### pageView Event (with userData nested)
```json
{
    "event": "pageView",
    "pageData": {
        "pageType": "searchResults",
        "pageName": "Search Results",
        // ... other page data
        "userData": {
            "isAuthenticated": true,
            "userId": "auth0|6936a0a2c89c6cc72e10dd4a",
            "userEmail": "riteshvgupta@gmail.com",
            "userSegment": "registered",
            "hashedUserId": null,
            "hashedEmail": null
        }
    },
    "viewData": {
        "userAuthenticated": true,
        "userId": "auth0|6936a0a2c89c6cc72e10dd4a",
        // ... other view data
    }
}
```

## Files Modified

### 1. `/frontend-next/pages/results.tsx`
**Changes:**
- Added `useUser` hook import from `@auth0/nextjs-auth0/client`
- Added `pushUserContext` import from data layer utilities
- Added `useEffect` to push independent userData when user is authenticated
- Updated `trackPageView` to pass `user` parameter

**Code Added:**
```typescript
import { useUser } from '@auth0/nextjs-auth0/client';
import { pushUserContext } from '../lib/analytics/dataLayer';

// Inside component:
const { user, isLoading } = useUser();

// Push independent userData object when user is authenticated
useEffect(() => {
    if (!isLoading && user) {
        pushUserContext({
            isAuthenticated: true,
            userId: user.sub || null,
            userSegment: 'registered'
        });
        console.log('✅ Independent userData pushed for authenticated user');
    }
}, [user, isLoading]);
```

### 2. `/frontend-next/pages/traveller-details.tsx`
**Changes:**
- Added `pushUserContext` import
- Added `useEffect` to push independent userData when user is authenticated

**Code Added:**
```typescript
import { pushUserContext } from '../lib/analytics/dataLayer';

// Push independent userData object when user is authenticated
useEffect(() => {
    if (!isLoading && user) {
        pushUserContext({
            isAuthenticated: true,
            userId: user.sub || null,
            userSegment: 'registered'
        });
        console.log('✅ Independent userData pushed for authenticated user on traveller-details');
    }
}, [user, isLoading]);
```

### 3. `/frontend-next/pages/ancillary-services.tsx`
**Changes:**
- Added `pushUserContext` import
- Added `useEffect` to push independent userData when user is authenticated

**Code Added:**
```typescript
import { pushUserContext } from '../lib/analytics/dataLayer';

// Push independent userData object when user is authenticated
useEffect(() => {
    if (!isLoading && user) {
        pushUserContext({
            isAuthenticated: true,
            userId: user.sub || null,
            userSegment: 'registered'
        });
        console.log('✅ Independent userData pushed for authenticated user on ancillary-services');
    }
}, [user, isLoading]);
```

### 4. `/frontend-next/pages/payment.tsx`
**Changes:**
- Added `pushUserContext` import
- Added `useEffect` to push independent userData when user is authenticated

**Code Added:**
```typescript
import { pushUserContext } from '../lib/analytics/dataLayer';

// Push independent userData object when user is authenticated
useEffect(() => {
    if (!isLoading && user) {
        pushUserContext({
            isAuthenticated: true,
            userId: user.sub || null,
            userSegment: 'registered'
        });
        console.log('✅ Independent userData pushed for authenticated user on payment');
    }
}, [user, isLoading]);
```

### 5. `/frontend-next/pages/confirmation.tsx`
**Changes:**
- Added `pushUserContext` import
- Added `useEffect` to push independent userData when user is authenticated
- Added `isLoading` to useUser destructuring

**Code Added:**
```typescript
import { pushUserContext } from '../lib/analytics/dataLayer';

const { user, isLoading } = useUser();

// Push independent userData object when user is authenticated
useEffect(() => {
    if (!isLoading && user) {
        pushUserContext({
            isAuthenticated: true,
            userId: user.sub || null,
            userSegment: 'registered'
        });
        console.log('✅ Independent userData pushed for authenticated user on confirmation');
    }
}, [user, isLoading]);
```

## How It Works

### 1. User Authentication Flow
1. User signs in via Auth0
2. `useUser()` hook detects authenticated user
3. Each page checks `if (!isLoading && user)` condition
4. If authenticated, `pushUserContext()` is called

### 2. pushUserContext Function
Located in `/frontend-next/lib/analytics/dataLayer.ts`:

```typescript
export function pushUserContext(userData: any): void {
    const enrichedUserData = {
        ...userData,
        isAuthenticated: true,
        timestamp: new Date().toISOString()
    };

    // Push independent userData object
    pushToDataLayer({ userData: enrichedUserData });
    
    // Push userContextUpdated event
    pushToDataLayer({ 
        event: 'userContextUpdated', 
        userData: enrichedUserData 
    });

    // Persist to sessionStorage for cross-page availability
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('tlpairways_userData', JSON.stringify(enrichedUserData));
        if ((window as any)._adobeDataLayerState) {
            (window as any)._adobeDataLayerState.userData = enrichedUserData;
        }
    }
}
```

### 3. Cross-Page Persistence
- `userData` is stored in `sessionStorage` as `tlpairways_userData`
- Also stored in `window._adobeDataLayerState.userData`
- Available across all pages until session ends or user logs out

### 4. Priority Order for userData
The `pushPageView` function uses this priority:
1. **sessionStorage** - Persisted authenticated userData
2. **_adobeDataLayerState** - Current state userData
3. **pageData.user** - User passed by caller
4. **None** - No anonymous userData created if none exists

## Pages with Independent userData

✅ **Homepage** (`/frontend-next/pages/index.tsx`)
- Already implemented

✅ **Search Results** (`/frontend-next/pages/results.tsx`)
- ✅ Updated

✅ **Traveller Details** (`/frontend-next/pages/traveller-details.tsx`)
- ✅ Updated

✅ **Ancillary Services** (`/frontend-next/pages/ancillary-services.tsx`)
- ✅ Updated

✅ **Payment** (`/frontend-next/pages/payment.tsx`)
- ✅ Updated

✅ **Confirmation** (`/frontend-next/pages/confirmation.tsx`)
- ✅ Updated

## Testing

### Expected Data Layer Output (Authenticated User)
When navigating to any booking page as an authenticated user:

```javascript
window.adobeDataLayer = [
    // 1. Consent object
    {
        "userConsent": { /* ... */ }
    },
    
    // 2. Independent userData object (NEW)
    {
        "userData": {
            "isAuthenticated": true,
            "userId": "auth0|6936a0a2c89c6cc72e10dd4a",
            "userSegment": "registered"
        }
    },
    
    // 3. userContextUpdated event (NEW)
    {
        "event": "userContextUpdated",
        "userData": {
            "isAuthenticated": true,
            "userId": "auth0|6936a0a2c89c6cc72e10dd4a",
            "userSegment": "registered"
        }
    },
    
    // 4. pageView event (with userData nested)
    {
        "event": "pageView",
        "pageData": {
            "pageType": "searchResults",
            "pageName": "Search Results",
            "userData": {
                "isAuthenticated": true,
                "userId": "auth0|6936a0a2c89c6cc72e10dd4a",
                "userEmail": "riteshvgupta@gmail.com",
                "userSegment": "registered",
                "hashedUserId": null,
                "hashedEmail": null
            }
        },
        "viewData": {
            "userAuthenticated": true,
            "userId": "auth0|6936a0a2c89c6cc72e10dd4a",
            "sessionId": "tlp_1765993147928_494qv51hisa",
            "userEmail": "riteshvgupta@gmail.com"
        }
    }
]
```

### Testing Steps
1. Sign in to the application
2. Navigate to Search Results page
3. Open browser console
4. Run: `console.log(JSON.stringify(window.adobeDataLayer, null, 2))`
5. Verify independent `userData` object appears before pageView
6. Verify `userContextUpdated` event is present
7. Repeat for Traveller Details, Ancillary Services, and Payment pages

### Console Logs
Each page will log when userData is pushed:
- `✅ Independent userData pushed for authenticated user`
- `✅ Independent userData pushed for authenticated user on traveller-details`
- `✅ Independent userData pushed for authenticated user on ancillary-services`
- `✅ Independent userData pushed for authenticated user on payment`

## Benefits

### 1. Adobe Launch Compatibility
- Independent `userData` object available when Launch library is ready
- No race conditions with page load events
- Adobe Data Collection rules can reliably access userData

### 2. Consistent Structure
- Matches homepage implementation
- Same pattern across all booking pages
- Predictable data layer structure

### 3. Proper Authentication State
- Only present when user is authenticated
- No anonymous userData interfering with rules
- Clear distinction between authenticated and unauthenticated states

### 4. Cross-Page Persistence
- userData persists across navigation
- Available in sessionStorage and _adobeDataLayerState
- Survives page refreshes within session

## Related Documentation
- [Adobe Data Layer Structure](./ADOBE_DATALAYER_STRUCTURE.md)
- [MPA Migration Summary](./MPA_MIGRATION_SUMMARY.md)
- [Adobe Script Manager](./ADOBE_SCRIPT_MANAGER.md)

## Notes
- Independent userData is now pushed on ALL pages including confirmation
- userData is cleared on logout via `clearUserData()` function
- All changes are in the MPA (`frontend-next`) directory
- No changes required to SPA (`frontend`) directory

