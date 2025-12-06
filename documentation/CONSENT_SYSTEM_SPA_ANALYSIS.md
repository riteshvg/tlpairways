# Consent Management System - SPA Implementation Analysis

## Overview
The TLAirways SPA application implements a comprehensive consent management system that integrates with Adobe Analytics and ensures GDPR/privacy compliance. The system is designed to manage user consent preferences before loading any tracking scripts.

---

## Architecture Components

### 1. **ConsentContext** (`src/context/ConsentContext.js`)
The core consent management system built with React Context API.

#### Key Features:
- **Synchronous Initialization**: Consent state is loaded synchronously from localStorage before React renders
- **Four Consent Categories**:
  - `necessary` (required, always true)
  - `functional` (optional)
  - `analytics` (optional)
  - `marketing` (optional)
- **Consent Value Mapping**:
  - `in`: User has accepted analytics OR marketing
  - `out`: User has rejected both analytics AND marketing
  - `pending`: No consent decision made yet

#### State Management:
```javascript
{
  version: '2025-11-cmp',
  updatedAt: ISO timestamp,
  preferences: {
    necessary: true,
    functional: boolean,
    analytics: boolean,
    marketing: boolean
  },
  source: 'cmp',
  method: 'oneClick' | 'granular' | 'pending',
  action: 'acceptAll' | 'rejectAll' | 'granularSave' | 'pending',
  value: 'in' | 'out' | 'pending'  // Stored directly for quick access
}
```

#### Critical Functions:

**`syncWindowState(state, pushToDataLayer)`**
- Synchronously updates `window.__tlConsentState`
- Updates `window._adobeDataLayerState.consent`
- Optionally pushes to `adobeDataLayer` array
- Called BEFORE React state updates to ensure immediate availability

**`updateConsentState(preferences, metadata)`**
- Updates consent preferences
- Syncs to window objects synchronously
- Persists to localStorage
- Sends consent event to Adobe Data Layer
- **Forces page reload** to ensure consent is properly initialized

**`calculateConsentValue(state)`**
- Determines consent value from state
- Checks stored `value` field first
- Falls back to calculating from `action` or `preferences`
- Returns both `consentValue` and `defaultConsent`

---

### 2. **Early Consent Initialization** (`public/index.html` lines 78-156)

#### Purpose:
Initialize consent state BEFORE Adobe Launch loads to prevent race conditions.

#### Implementation:
```javascript
// Executed synchronously in <head>
(function () {
  // 1. Initialize data layer state object
  if (!window._adobeDataLayerState) {
    window._adobeDataLayerState = {};
  }
  
  // 2. Initialize adobeDataLayer array with push() interceptor
  if (!window.adobeDataLayer) {
    window.adobeDataLayer = [];
    // Intercept push() to block null/undefined values
  }
  
  // 3. Load consent from localStorage SYNCHRONOUSLY
  var consentState = JSON.parse(localStorage.getItem('tlairways_consent_preferences'));
  
  // 4. Calculate consent value
  var consentValue = 'pending';
  if (consentState.action === 'acceptAll') consentValue = 'in';
  else if (consentState.action === 'rejectAll') consentValue = 'out';
  else if (consentState.preferences.analytics || consentState.preferences.marketing) {
    consentValue = 'in';
  } else {
    consentValue = 'out';
  }
  
  // 5. Set consent IMMEDIATELY (before Adobe Launch)
  window._adobeDataLayerState.consent = {
    value: consentValue,
    defaultConsent: consentValue,
    categories: consentState?.preferences
  };
})();
```

#### Why This Matters:
- Adobe Launch data elements can read `_adobeDataLayerState.consent.value` immediately
- No race conditions between consent initialization and Adobe Launch loading
- Consent is available before ANY tracking code executes

---

### 3. **Adobe Launch Consent Loader** (`public/index.html` lines 158-428)

#### Purpose:
Conditionally load Adobe Launch based on consent state.

#### Key Logic:
```javascript
function init() {
  var consentState = getConsentState();
  var consentValue = getConsentValue(consentState);
  
  // CRITICAL: Do NOT load Adobe Launch if consent is 'out'
  if (consentValue === 'out') {
    console.log('🛑 Consent is "out" - NOT loading Adobe Launch');
    return;
  }
  
  // Load Adobe Launch only if consent is 'in' or 'pending'
  injectScript();
}
```

