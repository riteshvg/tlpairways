# Script Execution Sequence - TLAirways Application

This document outlines the **exact sequence** of script execution across all pages in the TLAirways application, from initial page load through React component lifecycle and Adobe Target integration.

---

## 📋 Table of Contents

1. [Initial Page Load (All Pages)](#initial-page-load-all-pages)
2. [Home Page Execution Sequence](#home-page-execution-sequence)
3. [Search Results Page Execution Sequence](#search-results-page-execution-sequence)
4. [Other Pages Execution Sequence](#other-pages-execution-sequence)
5. [Timeline Diagram](#timeline-diagram)

---

## 🚀 Initial Page Load (All Pages)

### Phase 1: HTML Parsing & Synchronous Scripts

**Execution Order:**

1. **HTML Document Parsing Starts**
   - Browser parses `index.html`
   - CSP meta tag is processed (line 15-53)

2. **Adobe Target Pre-hiding Snippet** (Lines 59-68)
   ```javascript
   // SYNCHRONOUS - Executes immediately
   // Hides .personalization-container elements with opacity: 0
   // Removes pre-hiding style after 3 seconds
   ```
   - **When**: During HTML parsing (synchronous)
   - **What**: Injects CSS to hide personalization containers
   - **Duration**: Auto-removes after 3000ms

3. **Adobe Launch Script Loader** (Lines 71-131)
   ```javascript
   // ASYNCHRONOUS - Loads in parallel
   // Checks localStorage for custom script URL
   // Creates <script> tag and appends to <head>
   ```
   - **When**: During HTML parsing (async)
   - **What**: Dynamically loads Adobe Launch script
   - **Default URL**: `https://assets.adobedtm.com/22bf1a13013f/ba7976888d86/launch-07179a193336-development.min.js`
   - **Callback**: `script.onload` fires when Launch loads

4. **Adobe Target Helper Utilities** (Lines 134-218)
   ```javascript
   // SYNCHRONOUS - Executes immediately
   // Sets up window.TLAirwaysTarget API
   // Initializes window.__tlTargetPageParams
   // Sets up targetPageParamsAll callback
   ```
   - **When**: During HTML parsing (synchronous)
   - **What**: 
     - Creates `window.TLAirwaysTarget` object
     - Initializes `window.__tlTargetPageParams` with default values
     - Sets up `window.targetPageParamsAll()` callback
     - Registers DOMContentLoaded listener

5. **DOMContentLoaded Event**
   - **When**: DOM is ready (but resources may still be loading)
   - **What**: Triggers `onDomReady()` function
   - **Actions**:
     - Sets language in `__tlTargetPageParams`
     - Calls `TLAirwaysTarget.triggerView('home')` (retries if Target not ready)

6. **Body Content**
   - `<div id="root"></div>` is rendered

---

### Phase 2: React Application Bootstrap

**Execution Order:**

7. **React Entry Point** (`index.js`)
   ```javascript
   // Executes when index.js loads
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import './index.css';
   import App from './App';
   ```
   - **When**: After HTML parsing, when `index.js` bundle loads
   - **What**: 
     - Imports React and ReactDOM
     - Imports CSS styles
     - Creates React root
     - Renders `<App />` component

8. **App Component Mount** (`App.js`)
   ```javascript
   // useEffect runs after first render
   useEffect(() => {
     globalClickTracker.init();
     console.log('🚀 TLAirways App - Build Version: 2025-01-17-v2');
   }, []);
   ```
   - **When**: After React root renders
   - **What**:
     - Initializes `GlobalClickTracker` (adds click event listener)
     - Logs build version
     - Sets up routing with React Router

9. **Route Matching**
   - React Router matches current URL to route
   - Renders corresponding page component

---

## 🏠 Home Page Execution Sequence

### Phase 3: Home Page Component Lifecycle

**Execution Order:**

10. **HomePage Component Renders** (`pages/HomePage.js`)
    ```javascript
    // Component renders
    useHomepageDataLayer(); // Hook called
    ```
    - **When**: Route matches `/`
    - **What**: Renders HomePage component

11. **useHomepageDataLayer Hook** (`hooks/useHomepageDataLayer.js`)
    ```javascript
    useEffect(() => {
      airlinesDataLayer.setPageDataWithView({
        pageType: 'home',
        pageName: 'Homepage',
        ...
      });
    }, [isAuthenticated, user?.id]);
    ```
    - **When**: After HomePage mounts
    - **What**:
      - Pushes `pageView` event to Adobe Data Layer
      - Sets page data in data layer
      - Sets previous page reference

12. **Home Component Renders** (`components/Home.js`)
    ```javascript
    useEffect(() => {
      ensureTargetPageParamsCallback();
      syncTargetForView('home', {...}, {...});
    }, []);
    ```
    - **When**: If HomePage uses `<Home />` component
    - **What**:
      - Ensures `targetPageParamsAll` callback exists
      - Sets Target page parameters
      - Triggers Adobe Target `home` view

13. **TargetContentSlot Components**
    ```javascript
    // Two slots render:
    <TargetContentSlot id="target-home-hero" />
    <TargetContentSlot id="target-home-midpage" />
    ```
    - **When**: During Home component render
    - **What**: Creates placeholder divs for Target content injection

14. **Adobe Launch Script Execution** (if loaded)
    - **When**: Asynchronously after Launch script loads
    - **What**:
      - Initializes Adobe Analytics
      - Initializes Adobe Target (at.js)
      - Executes Launch rules
      - Processes Target offers

15. **Adobe Target View Trigger** (from index.html)
    ```javascript
    // Already triggered in Phase 1, Step 5
    TLAirwaysTarget.triggerView('home', {...});
    ```
    - **When**: DOMContentLoaded (or retry if Target not ready)
    - **What**: Triggers Target view for personalization

16. **Target Content Injection**
    - **When**: After Target processes offers
    - **What**: Injects personalized content into TargetContentSlot divs
    - **Result**: `.personalization-container` opacity changes from 0 to 1

---

## 🔍 Search Results Page Execution Sequence

### Phase 3: Search Results Component Lifecycle

**Execution Order:**

17. **SearchResults Component Renders** (`components/SearchResults.js`)
    ```javascript
    // Component initializes
    const [searchParams, setSearchParams] = useState(null);
    ```
    - **When**: Route matches `/search-results`
    - **What**: Renders SearchResults component

18. **Target Page Params Callback Setup** (First useEffect)
    ```javascript
    useEffect(() => {
      ensureTargetPageParamsCallback();
    }, []);
    ```
    - **When**: Immediately after component mounts
    - **What**: Ensures `targetPageParamsAll` callback is registered

19. **Search Parameters Initialization** (Second useEffect)
    ```javascript
    useEffect(() => {
      if (location.state) {
        // Parse search parameters
        setSearchParams({...});
        setSearchId(generateSearchId());
      }
    }, [location.state]);
    ```
    - **When**: After component mounts, when location.state is available
    - **What**:
      - Extracts search parameters from navigation state
      - Generates unique search ID
      - Updates component state

20. **Flight Data Loading** (Third useEffect)
    ```javascript
    useEffect(() => {
      if (searchParams) {
        // Filter and set flights
        setOnwardFlights(filteredOnwardFlights);
        setReturnFlights(filteredReturnFlights);
      }
    }, [searchParams]);
    ```
    - **When**: After searchParams are set
    - **What**: Filters flight data based on search criteria

21. **Adobe Data Layer - Search Results Event** (Fourth useEffect)
    ```javascript
    useEffect(() => {
      if (searchParams && searchId) {
        // Push comprehensive pageView event
        airlinesDataLayer.setPageDataWithView({...});
      }
    }, [searchParams, searchId]);
    ```
    - **When**: After searchParams and searchId are available
    - **What**: Pushes `pageView` event with search context to Adobe Data Layer

22. **Adobe Target View Trigger** (Fifth useEffect)
    ```javascript
    useEffect(() => {
      if (targetViewKeyRef.current !== viewKey) {
        ensureTargetPageParamsCallback();
        setTargetPageParams({...});
        triggerAdobeTargetView('search-results', {...});
        targetViewKeyRef.current = viewKey;
      }
    }, [searchParams, searchId]);
    ```
    - **When**: After searchParams change
    - **What**:
      - Sets Target page parameters (destination, origin, tripType, etc.)
      - Triggers Target `search-results` view
      - Prevents duplicate triggers with ref check

23. **DestinationTriviaBanner Component** (Renders in JSX)
    ```javascript
    <DestinationTriviaBanner destination={searchParams.destinationCode} />
    ```
    - **When**: During SearchResults render (after searchParams set)
    - **What**: Renders banner component

24. **DestinationTriviaBanner useEffect** (`components/DestinationTriviaBanner.js`)
    ```javascript
    useEffect(() => {
      if (hasInitialized.current || !destination) return;
      hasInitialized.current = true;
      loadFromAdobeTarget(destination);
    }, [destination]);
    ```
    - **When**: After DestinationTriviaBanner mounts
    - **What**: Calls `loadFromAdobeTarget()`

25. **Adobe Target Mbox Request** (Inside DestinationTriviaBanner)
    ```javascript
    window.adobe.target.getOffer({
      mbox: 'flight-search-trivia-banner',
      params: { destination: dest, ... },
      success: (offer) => {
        window.adobe.target.applyOffer({...});
      }
    });
    ```
    - **When**: After component mounts
    - **What**:
      - Requests Target offer for `flight-search-trivia-banner` mbox
      - Passes destination parameter
      - Applies offer when received

26. **TargetContentSlot Components** (Renders in JSX)
    ```javascript
    <TargetContentSlot id="target-search-results-hero" />
    <TargetContentSlot id="target-search-results-sidebar" />
    ```
    - **When**: During SearchResults render
    - **What**: Creates placeholder divs for additional Target content

27. **Target Content Injection** (All Target Slots)
    - **When**: After Target processes offers
    - **What**: Injects personalized content into all Target slots
    - **Result**: Content becomes visible (opacity: 0 → 1)

---

## 📄 Other Pages Execution Sequence

### Traveller Details, Ancillary Services, Payment, Confirmation

**Common Pattern:**

1. **Component Renders**
   - Route matches
   - Component mounts

2. **Page View Tracking**
   ```javascript
   usePageView({...}); // or manual pageView push
   ```
   - Pushes `pageView` event to Adobe Data Layer

3. **Adobe Target View** (if implemented)
   ```javascript
   syncTargetForView('page-name', {...});
   ```
   - Sets Target page parameters
   - Triggers Target view

4. **Component-Specific Logic**
   - Form handling
   - Data processing
   - Navigation

---

## ⏱️ Timeline Diagram

```
Time →
│
├─ [0ms] HTML Parsing Starts
│   ├─ CSP Meta Tag Processed
│   ├─ Target Pre-hiding Snippet (synchronous)
│   ├─ Launch Script Loader (async, starts loading)
│   └─ Target Helper Utilities (synchronous)
│       └─ Sets up window.TLAirwaysTarget
│
├─ [~50ms] DOMContentLoaded
│   └─ onDomReady() executes
│       └─ TLAirwaysTarget.triggerView('home') [retries if needed]
│
├─ [~100ms] React Bundle Loads
│   ├─ index.js executes
│   ├─ React root created
│   └─ <App /> renders
│
├─ [~150ms] App Component Mounts
│   ├─ GlobalClickTracker.init()
│   └─ Router matches route
│
├─ [~200ms] HomePage Component Mounts
│   ├─ useHomepageDataLayer() hook
│   │   └─ Pushes pageView to data layer
│   ├─ Home component renders
│   │   ├─ syncTargetForView('home') called
│   │   └─ TargetContentSlot components render
│   └─ Adobe Launch script may still be loading...
│
├─ [~500ms] Adobe Launch Script Loads (variable timing)
│   ├─ Adobe Analytics initializes
│   ├─ Adobe Target (at.js) initializes
│   ├─ Launch rules execute
│   └─ Target offers processed
│
├─ [~600ms] Target Content Injection
│   ├─ Target views triggered
│   ├─ Offers applied to slots
│   └─ Personalization containers become visible
│
└─ [User Navigation] → Search Results Page
    ├─ [0ms] SearchResults component mounts
    ├─ [10ms] ensureTargetPageParamsCallback()
    ├─ [20ms] Search params parsed from location.state
    ├─ [30ms] Flight data filtered
    ├─ [40ms] pageView event pushed to data layer
    ├─ [50ms] Target view 'search-results' triggered
    ├─ [60ms] DestinationTriviaBanner mounts
    ├─ [70ms] Target mbox request for trivia banner
    ├─ [~500ms] Target offers received and applied
    └─ [~600ms] All Target content visible
```

---

## 🔑 Key Execution Points

### Synchronous Scripts (Blocking)
- ✅ Target Pre-hiding Snippet
- ✅ Target Helper Utilities
- ✅ React Bootstrap

### Asynchronous Scripts (Non-blocking)
- ⏳ Adobe Launch Script (loads in parallel)
- ⏳ Target Content Injection (after Launch loads)
- ⏳ React Component Lifecycle (after React loads)

### Event-Driven Scripts
- 📡 DOMContentLoaded → Target view trigger
- 📡 Component Mount → useEffect hooks
- 📡 User Interactions → Event handlers

---

## 🎯 Adobe Target Integration Points

### 1. Initial Load (index.html)
- **Script**: Target Helper Utilities
- **When**: Synchronous, during HTML parsing
- **Purpose**: Sets up Target API and triggers initial view

### 2. Home Page (Home.js)
- **Script**: `syncTargetForView('home')`
- **When**: Component mount (useEffect)
- **Purpose**: Triggers Target view for homepage personalization

### 3. Search Results (SearchResults.js)
- **Script**: `triggerAdobeTargetView('search-results')`
- **When**: After search params are set (useEffect)
- **Purpose**: Triggers Target view with search context

### 4. Destination Trivia Banner (DestinationTriviaBanner.js)
- **Script**: `window.adobe.target.getOffer()`
- **When**: Component mount (useEffect)
- **Purpose**: Requests Target offer for destination-specific content

---

## 📊 Script Dependencies

```
index.html (Target Helper)
    │
    ├─→ Adobe Launch Script (async)
    │       │
    │       └─→ Adobe Target (at.js)
    │               │
    │               └─→ Target Offers Applied
    │
    └─→ React Application
            │
            ├─→ App.js
            │       │
            │       └─→ GlobalClickTracker
            │
            └─→ Page Components
                    │
                    ├─→ HomePage
                    │       ├─→ useHomepageDataLayer
                    │       └─→ Home (Target view)
                    │
                    └─→ SearchResults
                            ├─→ Data Layer (pageView)
                            ├─→ Target view
                            └─→ DestinationTriviaBanner (Target mbox)
```

---

## 🐛 Debugging Tips

### Check Script Execution Order

1. **Open Browser Console**
   ```javascript
   // Check if Target helper is loaded
   console.log(window.TLAirwaysTarget);
   
   // Check if Target is available
   console.log(window.adobe?.target);
   
   // Check page parameters
   console.log(window.__tlTargetPageParams);
   ```

2. **Monitor Network Tab**
   - Filter by "target" or "launch"
   - Check timing of script loads
   - Verify Target API calls

3. **React DevTools**
   - Monitor component mount order
   - Check useEffect execution
   - Verify state updates

4. **Adobe Target Debug Mode**
   ```javascript
   window.adobe.target.setDebug(true);
   ```

---

## 📝 Summary

**Execution Priority:**
1. **Synchronous HTML scripts** (Target pre-hiding, helpers)
2. **React bootstrap** (index.js, App.js)
3. **Component lifecycle** (mount, useEffect hooks)
4. **Adobe Launch/Target** (async, may complete after React)
5. **Target content injection** (after Target processes offers)

**Key Insight:**
- Target helper utilities are **synchronous** and execute **before** React
- Target view triggers use **retry logic** to wait for Target to load
- Component-level Target calls happen **after** React mounts
- All Target content injection is **asynchronous** and non-blocking

---

**Last Updated**: January 2025  
**Version**: 1.0.0

