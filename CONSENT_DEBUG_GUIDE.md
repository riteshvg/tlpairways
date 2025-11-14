# TLAirways Consent Flow Debugging Guide

## Quick Start: Run the Debugger

1. Open https://tlpairways.thelearningproject.in in your browser
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to the **Console** tab
4. Copy and paste the entire content of `debug-consent-flow.js` and press Enter
5. Review the output for failures and warnings

---

## Manual Step-by-Step Debugging

### Step 1: Verify Data Layer Initialization

**In Console, run:**
```javascript
window.adobeDataLayer
```

**Expected Result:**
```javascript
[
  { event: "consentPreferencesUpdated", consent: {...} },
  { event: "pageView", pageData: {...} },
  ...
]
```

**❌ If undefined:** Data layer not initialized
- Check if `AirlinesDataLayer.js` is loaded
- Look for JavaScript errors in console

---

### Step 2: Check Consent in State Object

**In Console, run:**
```javascript
window._adobeDataLayerState.consent
```

**Expected Result:**
```javascript
{
  defaultConsent: "in",  // or "out" or "pending"
  action: "in",
  preferences: {
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true
  },
  categories: {...}
}
```

**❌ If `defaultConsent` is `""` or `undefined`:**
- Problem: `AirlinesDataLayer.initializeConsentState()` didn't run or failed
- Check browser console for errors during page load
- Verify `localStorage.getItem('tlairways_consent_preferences')`

---

### Step 3: Check Consent Event Position

**In Console, run:**
```javascript
window.adobeDataLayer.findIndex(e => e.event === 'consentPreferencesUpdated')
window.adobeDataLayer.findIndex(e => e.event === 'pageView')
```

**Expected Result:**
```
0  // consentPreferencesUpdated
1  // pageView (or higher)
```

**❌ If consent event comes AFTER pageView:**
- Problem: Race condition - Adobe Web SDK tries to configure after pageView fires
- Solution: Consent must be pushed in `AirlinesDataLayer.initializeConsentState()`

---

### Step 4: Verify Adobe Launch is Loaded

**In Console, run:**
```javascript
typeof _satellite
```

**Expected Result:**
```
"object"
```

**❌ If `undefined`:**
- Adobe Launch script didn't load
- Check Network tab for failed script requests
- Verify CSP headers allow `assets.adobedtm.com`
- Check if consent is blocking the script (should only block if analytics/marketing = false)

---

### Step 5: Test Data Element in Launch

**In Console, run:**
```javascript
_satellite.getVar('consentProvided')
```

**Expected Result:**
```
"in"  // or "out" or "pending"
```

**❌ If `undefined` or empty string `""`:**

#### Check if Data Element Exists:
```javascript
_satellite.availableEventEmitters
```

#### Verify Data Element Configuration in Adobe Launch:
1. Go to Adobe Data Collection UI
2. Navigate to your property
3. Go to **Data Elements** → Find `consentProvided`
4. **Verify settings:**
   - **Extension:** Data Layer
   - **Data Element Type:** Data Layer Computed State
   - **Path:** `consent.defaultConsent` (NOT `consent.action`)

---

### Step 6: Check Adobe Web SDK Configuration

**In Console, run:**
```javascript
_satellite.setDebug(true)
```

Then reload the page and watch console for:
```
[alloy] Resolve these configuration problems:
  - 'defaultConsent': Expected one of these values: ["in","out","pending"], but got "".
```

**❌ If you see this error:**

The Adobe Web SDK extension in Launch is reading an empty value for `defaultConsent`.

**Fix in Adobe Launch:**
1. Go to **Extensions** → **Adobe Experience Platform Web SDK**
2. Find the **Default Consent** field
3. Set it to read from Data Element: `%consentProvided%`
4. Or use this JavaScript:
   ```javascript
   return window._adobeDataLayerState?.consent?.defaultConsent || 'pending';
   ```

---

### Step 7: Check localStorage

**In Console, run:**
```javascript
localStorage.getItem('tlairways_consent_preferences')
```

