# Adobe Target SPA Navigation Fix

## 🔴 Problem Statement

**Issue**: Adobe Target rule "Global Page Rule [Target]" doesn't fire on SPA navigation, but works on page reload or with delays.

**Root Cause**: Target rule uses "Library Loaded (Page Top)" event, which only fires once on initial page load. On SPA navigation (React Router), the DataLayer updates happen AFTER the component mounts, but Target has already executed.

---

## 🔍 Diagnosis

### **Race Condition Timeline**

```
SPA Navigation (React Router):
├─ [0ms]   User navigates (e.g., Search → Search Results)
├─ [10ms]  React Router updates route
├─ [20ms]  Old component unmounts
├─ [30ms]  New component mounts
├─ [50ms]  Adobe Target rule fires (if using "Library Loaded")
│          ❌ BUT: DataLayer hasn't been updated yet!
│          ❌ Target has stale data from previous page
├─ [100ms] React useEffect hooks execute
├─ [150ms] DataLayer.setPageDataWithView() pushes new pageView
│          ⚠️ TOO LATE - Target already fired with old data!
└─ [200ms] Component fully rendered

Page Reload (Works):
├─ [0ms]   Browser reloads entire page
├─ [50ms]  HTML parsing, scripts load
├─ [100ms] Launch library loads
├─ [120ms] "Library Loaded (Page Top)" fires
├─ [150ms] React bootstrap
├─ [200ms] Component mounts
├─ [250ms] DataLayer.setPageDataWithView() pushes pageView
│          ✅ Fresh page load - Target has no previous state
└─ [300ms] Target processes new data correctly
```

### **Why Delay/Reload Works**

- **Reload**: DOM completely rebuilds, Launch re-initializes, predictable timing
- **Delay**: Gives DataLayer time to update before Target executes
- **SPA Navigation**: React changes components instantly, but DataLayer updates are async

---

## ✅ Solution: Use Custom Event Trigger

### **Change Rule Trigger from "Library Loaded" to "Custom Event"**

Instead of:
```
Event: Library Loaded (Page Top)
```

Use:
```
Event: Custom Event
  - Event Name: pageView
  - Listen on: window.adobeDataLayer
```

This ensures Target waits for the DataLayer to push the `pageView` event before executing.

---

## 📋 Implementation Steps

### **Step 1: Update Adobe Launch Rule**

**In Adobe Data Collection (Launch):**

1. Navigate to **Rules** → Find **"Global Page Rule [Target]"**
2. Click **Edit**
3. Under **Events**:
   - Remove existing "Library Loaded (Page Top)" event
   - Click **Add** → **Core** → **Custom Event**
   - Configure:
     ```
     Event Name: pageView
     Elements Matching The CSS Selector: (leave blank)
     Specific Element: (leave blank)
     Advanced Options:
       ☑ Bubbling
       ☑ If more than one event: Apply rule each time
     ```
4. **Save** and **Publish**

### **Step 2: Verify DataLayer Events**

Your application already pushes `pageView` events on all pages:

✅ **Pages with pageView events:**
- HomePage (`useHomepageDataLayer.js`)
- Search Results (`SearchResults.js`)
- Traveller Details (`useTravellerDetailsDataLayer.js`)
- Ancillary Services (`useAncillaryServicesDataLayer.js`)
- Payment (`Payment.js`)
- Booking Confirmation (`BookingConfirmation.js`)

**No code changes needed** - all pages already push `pageView` correctly.

### **Step 3: Add Fallback for Initial Page Load (Optional)**

To maintain Target firing on **initial page load** (before React mounts), create two rules:

#### **Rule 1: Initial Page Load**
```
Name: Global Page Rule [Target - Initial Load]
Event: Library Loaded (Page Top)
Condition: 
  Custom Code → return !window._tlTargetInitialLoad;
Actions:
  1. Set Custom Code → window._tlTargetInitialLoad = true;
  2. Adobe Target → Load Target
```

#### **Rule 2: SPA Navigation**
```
Name: Global Page Rule [Target - SPA Navigation]
Event: Custom Event → pageView
Condition:
  Custom Code → return window._tlTargetInitialLoad === true;
Actions:
  Adobe Target → Load Target
```

### **Step 4: Test the Fix**

1. **Clear browser cache** and reload the page
2. **Open DevTools Console**
3. **Navigate through pages** (Home → Search → Results)
4. **Verify console logs:**
   ```
   📊 DATALAYER INITIALIZED (COMPLETE)
   🚀 ADOBE LAUNCH SCRIPT LOADED (COMPLETE)
   🎯 Adobe Target view triggered: search-results
   ```
5. **Check Adobe Debugger** to confirm Target requests firing

---

## 🎯 Alternative: Use at.js triggerView() (Already Implemented)

Your code already implements `triggerView()` for SPA navigation:

```javascript
// SearchResults.js (line 922-940)
useEffect(() => {
  const viewKey = JSON.stringify({...});
  
  if (targetViewKeyRef.current !== viewKey) {
    triggerAdobeTargetView('search-results', {
      destination: searchParams.destinationCode,
      origin: searchParams.originCode,
      tripType: searchParams.tripType,
      passengers: searchParams.passengers,
      searchId,
    });
    targetViewKeyRef.current = viewKey;
  }
}, [searchParams, searchId]);
```

**For this to work with Adobe Target:**

1. **In Adobe Target**, create an **Experience Targeting (XT)** activity
2. Use **Visual Experience Composer** or **Form-Based Composer**
3. Set **Location**: `search-results` (matches the view name)
4. Target will automatically fire when `triggerView('search-results')` is called

