# Navigation Delay Analysis: Home Page → Search Page

## Problem Statement
Analyzing if there's a delay introduced when navigating from home page to `/search` page, specifically related to interact calls that fire when the page is hard reloaded.

## Current Implementation Flow

### Hard Reload to /search Page Timeline

```
[0ms]     Browser starts loading /search page
[10ms]    HTML parsing begins
[20ms]    index.html inline scripts execute:
          ├─ Initialize _adobeDataLayerState
          ├─ Initialize adobeDataLayer array
          └─ Load consent from localStorage (SYNCHRONOUS)
[25ms]    ✅ Consent initialized in _adobeDataLayerState.consent
[30ms]    Adobe Launch script loader starts:
          └─ waitForDefaultConsent() begins checking
[35ms]    ✅ waitForDefaultConsent() finds consent (should be immediate)
[40ms]    Adobe Launch script starts loading (async)
[100ms]   React app bootstrap begins
[150ms]   FlightSearch component mounts
[160ms]   usePageView hook executes (useEffect fires)
[165ms]    └─ pageViewTracker.trackPageView() called
[170ms]     └─ airlinesDataLayer.setPageDataWithView() called
[175ms]      └─ ensureConsentReady() called (SYNCHRONOUS, no delay)
[180ms]       └─ pageView event pushed to adobeDataLayer
[200ms]   Adobe Launch script finishes loading
[250ms]   Adobe Launch processes pageView event
[300ms]   Interact calls fire
```

### SPA Navigation (Home → Search) Timeline

```
[0ms]     User clicks navigation link
[10ms]    React Router updates route
[20ms]    HomePage component unmounts
[30ms]    FlightSearch component mounts
[40ms]    usePageView hook executes
[45ms]     └─ ensureConsentReady() called
[50ms]      └─ Consent already ready (from previous page)
[55ms]     └─ pageView event pushed to adobeDataLayer
[60ms]    Adobe Launch processes pageView event (already loaded)
[80ms]    Interact calls fire
```

## Key Findings

### ✅ No Blocking Delays in Code

1. **Consent Initialization**: 
   - Happens **synchronously** in `index.html` (lines 99-144)
   - No async operations or delays
   - Consent is available **before** Adobe Launch loads

2. **ensureConsentReady()**: 
   - Located in `AirlinesDataLayer.js` (line 337)
   - **Synchronous** function - no delays
   - Only initializes consent if missing (emergency fallback)

3. **usePageView Hook**:
   - Located in `hooks/usePageView.js`
   - Comment says: "Track page view IMMEDIATELY (no delay)"
   - No setTimeout or async delays

4. **setPageDataWithView()**:
   - Located in `AirlinesDataLayer.js` (line 362)
   - Calls `ensureConsentReady()` synchronously
   - Immediately pushes to data layer

### ⚠️ Potential Delay Sources

1. **Adobe Launch Consent Wait**:
   - `waitForDefaultConsent()` in `index.html` (line 193)
   - **MAX_WAIT_TIME = 3000ms** (3 seconds)
   - Checks every **CHECK_INTERVAL = 50ms**
   - **However**: Consent is initialized BEFORE this function runs, so it should resolve immediately

2. **Adobe Launch Script Loading**:
   - Script loads asynchronously (line 252: `script.async = true`)
   - Network latency can cause delays
   - Script size and CDN performance affect load time

3. **Adobe Launch Processing**:
   - After script loads, Launch needs to process the pageView event
   - Rule execution and interact call firing happens asynchronously
   - This is **not a delay we introduced** - it's Adobe Launch's normal behavior

### 🔍 The 300ms Delay (Not Applicable Here)

There IS a 300ms delay in the codebase, but it's **NOT** related to page navigation:

**Location**: `ConsentContext.js` line 338
```javascript
// CRITICAL: Add small delay to allow Adobe Launch to process consent
// This prevents race condition where pageView fires before Launch processes consent
await new Promise(resolve => setTimeout(resolve, 300));
```

**When it fires**: Only when consent is being **updated** (accept/reject), not on page load
**Impact on navigation**: **NONE** - this delay only happens when user interacts with consent banner

## Analysis: Is There a Delay?

### On Hard Reload

**Expected Behavior**:
- Consent initialized immediately (synchronous)
- Adobe Launch should find consent immediately (no wait)
- PageView event fires immediately when component mounts
- Interact calls fire after Adobe Launch processes the event

**Potential Issues**:
1. If consent initialization fails or is slow, `waitForDefaultConsent()` could wait up to 3 seconds
2. Adobe Launch script loading time (network dependent)
3. Adobe Launch processing time (normal behavior, not a delay we introduced)

### On SPA Navigation

**Expected Behavior**:
- Consent already initialized from previous page
- No consent wait needed
- PageView event fires immediately
- Interact calls fire quickly (Launch already loaded)

**No delays expected** - everything should be instant

## Recommendations

### 1. Verify Consent Initialization Speed

Add timing logs to verify consent is ready immediately:

```javascript
// In index.html, after consent initialization
console.time('consent-init');
// ... consent initialization code ...
console.timeEnd('consent-init');
```

### 2. Monitor waitForDefaultConsent() Performance

Add logging to see if it's actually waiting:

```javascript
function waitForDefaultConsent() {
  return new Promise(function(resolve) {
    var startTime = Date.now();
    var checkCount = 0;
    
    function checkConsent() {
      checkCount++;
      // ... existing check logic ...
      
      if (checkCount > 1) {
        console.warn(`⚠️ Consent check #${checkCount} - elapsed: ${Date.now() - startTime}ms`);
      }
    }
    // ... rest of function
  });
}
```

### 3. Add Performance Metrics

Track the time from page load to interact call:

```javascript
// In FlightSearch component
useEffect(() => {
  const startTime = performance.now();
  
  // Track when pageView is pushed
  const originalPush = window.adobeDataLayer.push;
  window.adobeDataLayer.push = function(...args) {
    if (args[0]?.event === 'pageView') {
      const elapsed = performance.now() - startTime;
      console.log(`📊 PageView pushed after ${elapsed.toFixed(2)}ms`);
    }
    return originalPush.apply(this, args);
  };
  
  return () => {
    window.adobeDataLayer.push = originalPush;
  };
}, []);
```

### 4. Check Network Tab

Verify in browser DevTools:
- When does Adobe Launch script start loading?
- When does it finish loading?
- When do interact calls fire?
- Is there a gap between pageView event and interact calls?

## Conclusion

**No blocking delays have been introduced in the code**. The flow is:

1. ✅ Consent initializes synchronously (no delay)
2. ✅ ensureConsentReady() is synchronous (no delay)
3. ✅ PageView tracking is immediate (no delay)
4. ⚠️ Adobe Launch script loading (network dependent, not our code)
5. ⚠️ Adobe Launch processing (normal behavior, not our code)

**If there's a perceived delay**, it's likely:
- Adobe Launch script loading time (network/CDN)
- Adobe Launch processing the pageView event (normal)
- NOT a delay in our React/consent initialization code

**Next Steps**:
1. Add performance monitoring to measure actual delays
2. Check browser Network tab to see script loading times
3. Verify consent is ready immediately (should be < 50ms)
4. Monitor interact call timing in Adobe Launch debugger

