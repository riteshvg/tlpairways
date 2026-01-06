# Destination Personalization Banner - Adobe Target Integration Guide

## Overview

A simple placeholder has been added to the results page for destination-based personalization. This placeholder is designed to be completely replaced with custom banners via Adobe Target.

**Current State**: Simple gray placeholder box with dashed border  
**Purpose**: To be replaced entirely with destination-specific banners via Adobe Target

## Banner Location

**Page**: `/results` (Search Results Page)  
**Position**: Between the search summary and flight list  
**Element ID**: `destination-personalization-banner`  
**CSS Class**: `target-destination-banner`

## Current Implementation

### Placeholder Banner

A minimal placeholder box that serves as the target for Adobe Target personalization:

```tsx
<Box
    id="destination-personalization-banner"
    className="target-destination-banner"
    sx={{
        mb: 4,
        minHeight: '200px',
        borderRadius: 2,
        border: '2px dashed #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
    }}
>
    <Typography variant="body1" color="text.secondary">
        Destination Personalization Banner Placeholder
    </Typography>
</Box>
```

**Key Properties**:
- **ID**: `destination-personalization-banner` - Use this for Adobe Target targeting
- **Class**: `target-destination-banner` - Alternative selector
- **Height**: 200px minimum (can be adjusted via Target)
- **Styling**: Simple gray background with dashed border for visibility

### Banner Structure

```tsx
<Box id="destination-personalization-banner" className="target-destination-banner">
  <Container>
    <Grid container>
      {/* Left Side - Text Content */}
      <Grid size={{ xs: 12, md: 7 }}>
        - Overline: "DISCOVER YOUR DESTINATION"
        - Heading: {City Name} (e.g., "Abu Dhabi")
        - Subheading: Promotional message
        - CTA Buttons: "Explore Deals" + "Travel Guide"
      </Grid>
      
      {/* Right Side - Visual Element */}
      <Grid size={{ xs: 12, md: 5 }}>
        - Airport code display (e.g., "AUH")
        - Airport name
        - Tags: "Popular", "Best Price"
      </Grid>
    </Grid>
  </Container>
</Box>
```

## Adobe Target Integration

### Method 1: Visual Experience Composer (VEC)

#### Step 1: Create Activity
1. Go to Adobe Target → Activities
2. Click "Create Activity" → "A/B Test" or "Experience Targeting"
3. Enter URL: `https://tlpairways.thelearningproject.in/results?destinationCode=DXB` (or any destination)

#### Step 2: Target the Banner
1. Click on the banner element
2. Use selector: `#destination-personalization-banner` or `.target-destination-banner`

#### Step 3: Customize Content

**For Dubai (DXB)**:
```javascript
// Change background gradient
document.querySelector('#destination-personalization-banner').style.background = 
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

// Change heading text
document.querySelector('#destination-personalization-banner h3').textContent = 
  'Dubai Awaits!';

// Change description
document.querySelector('#destination-personalization-banner h6').textContent = 
  'Experience luxury and adventure in Dubai. Book now and save up to 25% on selected flights!';
```

**For London (LHR)**:
```javascript
document.querySelector('#destination-personalization-banner').style.background = 
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';

document.querySelector('#destination-personalization-banner h3').textContent = 
  'London Calling!';

document.querySelector('#destination-personalization-banner h6').textContent = 
  'Explore the historic charm of London. Special fares available for early bookings!';
```

#### Step 4: Set Audience
1. Click "Add Audience"
2. Create rule: `URL Parameter` → `destinationCode` → `equals` → `DXB` (or other codes)

### Method 2: Form-Based Composer

#### Step 1: Add mbox
Add this to the banner component (already has ID):
```html
<div id="destination-personalization-banner" class="target-destination-banner mboxDefault">
  <!-- Existing content -->
</div>
```

#### Step 2: Create Offer
In Adobe Target:
1. Go to Offers → Code Offers
2. Create HTML Offer for each destination

