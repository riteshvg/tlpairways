# Consent Flow Debugging with Breakpoints

## Quick Start: Auto Breakpoints

1. Open https://tlpairways.thelearningproject.in
2. Open DevTools (F12) → **Console** tab
3. Copy and paste entire content of `debug-consent-breakpoints.js`
4. Press Enter
5. **Reload the page** (Cmd+R or Ctrl+R)
6. Execution will pause at 6 key breakpoints

---

## Manual Breakpoints in Chrome DevTools

If you prefer to set breakpoints manually:

### Method 1: Set Breakpoints in Sources

1. Open DevTools → **Sources** tab
2. Press `Cmd+P` (Mac) or `Ctrl+P` (Windows) to open file search
3. Type `index.html` and press Enter
4. Find the Adobe Launch script section (around line 226-252)
5. Click line numbers to set breakpoints at:

**Key Lines to Break On:**

```javascript
// Line ~130: When defaultConsent is resolved
if (validValues.indexOf(defaultConsent) !== -1) {
  console.log('✅ defaultConsent ready:', defaultConsent);
  // SET BREAKPOINT HERE ⏸️
  resolve(defaultConsent);
}

// Line ~240: When about to load Adobe Launch
if (hasConsent || defaultConsent === 'in' || defaultConsent === 'pending') {
  console.log('✅ Loading Adobe Launch with defaultConsent:', defaultConsent);
  // SET BREAKPOINT HERE ⏸️
  injectScript();
}

// Line ~209: When script is appended to DOM
document.head.appendChild(script);
// SET BREAKPOINT HERE ⏸️
```

6. For React components:
   - Press `Cmd+P` → type `ConsentContext.js`
   - Set breakpoint at line ~145: `console.log('🔍 ConsentContext: handleScriptLoading'...`
   - Press `Cmd+P` → type `AirlinesDataLayer.js`
   - Set breakpoint at line ~202: `const defaultConsent = this.determineDefaultConsent(...`

---

### Method 2: Conditional Breakpoints

Set breakpoints that only pause when specific conditions are met:

1. Open DevTools → **Sources** tab
2. Right-click on a line number
3. Select **"Add conditional breakpoint"**
4. Enter condition

**Example Conditions:**

```javascript
// Break only when defaultConsent is 'in'
window._adobeDataLayerState?.consent?.defaultConsent === 'in'

// Break only when consent event is pushed
event && event.event === 'consentPreferencesUpdated'

// Break only when Adobe Launch script is being loaded
element.src && element.src.includes('adobedtm.com')
```

---

### Method 3: debugger Statements

Add temporary `debugger;` statements in your local code:

**In `AirlinesDataLayer.js`:**
```javascript
determineDefaultConsent(consentState) {
  debugger; // ⏸️ PAUSE HERE
  if (consentState?.preferences) {
    // ... rest of function
  }
}
```

**In `index.html`:**
```javascript
waitForDefaultConsent().then(function(defaultConsent) {
  debugger; // ⏸️ PAUSE HERE
  console.log('📊 defaultConsent received:', defaultConsent);
  // ... rest of function
});
```

---

## Breakpoint Flow Diagram

```
Page Load
    │
    ├─► [BP1] AirlinesDataLayer.initializeConsentState()
    │       │
    │       ├─► localStorage.getItem('tlairways_consent_preferences')
    │       │
    │       ├─► [BP2] determineDefaultConsent(consentState)
    │       │       │
    │       │       └─► Returns: 'in' | 'out' | 'pending'
    │       │
    │       └─► [BP3] window._adobeDataLayerState.consent = {...}
    │
    ├─► [BP4] index.html: waitForDefaultConsent()
    │       │
    │       ├─► Polls every 50ms
    │       │
    │       └─► [BP5] Resolves when defaultConsent is valid
    │
    └─► [BP6] injectScript() - Adobe Launch loads
            │
            └─► [BP7] _satellite object created
```

---

## What to Inspect at Each Breakpoint