**Expected Result (if user gave consent):**
```json
{
  "version": "2025-11-cmp",
  "updatedAt": "2025-11-14T...",
  "preferences": {
    "necessary": true,
    "functional": true,
    "analytics": true,
    "marketing": true
  },
  "action": "in",
  "source": "cmp",
  "method": "oneClick"
}
```

**If `null`:**
- User hasn't given consent yet
- Consent banner should be visible
- `defaultConsent` should be `"pending"`

---

### Step 8: Enable Adobe Experience Platform Debugger

**Install Extension:**
- Chrome: [Adobe Experience Platform Debugger](https://chrome.google.com/webstore/detail/adobe-experience-platform/bfnnokhpnncpkdmbokanobigaccjkpob)
- Firefox: [Adobe Experience Platform Debugger](https://addons.mozilla.org/en-US/firefox/addon/adobe-experience-platform-dbg/)

**Usage:**
1. Click the extension icon
2. Go to **Launch** tab
3. Check **Library Loaded** event
4. Check **Data Elements** section
5. Find `consentProvided` and verify its value

---

## Common Issues & Solutions

### Issue 1: `defaultConsent` is empty string `""`

**Root Cause:** Data Element returns empty before consent is initialized

**Solution:**
```javascript
// In Adobe Launch Data Element, use this fallback:
return window._adobeDataLayerState?.consent?.defaultConsent || 'pending';
```

---

### Issue 2: Consent event fires AFTER pageView

**Root Cause:** React component pushes pageView before `AirlinesDataLayer.initializeConsentState()` runs

**Solution:** Already fixed in code - consent is pushed during data layer initialization (before React mounts)

**Verify:**
```javascript
window.adobeDataLayer[0].event === 'consentPreferencesUpdated'
```

---

### Issue 3: Adobe Launch rules not firing

**Root Cause:** Rules may have conditions checking for consent

**Solution:**
1. Go to Adobe Launch → **Rules**
2. Find `Home Page Rule [Analytics]` and `Global Page Rule [Target]`
3. Check **Conditions** - ensure they're checking for:
   - `consent.defaultConsent` equals `"in"` OR
   - `consent.action` equals `"in"`
4. Or remove consent conditions if you want rules to fire in "pending" state

---

### Issue 4: "Library must be configured first" error

**Root Cause:** Adobe Web SDK extension can't find `defaultConsent` value

**Solution:**
1. Open Adobe Launch → **Extensions** → **Adobe Experience Platform Web SDK**
2. In **Configuration** section, find **Default Consent**
3. Set to: `%consentProvided%` (Data Element)
4. Or set to: Custom Code:
   ```javascript
   return _satellite.getVar('consentProvided') || 'pending';
   ```
5. **Publish** the library changes

---

## Testing Checklist

- [ ] Clear browser cache and localStorage
- [ ] Open homepage in incognito/private mode
- [ ] Run `debug-consent-flow.js` in console
- [ ] Check for "First visit detected" log
- [ ] Verify `defaultConsent` is `"pending"`
- [ ] Click "Accept All" on consent banner
- [ ] Verify `defaultConsent` changes to `"in"`
- [ ] Reload page
- [ ] Verify consent persists (no banner shown)
- [ ] Verify `defaultConsent` is still `"in"`
- [ ] Check Adobe rules fire successfully

---

## Need Help?

If issues persist after following this guide:

1. Export console logs (Right-click in console → Save as...)
2. Take screenshot of Adobe Experience Platform Debugger
3. Share the output of `debug-consent-flow.js`
4. Check Network tab for failed script requests

---

## Quick Reference: Expected Values

| Check | Expected Value |
|-------|----------------|
| `window.adobeDataLayer` | Array with consent event at position 0 |
| `window._adobeDataLayerState.consent.defaultConsent` | `"in"`, `"out"`, or `"pending"` |
| `_satellite` | `object` (Adobe Launch loaded) |
| `_satellite.getVar('consentProvided')` | `"in"`, `"out"`, or `"pending"` |
| `localStorage.getItem('tlairways_consent_preferences')` | JSON object or `null` |


