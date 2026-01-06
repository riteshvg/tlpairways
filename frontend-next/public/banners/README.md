# Destination Personalization Banners

## Banner Specifications

All banners are **1200×300 pixels** (4:1 aspect ratio) - perfectly sized for the results page placeholder.

## Available Banners

| File | Destination | Theme | Size | URL Path |
|------|-------------|-------|------|----------|
| `dubai_banner_1200x300.png` | Dubai | Luxury (Purple→Pink) | 49KB | `/banners/dubai_banner_1200x300.png` |
| `london_banner_1200x300.png` | London | Historic (Navy→Blue) | 50KB | `/banners/london_banner_1200x300.png` |
| `paris_banner_1200x300.png` | Paris | Romantic (Pink→Lavender) | 47KB | `/banners/paris_banner_1200x300.png` |
| `newyork_banner_1200x300.png` | New York | Urban (Orange→Yellow) | 101KB | `/banners/newyork_banner_1200x300.png` |
| `bangalore_banner_1200x300.png` | Bangalore | Historic/Modern (Green→Teal) | 55KB | `/banners/bangalore_banner_1200x300.png` |

## Usage in Adobe Target

### Method 1: Direct Image Replacement

```html
<style>
  #destination-personalization-banner {
    background-image: url('/banners/dubai_banner_1200x300.png') !important;
    background-size: cover !important;
    background-position: center !important;
    border: none !important;
    min-height: 300px !important;
  }
  #destination-personalization-banner > * {
    display: none !important;
  }
</style>
```

### Method 2: Complete HTML Replacement

```html
<div style="width: 100%; height: 300px; border-radius: 16px; overflow: hidden;">
  <img src="/banners/dubai_banner_1200x300.png" alt="Discover Dubai" style="width: 100%; height: 100%; object-fit: cover;">
</div>
```

### Method 3: Clickable Banner

```html
<a href="/search?destination=DXB" style="display: block; width: 100%; height: 300px; border-radius: 16px; overflow: hidden;">
  <img src="/banners/dubai_banner_1200x300.png" alt="Discover Dubai" style="width: 100%; height: 100%; object-fit: cover;">
</a>
```

## Adobe Target Audience Rules

| Destination | URL Parameter | Banner File |
|-------------|---------------|-------------|
| Dubai | `destinationCode=DXB` | `dubai_banner_1200x300.png` |
| London | `destinationCode=LHR` | `london_banner_1200x300.png` |
| Paris | `destinationCode=CDG` | `paris_banner_1200x300.png` |
| New York | `destinationCode=JFK` | `newyork_banner_1200x300.png` |
| Bangalore | `destinationCode=BLR` | `bangalore_banner_1200x300.png` |

## Testing Locally

After starting your dev server, test banners at:

```
http://localhost:3000/results?originCode=MAA&destinationCode=DXB&date=2026-01-26&passengers=1&tripType=oneway
```

Replace `destinationCode=DXB` with other codes (LHR, CDG, JFK, BLR) to test different destinations.

## Production URLs

Once deployed to Railway:

```
https://tlpairways.thelearningproject.in/banners/dubai_banner_1200x300.png
https://tlpairways.thelearningproject.in/banners/london_banner_1200x300.png
https://tlpairways.thelearningproject.in/banners/paris_banner_1200x300.png
https://tlpairways.thelearningproject.in/banners/newyork_banner_1200x300.png
https://tlpairways.thelearningproject.in/banners/bangalore_banner_1200x300.png
```

## Customization

To create custom banners:
1. Use Canva, Figma, or Photopea
2. Set canvas size to **1200×300 pixels**
3. Export as PNG or JPG
4. Place in this folder
5. Update Adobe Target offers

---

**Generated**: 2026-01-06  
**Dimensions**: 1200×300px (4:1 aspect ratio)  
**Format**: PNG (JPEG data)