### BP1: `initializeConsentState()`
**Inspect:**
```javascript
localStorage.getItem('tlairways_consent_preferences')
window._adobeDataLayerState
window.adobeDataLayer.length
```

### BP2: `determineDefaultConsent()`
**Inspect:**
```javascript
consentState
consentState?.preferences
this.getCookieValue('OptanonConsent')
this.isFirstVisit()
```

### BP3: Setting `consent` in state
**Inspect:**
```javascript
window._adobeDataLayerState.consent.defaultConsent
window._adobeDataLayerState.consent.action
window._adobeDataLayerState.consent.preferences
```

### BP4: `waitForDefaultConsent()` loop
**Inspect:**
```javascript
window._adobeDataLayerState?.consent?.defaultConsent
Date.now() - startTime  // Elapsed time
CHECK_INTERVAL  // Poll frequency
```

### BP5: `defaultConsent` resolved
**Inspect:**
```javascript
defaultConsent  // Should be 'in', 'out', or 'pending'
window._adobeDataLayerState.consent
window.adobeDataLayer[0]  // Should be consent event
```

### BP6: `injectScript()`
**Inspect:**
```javascript
config.url  // Adobe Launch URL
config.attrs  // Script attributes
document.getElementById('tlairways-adobe-launch')  // Should be null
```

### BP7: `_satellite` creation
**Inspect:**
```javascript
window._satellite
window._satellite.buildInfo
window._satellite.getVar('consentProvided')
```

---

## Step-by-Step Debugging Session

### 1. Clear Everything
```javascript
localStorage.clear()
sessionStorage.clear()
// Reload page (Hard refresh: Cmd+Shift+R)
```

### 2. Run with Breakpoints
- Paste `debug-consent-breakpoints.js` in console
- Reload page
- Execution pauses at BP1

### 3. At Each Breakpoint
**Press F10** (Step Over) to execute line by line  
**Press F11** (Step Into) to dive into function calls  
**Press F8** (Resume) to continue to next breakpoint

### 4. Verify at BP5 (defaultConsent resolved)
```javascript
// In console, run:
window._adobeDataLayerState.consent.defaultConsent
// Should return: "in" | "out" | "pending" (NOT empty string)
```

### 5. Verify at BP6 (Before script injection)
```javascript
// In console, run:
document.getElementById('tlairways-adobe-launch')
// Should return: null (script not yet loaded)

window._adobeDataLayerState.consent.defaultConsent
// Should return valid value
```

### 6. Verify at BP7 (After _satellite created)
```javascript
// In console, run:
_satellite.getVar('consentProvided')
// Should return: "in" | "out" | "pending"
```

---

## Common Issues & What to Look For

### Issue: `defaultConsent` is empty string `""`

**Check at BP2 (`determineDefaultConsent`):**
```javascript
consentState  // Is it null or has preferences?
consentState?.preferences?.analytics  // Is it defined?
```

**Expected:** Should return `'pending'` if no stored consent

---

### Issue: Adobe Launch loads before consent is ready

**Check at BP4 (`waitForDefaultConsent`):**
```javascript
Date.now() - startTime  // How long did it wait?
window._adobeDataLayerState?.consent?.defaultConsent  // Was it available?
```

**Expected:** Should wait until `defaultConsent` exists (typically <100ms)

---

### Issue: Race condition - consent event comes after pageView

**Check at BP1 (`initializeConsentState`):**
```javascript
window.adobeDataLayer.length  // Should be 0 at this point
window.adobeDataLayer.push  // Function should exist
```

**Then check after BP5:**
```javascript
window.adobeDataLayer[0].event  // Should be 'consentPreferencesUpdated'
window.adobeDataLayer[1].event  // Should be 'pageView'
```

---

## Remove Breakpoints

To remove auto-breakpoints:
```javascript
window.__consentDebugger.cleanup()
```

To remove manual breakpoints:
- DevTools → Sources → Right-click breakpoint → Remove breakpoint
- Or click the breakpoint icon to disable

---

## Export Debug Session

To save your debugging session:

1. Right-click in Console → **Save as...**
2. Save the log file
3. Share with team for analysis


