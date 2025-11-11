# Adobe Target - Destination Trivia Banner Setup Guide

## Overview

This guide walks you through setting up Adobe Target Experience Targeting (XT) for displaying dynamic destination trivia on the Search Results page.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Adobe Target Activity Setup](#adobe-target-activity-setup)
3. [Experience HTML Templates](#experience-html-templates)
4. [Testing Instructions](#testing-instructions)
5. [Troubleshooting](#troubleshooting)
6. [Success Metrics](#success-metrics)

---

## Prerequisites

### 1. Adobe Target at.js Library

Ensure Adobe Target at.js is loaded in your `public/index.html`:

```html
<!-- Adobe Target at.js -->
<script src="//assets.adobetarget.com/[YOUR-CLIENT-CODE]/at.js"></script>
```

### 2. Component Integration

The `DestinationTriviaBanner` component is already integrated into `SearchResults.js` between the search summary and flight results.

### 3. Supported Destinations

- **BLR** - Bengaluru
- **DEL** - Delhi
- **CCU** - Kolkata
- **HYD** - Hyderabad
- **COK** - Kochi

---

## Adobe Target Activity Setup

### Step 1: Create New Activity

1. Log in to **Adobe Target**
2. Click **Activities** > **Create Activity** > **Experience Targeting**
3. Name: `Destination Trivia Banner - Search Results`
4. Select **Form-Based Experience Composer**

### Step 2: Configure Global Settings

- **Goal**: Display destination-specific trivia
- **Priority**: Medium (5/10)
- **Auto-allocate traffic**: OFF
- **Activity URL**: `https://tlpairways.up.railway.app/search-results`

### Step 3: Define the mbox

- **mbox name**: `flight-search-trivia-banner`
- **Location**: Form-based (custom mbox)

### Step 4: Create Audiences

Create 5 audiences (one per destination):

#### Audience 1: Bengaluru Travelers
- **Name**: `BLR - Bengaluru Travelers`
- **Rule**: 
  - `mbox parameter` → `destination` → `equals` → `BLR`

#### Audience 2: Delhi Travelers
- **Name**: `DEL - Delhi Travelers`
- **Rule**: 
  - `mbox parameter` → `destination` → `equals` → `DEL`

#### Audience 3: Kolkata Travelers
- **Name**: `CCU - Kolkata Travelers`
- **Rule**: 
  - `mbox parameter` → `destination` → `equals` → `CCU`

#### Audience 4: Hyderabad Travelers
- **Name**: `HYD - Hyderabad Travelers`
- **Rule**: 
  - `mbox parameter` → `destination` → `equals` → `HYD`

#### Audience 5: Kochi Travelers
- **Name**: `COK - Kochi Travelers`
- **Rule**: 
  - `mbox parameter` → `destination` → `equals` → `COK`

### Step 5: Create Experiences

For each audience, create an experience with the destination-specific HTML (see templates below).

#### Experience Configuration:
1. Click **Add Experience**
2. Select the corresponding audience (e.g., "BLR - Bengaluru Travelers")
3. Click **Add Content**
4. Select **HTML Offer**
5. Paste the HTML template (see below)
6. Click **Save**

Repeat for all 5 destinations.

---

## Experience HTML Templates

### Template for BLR - Bengaluru

```html
<div class="destination-trivia-banner target-injected-content" role="complementary" aria-label="Destination information for Bengaluru">
  <h3 class="banner-title" style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: white; letter-spacing: -0.5px;">
    🌳 Discover Bengaluru
  </h3>
  
  <div class="banner-stats" style="display: flex; gap: 16px; flex-wrap: wrap; padding: 12px 0; border-top: 1px solid rgba(255, 255, 255, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
    <span style="font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.95);">👥 12.8M</span>
    <span style="font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.95);">🌡️ 15-28°C (Pleasant year-round)</span>
  </div>

  <div class="banner-details" style="margin-top: 16px;">
    <div class="detail-item" style="margin-bottom: 12px;">
      <span style="font-size: 14px; font-weight: 600; color: white;">🚗 Getting Around: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">Moderate traffic. Metro connects key areas; avoid peak hours (8-10 AM, 5-8 PM).</span>
    </div>

    <div class="detail-item" style="margin-bottom: 12px;">
      <span style="font-size: 14px; font-weight: 600; color: white;">🍽️ Must-Try: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">Masala dosa at MTR, filter coffee, benne dosa at Vidyarthi Bhavan.</span>
    </div>

    <div class="detail-item">
      <span style="font-size: 14px; font-weight: 600; color: white;">💡 Pro Tip: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">The "Garden City" has beautiful parks - Cubbon Park & Lalbagh are perfect for morning walks.</span>
    </div>
  </div>
</div>
```

### Template for DEL - Delhi

```html
<div class="destination-trivia-banner target-injected-content" role="complementary" aria-label="Destination information for Delhi">
  <h3 class="banner-title" style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: white; letter-spacing: -0.5px;">
    🏛️ Discover Chandni Chowk
  </h3>
  
  <div class="banner-stats" style="display: flex; gap: 16px; flex-wrap: wrap; padding: 12px 0; border-top: 1px solid rgba(255, 255, 255, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
    <span style="font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.95);">👥 32.9M</span>
    <span style="font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.95);">🌡️ 7-40°C (Hot summers, cold winters)</span>
  </div>

  <div class="banner-details" style="margin-top: 16px;">
    <div class="detail-item" style="margin-bottom: 12px;">
      <span style="font-size: 14px; font-weight: 600; color: white;">🚗 Getting Around: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">Heavy traffic. Metro is your best bet. Auto-rickshaws and Uber are readily available.</span>
    </div>

    <div class="detail-item" style="margin-bottom: 12px;">
      <span style="font-size: 14px; font-weight: 600; color: white;">🍽️ Must-Try: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">Chandni Chowk street food, butter chicken at Moti Mahal, parathas at Paranthe Wali Gali.</span>
    </div>

    <div class="detail-item">
      <span style="font-size: 14px; font-weight: 600; color: white;">💡 Pro Tip: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">Check AQI before outdoor activities. Best visit: Nov-Feb when weather is pleasant.</span>
    </div>
  </div>
</div>
```

### Template for CCU - Kolkata

```html
<div class="destination-trivia-banner target-injected-content" role="complementary" aria-label="Destination information for Kolkata">
  <h3 class="banner-title" style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: white; letter-spacing: -0.5px;">
    🎭 Discover Kolkata
  </h3>
  
  <div class="banner-stats" style="display: flex; gap: 16px; flex-wrap: wrap; padding: 12px 0; border-top: 1px solid rgba(255, 255, 255, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
    <span style="font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.95);">👥 14.8M</span>
    <span style="font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.95);">🌡️ 12-35°C (Humid summers, mild winters)</span>
  </div>

  <div class="banner-details" style="margin-top: 16px;">
    <div class="detail-item" style="margin-bottom: 12px;">
      <span style="font-size: 14px; font-weight: 600; color: white;">🚗 Getting Around: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">Moderate traffic. Yellow taxis iconic. Metro connects major areas. Howrah Bridge busy during peak hours.</span>
    </div>

    <div class="detail-item" style="margin-bottom: 12px;">
      <span style="font-size: 14px; font-weight: 600; color: white;">🍽️ Must-Try: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">Kathi rolls, Park Street fish fry, rosogolla, and phuchka (local pani puri).</span>
    </div>

    <div class="detail-item">
      <span style="font-size: 14px; font-weight: 600; color: white;">💡 Pro Tip: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">The "City of Joy" comes alive during Durga Puja (Sept-Oct). Book early if visiting during festivals!</span>
    </div>
  </div>
</div>
```

### Template for HYD - Hyderabad

```html
<div class="destination-trivia-banner target-injected-content" role="complementary" aria-label="Destination information for Hyderabad">
  <h3 class="banner-title" style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: white; letter-spacing: -0.5px;">
    🕌 Discover Hyderabad
  </h3>
  
  <div class="banner-stats" style="display: flex; gap: 16px; flex-wrap: wrap; padding: 12px 0; border-top: 1px solid rgba(255, 255, 255, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
    <span style="font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.95);">👥 10.5M</span>
    <span style="font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.95);">🌡️ 15-38°C (Hot & dry climate)</span>
  </div>

  <div class="banner-details" style="margin-top: 16px;">
    <div class="detail-item" style="margin-bottom: 12px;">
      <span style="font-size: 14px; font-weight: 600; color: white;">🚗 Getting Around: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">Manageable traffic. Metro connects IT hubs. ORR links major areas efficiently.</span>
    </div>

    <div class="detail-item" style="margin-bottom: 12px;">
      <span style="font-size: 14px; font-weight: 600; color: white;">🍽️ Must-Try: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">Hyderabadi biryani at Paradise/Bawarchi, Irani chai with Osmania biscuits, haleem during Ramadan.</span>
    </div>

    <div class="detail-item">
      <span style="font-size: 14px; font-weight: 600; color: white;">💡 Pro Tip: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">Visit Charminar & Golconda Fort in the evening. HITEC City is the bustling tech hub.</span>
    </div>
  </div>
</div>
```

### Template for COK - Kochi

```html
<div class="destination-trivia-banner target-injected-content" role="complementary" aria-label="Destination information for Kochi">
  <h3 class="banner-title" style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: white; letter-spacing: -0.5px;">
    ⛵ Discover Kochi
  </h3>
  
  <div class="banner-stats" style="display: flex; gap: 16px; flex-wrap: wrap; padding: 12px 0; border-top: 1px solid rgba(255, 255, 255, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
    <span style="font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.95);">👥 2.1M</span>
    <span style="font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.95);">🌡️ 23-33°C (Tropical, monsoons Jun-Sept)</span>
  </div>

  <div class="banner-details" style="margin-top: 16px;">
    <div class="detail-item" style="margin-bottom: 12px;">
      <span style="font-size: 14px; font-weight: 600; color: white;">🚗 Getting Around: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">Light traffic. Ferry rides between islands are scenic and popular. Metro connects main areas.</span>
    </div>

    <div class="detail-item" style="margin-bottom: 12px;">
      <span style="font-size: 14px; font-weight: 600; color: white;">🍽️ Must-Try: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">Kerala sadya, Fort Kochi seafood, appam with stew, traditional Kerala thali.</span>
    </div>

    <div class="detail-item">
      <span style="font-size: 14px; font-weight: 600; color: white;">💡 Pro Tip: </span>
      <span style="font-size: 14px; color: rgba(255, 255, 255, 0.95); line-height: 1.6;">"Queen of Arabian Sea" - Don't miss Chinese fishing nets at sunset. Alleppey backwaters just 1hr away!</span>
    </div>
  </div>
</div>
```

---

## Testing Instructions

### Local Testing (Without Adobe Target)

By default the banner now renders **only when Adobe Target returns an offer**. If at.js is not loaded or no experience is active, the banner remains hidden to avoid showing stale content.

#### Ways to test locally:
1. **Connect to Adobe Target sandbox** – load at.js with sandbox credentials and enable the activity.
2. **Mock Adobe Target** – stub `window.adobe.target.getOffer` / `applyOffer` to return the HTML templates below.
3. **Use Storybook / static sandbox** – drop the HTML template directly into a test page to preview styling.

#### Expected Behavior:
- Banner stays hidden until Adobe Target injects the experience
- When an offer is delivered, it appears between the search summary and flight results
- Responsive design and animations still apply once rendered

### Testing with Adobe Target

#### Enable Adobe Target Debug Mode:

Open browser console and run:

```javascript
// Enable Target debug mode
window.adobe.target.setDebug(true);

// Check if mbox is registered
console.log('Target mboxes:', window.adobe.target.getSettings());

// Manually trigger mbox
window.adobe.target.getOffer({
  mbox: 'flight-search-trivia-banner',
  params: { destination: 'BLR' },
  success: (offer) => console.log('✅ Offer:', offer),
  error: (error) => console.error('❌ Error:', error)
});
```

#### QA Checklist:

- [ ] Banner displays for each destination (BLR, DEL, CCU, HYD, COK)
- [ ] Correct content appears for each destination
- [ ] Banner does NOT appear for unsupported destinations
- [ ] Mobile responsive design works correctly
- [ ] Emojis render properly
- [ ] Smooth animations and transitions
- [ ] No console errors
- [ ] Banner remains hidden when Target is unavailable
- [ ] Analytics tracking fires correctly

---

## Success Metrics

### Key Metrics to Track

Configure these metrics in Adobe Target:

#### 1. Banner Impressions
- **Metric Type**: Custom event
- **Event**: `bannerImpression`
- **Goal**: Track how many times the banner is displayed

#### 2. Engagement Rate
- **Metric Type**: Time on page
- **Goal**: Users spend more time on search results page

#### 3. Conversion Rate
- **Metric Type**: Conversion
- **Goal**: Higher booking rate when banner is shown

#### 4. Click-through Rate (if clickable elements added)
- **Metric Type**: Click tracking
- **Goal**: Measure user interaction with banner content

### Analytics Reporting

The component automatically tracks banner impressions:

```javascript
// Check impressions in Adobe Data Layer
window.adobeDataLayer.filter(e => e.event === 'bannerImpression');

// Example output:
// {
//   event: 'bannerImpression',
//   banner: {
//     type: 'destination-trivia',
//     destination: 'BLR',
//     location: 'search-results',
//     timestamp: '2025-11-10T...'
//   }
// }
```

---

## Troubleshooting

### Issue: Banner not appearing

**Solution:**
1. Check if `searchParams.destinationCode` is valid
2. Verify Adobe Target is loaded: `console.log(window.adobe.target)`
3. Check for console errors
4. Ensure destination is supported (BLR, DEL, CCU, HYD, COK)

### Issue: Wrong content showing

**Solution:**
1. Verify Adobe Target audience rules
2. Check mbox parameter: `console.log(destination)`
3. Clear browser cache and Target cache
4. Check Target activity is Live

### Issue: Slow loading

**Solution:**
1. Component has 3-second timeout for Target
2. If no offer arrives within the timeout, the banner remains hidden
3. Check network tab for Target requests

### Issue: Styling issues

**Solution:**
1. Verify CSS file is imported: `DestinationTriviaBanner.css`
2. Check for CSS conflicts with existing styles
3. Inspect element in DevTools

### Issue: Adobe Target not firing

**Solution:**
1. Enable debug mode: `window.adobe.target.setDebug(true)`
2. Check Target library version
3. Verify mbox name matches: `flight-search-trivia-banner`
4. Check network tab for Target calls

---

## Browser Support

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+

---

## Maintenance

### Adding New Destinations

1. **Update Component Data**: Add destination to `DESTINATION_DATA` in `DestinationTriviaBanner.js`
2. **Create Adobe Target Audience**: Follow Step 4 above
3. **Create Experience**: Follow Step 5 above with new HTML template
4. **Test**: Follow testing instructions

### Updating Existing Content

**Option 1: Adobe Target (Recommended)**
- Edit the experience HTML in Adobe Target
- Changes take effect immediately
- No code deployment needed

**Option 2: Code Update**
- Update `DESTINATION_DATA` in `DestinationTriviaBanner.js`
- Update HTML templates in this document
- Deploy changes

---

## Performance Optimization

- Component has 3-second timeout to prevent slow page loads
- Target-only rendering ensures no stale content is displayed
- CSS animations use GPU acceleration
- Minimal DOM manipulation
- Lazy loading support

---

## Accessibility

- Semantic HTML with ARIA labels
- Screen reader friendly
- Keyboard navigation support
- High contrast mode support
- Focus indicators for accessibility

---

## Contact & Support

For questions or issues:
- Check console logs for debugging information
- Review Adobe Target documentation
- Contact development team

**Last Updated**: November 10, 2025  
**Version**: 1.0.0