#### Consent Value Calculation:
```javascript
function getConsentValue(consentState) {
  // 1. Check stored value field (most reliable)
  if (consentState.value === 'in' || consentState.value === 'out') {
    return consentState.value;
  }
  
  // 2. Calculate from action
  if (consentState.action === 'acceptAll') return 'in';
  if (consentState.action === 'rejectAll') return 'out';
  
  // 3. Calculate from preferences
  var hasAnalyticsOrMarketing = 
    consentState.preferences.analytics || 
    consentState.preferences.marketing;
  return hasAnalyticsOrMarketing ? 'in' : 'out';
}
```

#### Script Loading Behavior:
- **Consent = 'out'**: Adobe Launch NOT loaded at all (prevents any tracking)
- **Consent = 'pending'**: Adobe Launch loads, but `defaultConsent: 'pending'` prevents tracking
- **Consent = 'in'**: Adobe Launch loads normally, tracking enabled

---

### 4. **UI Components**

#### **ConsentBanner** (`src/components/consent/ConsentBanner.js`)
- Fixed position banner (bottom-right)
- Three action buttons:
  - **Accept All**: Sets all categories to true
  - **Reject All**: Sets only necessary to true
  - **Manage Preferences**: Opens granular consent modal
- Visible only when no consent decision exists

#### **ConsentManagementModal** (`src/components/consent/ConsentManagementModal.js`)
- Granular consent controls for each category
- Toggle switches for functional, analytics, marketing
- Necessary category always enabled (disabled toggle)
- Save button applies preferences

#### **ConsentManagerLauncher** (`src/components/consent/ConsentManagerLauncher.js`)
- Floating button to reopen consent manager
- Always accessible for users to change preferences

#### **ConsentExperience** (`src/components/consent/ConsentExperience.js`)
- Wrapper component that renders:
  - ConsentBanner (if no consent)
  - ConsentManagementModal (when opened)
  - ConsentManagerLauncher (always)

---

### 5. **Integration in App** (`src/App.js`)

```javascript
<Auth0Provider>
  <AuthProvider>
    <BookingTimerProvider>
      <ConsentProvider>  {/* Consent wraps entire app */}
        <ThemeProvider>
          <Router>
            <Navbar />
            <ConsentExperience />  {/* Consent UI */}
            <Routes>...</Routes>
          </Router>
        </ThemeProvider>
      </ConsentProvider>
    </BookingTimerProvider>
  </AuthProvider>
</Auth0Provider>
```

---

## Data Flow

### Initial Page Load (No Consent)

```
1. index.html <head> executes
   ├─ Early consent init script runs
   ├─ Checks localStorage → null
   ├─ Sets window._adobeDataLayerState.consent = { value: 'pending' }
   └─ Adobe Launch loader checks consent → 'pending'
      └─ Loads Adobe Launch with defaultConsent: 'pending'

2. React app mounts
   ├─ ConsentProvider initializes
   ├─ No stored consent found
   ├─ Sets isBannerVisible = true
   └─ Syncs consent state to window objects

3. ConsentBanner renders
   └─ User sees Accept/Reject/Manage buttons

4. Adobe Launch loads
   └─ Reads defaultConsent: 'pending' → No tracking fires
```

### User Accepts Consent

```
1. User clicks "Accept All"
   └─ ConsentProvider.acceptAll() called

2. updateConsentState() executes
   ├─ Sets preferences = { necessary: true, functional: true, analytics: true, marketing: true }
   ├─ Calculates consentValue = 'in'
   ├─ Syncs to window objects SYNCHRONOUSLY
   │  ├─ window.__tlConsentState updated
   │  └─ window._adobeDataLayerState.consent.value = 'in'
   ├─ Persists to localStorage
   ├─ Pushes consentPreferencesUpdated event to adobeDataLayer
   └─ Forces page reload

3. Page reloads
   ├─ Early consent init reads localStorage
   ├─ Finds consentValue = 'in'
   ├─ Sets window._adobeDataLayerState.consent.value = 'in'
   └─ Adobe Launch loader checks consent → 'in'
      └─ Loads Adobe Launch normally

4. Adobe Launch loads
   └─ Reads defaultConsent: 'in' → Tracking enabled
```

### User Rejects Consent