**Example HTML Offer for Dubai**:
```html
<style>
  #destination-personalization-banner {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  }
</style>

<div style="padding: 3rem;">
  <div style="color: rgba(255, 255, 255, 0.9); font-weight: 600; letter-spacing: 2px; margin-bottom: 0.5rem;">
    DISCOVER DUBAI
  </div>
  <h2 style="color: white; font-weight: 700; font-size: 3rem; margin-bottom: 1rem;">
    Dubai Awaits!
  </h2>
  <p style="color: rgba(255, 255, 255, 0.95); font-size: 1.25rem; margin-bottom: 2rem;">
    Experience luxury shopping, stunning architecture, and world-class dining. 
    Book now and save up to 25% on selected flights!
  </p>
  <div style="display: flex; gap: 1rem;">
    <button style="background: white; color: #f5576c; padding: 1rem 2rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
      Explore Dubai Deals
    </button>
    <button style="background: transparent; color: white; padding: 1rem 2rem; border: 2px solid white; border-radius: 8px; font-weight: 600; cursor: pointer;">
      Dubai Travel Guide
    </button>
  </div>
</div>
```

#### Step 3: Create Activity
1. Choose "Form-Based Experience Composer"
2. Location: `destination-personalization-banner`
3. Add offers for different destinations
4. Set audience rules based on `destinationCode` URL parameter

### Method 3: at.js Custom Code

Add to your Target implementation:

```javascript
// In your at.js settings or page code
adobe.target.getOffer({
  mbox: "destination-personalization-banner",
  params: {
    destinationCode: new URLSearchParams(window.location.search).get('destinationCode')
  },
  success: function(offer) {
    adobe.target.applyOffer({
      mbox: "destination-personalization-banner",
      offer: offer
    });
  },
  error: function(status, error) {
    console.log('Target error:', status, error);
  }
});
```

## Destination-Specific Customizations

### Popular Destinations

#### 1. **Dubai (DXB)**
- **Theme**: Luxury & Modern
- **Colors**: Pink to Red gradient (`#f093fb` to `#f5576c`)
- **Message**: "Experience luxury shopping and world-class dining"
- **Image**: Burj Khalifa or Dubai skyline

#### 2. **London (LHR)**
- **Theme**: Historic & Cultural
- **Colors**: Blue gradient (`#4facfe` to `#00f2fe`)
- **Message**: "Explore historic landmarks and vibrant culture"
- **Image**: Big Ben or London Eye

#### 3. **Paris (CDG)**
- **Theme**: Romantic & Artistic
- **Colors**: Purple to Pink (`#a8edea` to `#fed6e3`)
- **Message**: "Discover the city of love and art"
- **Image**: Eiffel Tower

#### 4. **New York (JFK)**
- **Theme**: Urban & Dynamic
- **Colors**: Orange to Yellow (`#fa709a` to `#fee140`)
- **Message**: "Experience the city that never sleeps"
- **Image**: Statue of Liberty or NYC skyline

#### 5. **Singapore (SIN)**
- **Theme**: Modern & Green
- **Colors**: Green to Teal (`#0ba360` to `#3cba92`)
- **Message**: "Explore the garden city of Asia"
- **Image**: Marina Bay Sands

#### 6. **Tokyo (NRT/HND)**
- **Theme**: Traditional meets Modern
- **Colors**: Red to Orange (`#ee0979` to `#ff6a00`)
- **Message**: "Discover ancient temples and futuristic technology"
- **Image**: Mount Fuji or Tokyo Tower

## Testing the Banner

### Local Testing

1. **Start the development server**:
   ```bash
   cd /Users/riteshg/Documents/Learnings/tlpairways
   ./start-mpa.sh
   ```

2. **Navigate to results page** with different destinations:
   - Dubai: `http://localhost:3000/results?originCode=MAA&destinationCode=DXB&date=2026-01-26&passengers=1&tripType=oneway&cabinClass=economy`
   - London: `http://localhost:3000/results?originCode=MAA&destinationCode=LHR&date=2026-01-26&passengers=1&tripType=oneway&cabinClass=economy`
   - Abu Dhabi: `http://localhost:3000/results?originCode=MAA&destinationCode=AUH&date=2026-01-26&passengers=1&tripType=oneway&cabinClass=economy`