**Configure Target Activity:**
```
Activity Type: Experience Targeting (XT)
Delivery: At.js (Form-Based or VEC)
View Name: search-results
Audiences: (as needed)
Experiences: (define your experiences)
```

---

## 📊 Debugging Tools

### **Check Timing in Console**

Run these commands in browser console:

```javascript
// Check DataLayer initialization
console.log(window.__tlDataLayerInitTime);

// Check Launch initialization
console.log(window.__tlLaunchInitTime);

// Show complete timing summary
window.showTimingSummary();

// Check DataLayer events
window.adobeDataLayer.filter(e => e.event === 'pageView');

// Check Target views
window.adobe.target.getSettings();
```

### **Enable Target Debug Mode**

```javascript
// In console:
window.adobe.target.setDebug(true);

// Then navigate pages and watch for Target logs
```

### **Adobe Experience Platform Debugger**

1. Install [Adobe Experience Platform Debugger](https://chrome.google.com/webstore/detail/adobe-experience-platform/bfnnokhpnncpkdmbokanobigaccjkpob)
2. Open extension
3. Navigate to **Target** tab
4. Check **Mbox Requests** and **Parameters**

---

## 🔧 Configuration Summary

### **Current State (Broken)**
```
Rule: Global Page Rule [Target]
Event: Library Loaded (Page Top)
Problem: Only fires once on initial load, not on SPA navigation
Result: Target uses stale data on navigation
```

### **Fixed State (Recommended)**
```
Rule: Global Page Rule [Target]
Event: Custom Event → pageView
Benefit: Fires every time DataLayer pushes pageView
Result: Target always has fresh data
```

---

## 📝 Additional Recommendations

### **1. Add Explicit Wait in DataLayer Push**

Ensure DataLayer event fires BEFORE Target view trigger:

```javascript
// In SearchResults.js
useEffect(() => {
  if (searchParams && searchId) {
    // Push DataLayer event first
    airlinesDataLayer.setPageDataWithView({...});
    
    // Small delay before triggering Target view
    setTimeout(() => {
      triggerAdobeTargetView('search-results', {...});
    }, 50); // 50ms delay
  }
}, [searchParams, searchId]);
```

### **2. Add Target Page Parameters**

Ensure `targetPageParamsAll()` has fresh data:

```javascript
// Already implemented in adobeTargetUtils.js
window.targetPageParamsAll = function() {
  return window.__tlTargetPageParams || {};
};
```

Make sure this is updated before triggering Target:

```javascript
setTargetPageParams({
  destination: searchParams.destinationCode,
  origin: searchParams.originCode,
  ...
});
// THEN
triggerAdobeTargetView('search-results', {...});
```

### **3. Monitor Timing Logs**

Watch console for timing issues:

```
📊 DATALAYER INITIALIZED (COMPLETE)
  performanceTime: 145.20ms

🚀 ADOBE LAUNCH SCRIPT LOADED (COMPLETE)
  performanceTime: 423.50ms

⚠️ DATALAYER vs LAUNCH TIMING ANALYSIS
  timeDifference: 278.30ms
  hasOverlap: false ✅
  dataLayerFirst: true
  recommendation: No overlap detected - safe execution order
```

If you see **hasOverlap: true** or very small time differences, you may need additional synchronization.

---

## 🚨 Common Pitfalls

### **Pitfall 1: Multiple PageView Events**

**Problem**: DataLayer receives multiple `pageView` events on single page load.

**Solution**: Use `useRef` to prevent duplicate events:

```javascript
const hasFiredPageView = useRef(false);

useEffect(() => {
  if (hasFiredPageView.current) return;
  hasFiredPageView.current = true;
  
  airlinesDataLayer.setPageDataWithView({...});
}, []);
```

✅ Already implemented in your code.

### **Pitfall 2: Target Fires Before DataLayer**

**Problem**: Target rule fires before `pageView` event is pushed.

**Solution**: Use Custom Event trigger instead of "Library Loaded (Page Top)".

### **Pitfall 3: React StrictMode Double Rendering**

**Problem**: React StrictMode in development causes components to mount twice.

**Solution**: Use global flag or `useRef` to prevent duplicate initialization:

```javascript
let homepageInitialized = false;

useEffect(() => {
  if (homepageInitialized) return;
  homepageInitialized = true;
  // ... initialize
}, []);
```

✅ Already implemented in your code.

---

## ✅ Verification Checklist

After implementing the fix, verify:

- [ ] Target rule triggers on initial page load
- [ ] Target rule triggers on SPA navigation (page to page)
- [ ] No duplicate Target requests on single page
- [ ] DataLayer `pageView` event fires before Target processes
- [ ] Target receives fresh page parameters on each navigation
- [ ] Console shows timing logs without overlap warnings
- [ ] Adobe Debugger shows Target mbox requests on all pages
- [ ] No errors in browser console

---

## 📞 Support & Debugging

If issues persist:

1. **Check console for timing logs** - look for overlap warnings
2. **Enable Target debug** - `window.adobe.target.setDebug(true)`
3. **Verify DataLayer events** - `window.adobeDataLayer`
4. **Check Launch library** - verify it's loading correctly
5. **Review rule conditions** - ensure no conflicting conditions

---

**Last Updated**: January 2025  
**Status**: Ready for Implementation  
**Estimated Fix Time**: 15-30 minutes