```
1. User clicks "Reject All"
   └─ ConsentProvider.rejectAll() called

2. updateConsentState() executes
   ├─ Sets preferences = { necessary: true, functional: false, analytics: false, marketing: false }
   ├─ Calculates consentValue = 'out'
   ├─ Syncs to window objects
   ├─ Persists to localStorage
   └─ Forces page reload

3. Page reloads
   ├─ Early consent init reads localStorage
   ├─ Finds consentValue = 'out'
   ├─ Sets window._adobeDataLayerState.consent.value = 'out'
   └─ Adobe Launch loader checks consent → 'out'
      └─ Does NOT load Adobe Launch at all

4. No tracking scripts loaded
   └─ User privacy fully protected
```

---

## Key Design Decisions

### 1. **Synchronous Initialization**
- Consent state loaded synchronously in `<head>` before React
- Prevents race conditions with Adobe Launch
- Ensures consent is always available to data elements

### 2. **Page Reload on Consent Change**
- Forces reload after consent update
- Ensures consent is properly initialized from localStorage
- Prevents stale consent state in memory
- Allows Adobe Launch to load/unload based on new consent

### 3. **Dual Storage Strategy**
- **localStorage**: Persistent storage across sessions
- **window objects**: Runtime access for scripts
  - `window.__tlConsentState`: Full consent state
  - `window._adobeDataLayerState.consent`: Adobe-specific format

### 4. **Consent Value Calculation**
- `in`: User accepted analytics OR marketing
- `out`: User rejected both analytics AND marketing
- `pending`: No decision made
- Stored directly in localStorage for quick access

### 5. **Script Loading Control**
- Consent = 'out' → Adobe Launch NOT loaded
- Consent = 'pending' → Adobe Launch loads but tracking disabled
- Consent = 'in' → Adobe Launch loads with tracking enabled

---

## Adobe Analytics Integration

### Data Elements Can Read Consent

```javascript
// In Adobe Launch Data Element
return window._adobeDataLayerState?.consent?.value || 'pending';
```

### Consent Event Structure

```javascript
{
  event: 'consentPreferencesUpdated',
  consent: {
    value: 'in' | 'out' | 'pending',
    defaultConsent: 'in' | 'out' | 'pending',
    version: '2025-11-cmp',
    updatedAt: '2025-12-06T...',
    preferences: {
      necessary: true,
      functional: boolean,
      analytics: boolean,
      marketing: boolean
    },
    source: 'cmp',
    method: 'oneClick' | 'granular',
    action: 'acceptAll' | 'rejectAll' | 'granularSave',
    categories: { ... }
  }
}
```

---

## Storage Schema

### localStorage Key: `tlairways_consent_preferences`

```json
{
  "version": "2025-11-cmp",
  "updatedAt": "2025-12-06T10:30:00.000Z",
  "preferences": {
    "necessary": true,
    "functional": true,
    "analytics": true,
    "marketing": false
  },
  "source": "cmp",
  "method": "granular",
  "action": "granularSave",
  "value": "in"
}
```

---

## Security Considerations

### 1. **Data Layer Push Interceptor**
Prevents null/undefined values from being pushed to adobeDataLayer:

```javascript
window.adobeDataLayer.push = function () {
  for (var i = 0; i < arguments.length; i++) {
    var item = arguments[i];
    if (item === null || item === undefined) {
      console.error('❌ BLOCKED: null/undefined push');
      continue;
    }
    originalPush.call(window.adobeDataLayer, item);
  }
};
```

### 2. **Version Control**
- Consent version stored in state
- Allows invalidating old consent formats
- Forces re-consent if version changes

### 3. **Necessary Cookies Always Enabled**
- `necessary` category cannot be disabled
- Ensures core functionality works
- Complies with GDPR requirements

---

## Testing Utilities

### Reset Consent (Browser Console)

```javascript
// Clear stored consent
localStorage.removeItem('tlairways_consent_preferences');
location.reload();
```

### Check Current Consent

```javascript
// View consent state
console.log(window.__tlConsentState);
console.log(window._adobeDataLayerState.consent);
```

### Simulate Consent Actions

```javascript
// Accept all
window.__tlConsentContext?.acceptAll();

// Reject all
window.__tlConsentContext?.rejectAll();
```

---

## Summary

The SPA consent system is a **multi-layered architecture** that ensures:

1. ✅ **Privacy First**: No tracking without explicit consent
2. ✅ **Race Condition Free**: Synchronous initialization before Adobe Launch
3. ✅ **User Control**: Granular consent management
4. ✅ **Persistent**: Consent stored across sessions
5. ✅ **Compliant**: GDPR-ready with necessary cookies always enabled
6. ✅ **Reliable**: Page reload ensures clean state after consent changes

The system integrates seamlessly with Adobe Analytics while giving users full control over their privacy preferences.