3. **Inspect the banner**:
   - Open DevTools
   - Find element with ID `destination-personalization-banner`
   - Test CSS changes
   - Test content modifications

### Production Testing

1. **Use Adobe Target Preview Mode**:
   - Add `?at_preview_token=YOUR_TOKEN` to URL
   - Test different experiences

2. **QA Link**:
   ```
   https://tlpairways.thelearningproject.in/results?originCode=MAA&destinationCode=DXB&date=2026-01-26&passengers=1&tripType=oneway&cabinClass=economy&at_preview_token=YOUR_TOKEN
   ```

## Analytics Tracking

### Recommended Events to Track

1. **Banner View**:
   ```javascript
   window.adobeDataLayer.push({
     event: 'destinationBannerView',
     banner: {
       destination: 'Dubai',
       destinationCode: 'DXB',
       variant: 'luxury_theme',
       position: 'results_page_top'
     }
   });
   ```

2. **CTA Click - Explore Deals**:
   ```javascript
   window.adobeDataLayer.push({
     event: 'destinationBannerCTAClick',
     cta: {
       name: 'Explore Deals',
       destination: 'Dubai',
       destinationCode: 'DXB',
       variant: 'luxury_theme'
     }
   });
   ```

3. **CTA Click - Travel Guide**:
   ```javascript
   window.adobeDataLayer.push({
     event: 'destinationBannerCTAClick',
     cta: {
       name: 'Travel Guide',
       destination: 'Dubai',
       destinationCode: 'DXB',
       variant: 'luxury_theme'
     }
   });
   ```

## Best Practices

### Content Guidelines

1. **Keep messaging concise**
   - Headline: 2-4 words
   - Description: 1-2 sentences (max 150 characters)
   - CTA: Clear action verbs

2. **Use high-quality images**
   - Minimum resolution: 1200x600px
   - Optimized for web (WebP format preferred)
   - Relevant to destination

3. **Maintain brand consistency**
   - Use TLP Airways color palette
   - Consistent typography
   - Professional imagery

### Performance Optimization

1. **Lazy load images**:
   ```javascript
   <img loading="lazy" src="destination-image.webp" alt="Dubai">
   ```

2. **Minimize DOM changes**:
   - Use CSS classes instead of inline styles when possible
   - Batch DOM updates

3. **Cache Target responses**:
   - Enable Target caching in at.js settings
   - Set appropriate TTL values

## Troubleshooting

### Banner Not Showing

1. **Check element exists**:
   ```javascript
   console.log(document.querySelector('#destination-personalization-banner'));
   ```

2. **Check Target activity is active**:
   - Verify in Adobe Target UI
   - Check audience rules

3. **Check console for errors**:
   - Look for Target errors
   - Check network tab for mbox calls

### Styling Issues

1. **CSS specificity**:
   - Use `!important` if needed
   - Increase selector specificity

2. **Z-index conflicts**:
   - Banner has `z-index: 1` on container
   - Adjust if needed

### Content Not Updating

1. **Clear Target cache**:
   - Add `?mboxDisable=true` to URL
   - Clear browser cache
   - Use incognito mode

2. **Check Target delivery**:
   - Use Adobe Experience Cloud Debugger
   - Verify mbox calls in Network tab

## Future Enhancements

### Phase 2 Ideas

1. **Dynamic Images**:
   - Add destination-specific background images
   - Use CDN for image delivery

2. **Weather Integration**:
   - Show current weather at destination
   - Display best time to visit

3. **Price Comparison**:
   - Show "X% cheaper than average"
   - Display price trends

4. **User Personalization**:
   - Show previously searched destinations
   - Recommend similar destinations

5. **Social Proof**:
   - "1,234 travelers booked this route this month"
   - Customer reviews/ratings

## Support

For questions or issues:
- **Adobe Target Support**: https://experienceleague.adobe.com/docs/target/
- **TLP Airways Dev Team**: [Your contact info]

---

**Last Updated**: 2026-01-05  
**Version**: 1.0  
**Author**: TLP Airways Development Team
