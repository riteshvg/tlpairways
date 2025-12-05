# SPA vs MPA: Technical Architecture Comparison

**Purpose:** Understand the technical differences to guide migration decisions

---

## Current Architecture (SPA)

### Technology Stack
```
Frontend: React 18 (SPA)
Router: React Router v6
State: React Context API
Styling: Material-UI v5
Auth: Auth0 React SDK
Analytics: Adobe Data Layer (client-side)
Build: Create React App
Deployment: Railway (static files + Express backend)
```

### Request Flow
```
User → Browser
  ↓
Load index.html (minimal HTML)
  ↓
Download React bundle (576KB gzipped)
  ↓
React hydrates
  ↓
Initialize data layer
  ↓
Load Adobe Launch
  ↓
Render page
  ↓
User navigates → Client-side routing (no page reload)
```

### Pros ✅
- Smooth navigation (no page reloads)
- Rich interactions
- Shared state across routes
- Single deployment

### Cons ❌
- Large initial bundle
- SEO challenges
- Adobe tracking race conditions
- Complex state management
- Slow initial load

---

## Target Architecture (MPA)

### Technology Stack
```
Frontend: Next.js 14 (React-based MPA)
Router: Next.js file-based routing
State: Server-side (sessions/cookies) + React state (per-page)
Styling: Material-UI v5 (same)
Auth: Auth0 Next.js SDK
Analytics: Adobe Data Layer (server-side init)
Build: Next.js
Deployment: Vercel/Railway (SSR + API routes)
```

### Request Flow
```
User → Browser
  ↓
Request page from server
  ↓
Server renders HTML (with data)
  ↓
Send complete HTML to browser
  ↓
Browser displays page immediately
  ↓
Download page-specific JS bundle (~100KB)
  ↓
React hydrates (interactive)
  ↓
User navigates → New page request (full page load)
```

### Pros ✅
- Fast initial load (HTML ready)
- Better SEO (server-rendered)
- Reliable Adobe tracking (server-side init)
- Simpler per-page state
- Smaller per-page bundles
- Progressive enhancement

### Cons ❌
- Full page reloads on navigation
- More server resources needed
- Slightly more complex deployment

---

## Key Differences

| Aspect | SPA | MPA |
|--------|-----|-----|
| **Initial Load** | Slow (576KB JS) | Fast (HTML ready) |
| **Navigation** | Instant (client-side) | Full reload |
| **SEO** | Poor (JS-dependent) | Excellent (HTML) |
| **State Management** | Complex (global) | Simple (per-page) |
| **Adobe Tracking** | Race conditions | Reliable |
| **Bundle Size** | Large (all pages) | Small (per page) |
| **Server Load** | Low | Medium |
| **Deployment** | Simple | Medium |
| **Development** | Familiar | Learning curve |

---

## Adobe Data Layer: SPA vs MPA

### SPA (Current Issues)

**Problem:**
```javascript
// index.html loads
window.adobeDataLayer = [];

// Adobe Launch loads immediately
<script src="launch.min.js"></script>

// React mounts later (100-500ms delay)
useEffect(() => {
  adobeDataLayer.push({ event: 'pageView', ... });
}, []);

// Result: Launch fires before pageView exists → Timeout errors
```

**Workarounds Needed:**
- Delayed Adobe Launch loading
- Timeout overrides
- Enrichment logic
- Route change tracking

### MPA (Clean Solution)

**Solution:**
```javascript
// Server renders HTML with data
<script>
  window.adobeDataLayer = [];
  
  // Push pageView BEFORE Adobe Launch
  adobeDataLayer.push({
    event: 'pageView',
    pageData: { /* server-rendered data */ }
  });
</script>

// THEN load Adobe Launch
<script src="launch.min.js"></script>

// Result: Data always ready → No timeouts!
```

**Benefits:**
- No race conditions
- No workarounds needed
- Reliable tracking
- Simpler code

---

## Migration Strategy: Why Next.js?

### Alternative 1: Vanilla HTML + Express
```
Pros:
- Simplest approach
- No framework overhead
- Full control

Cons:
- Lose React components (need complete rewrite)
- Lose Material-UI (need CSS rewrite)
- More manual work
- No modern tooling
```

### Alternative 2: Next.js (Recommended)
```
Pros:
- Keep React components (minimal changes)
- Keep Material-UI (same theme)
- Modern tooling (built-in optimization)
- File-based routing (simple)
- API routes (can replace backend)
- SSR + SSG (best of both worlds)
- Large community

Cons:
- Learning curve
- Opinionated structure
- Vendor lock-in (minor)
```

### Alternative 3: Remix
```
Pros:
- Modern React framework
- Excellent data loading
- Web standards focused

Cons:
- Smaller community
- Less mature
- Steeper learning curve
```

**Decision:** **Next.js** - Best balance of power and familiarity

---

## Component Migration Example

### SPA Component (Current)
```javascript
// pages/HomePage.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Push pageView to data layer
    window.adobeDataLayer.push({
      event: 'pageView',
      pageData: { pageType: 'home', ... }
    });
  }, []);

  const handleSearch = (data) => {
    navigate('/search-results', { state: data });
  };

  return <div>Homepage Content</div>;
}
```

### MPA Component (Next.js)
```javascript
// pages/index.js
import { useUser } from '@auth0/nextjs-auth0/client';

export default function HomePage() {
  const { user } = useUser();

  const handleSearch = (data) => {
    // Navigate with URL params instead of state
    const params = new URLSearchParams(data);
    window.location.href = `/search-results?${params}`;
  };

  return <div>Homepage Content</div>;
}

// Server-side: Push pageView before page loads
export async function getServerSideProps() {
  // Data fetching if needed
  return { props: {} };
}
```

**Changes:**
1. ✅ Component logic stays the same
2. ✅ UI stays the same
3. ❌ Remove `useEffect` for pageView (done server-side)
4. ❌ Change navigation (URL params instead of state)
5. ❌ Change auth hook (`useAuth` → `useUser`)

**Migration Effort:** Low (mostly mechanical changes)

---

## State Management Migration

### SPA (React Context)
```javascript
// Booking state shared across routes
<BookingContext.Provider value={booking}>
  <Routes>
    <Route path="/search" element={<Search />} />
    <Route path="/traveller" element={<Traveller />} />
    <Route path="/payment" element={<Payment />} />
  </Routes>
</BookingContext.Provider>

// Access anywhere
const { booking, setBooking } = useBooking();
```

### MPA (Session/Cookies)
```javascript
// Store in server session
// pages/api/booking/save.js
export default async function handler(req, res) {
  req.session.booking = req.body;
  res.json({ success: true });
}

// Retrieve in page
// pages/traveller.js
export async function getServerSideProps({ req }) {
  const booking = req.session.booking;
  return { props: { booking } };
}
```

**Benefits:**
- State persists across page reloads
- No prop drilling
- Server-side validation
- More secure

---

## Routing Migration

### SPA (React Router)
```javascript
// App.js
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/search" element={<Search />} />
  <Route path="/profile" element={<Profile />} />
</Routes>

// Navigate
navigate('/search', { state: { data } });
```

### MPA (Next.js File-based)
```
pages/
  index.js          → /
  search.js         → /search
  profile.js        → /profile
  search-results.js → /search-results

// Navigate
window.location.href = '/search?from=BOM&to=DEL';
```

**Benefits:**
- No route configuration needed
- Automatic code splitting
- Clear file structure

---

## API Integration Migration

### SPA (Axios to Backend)
```javascript
// Call Express backend
const response = await axios.get('http://localhost:3001/api/flights');
```

### MPA (Options)

**Option A: Keep Backend**
```javascript
// Still call Express backend
const response = await fetch('http://localhost:3001/api/flights');
```

**Option B: Next.js API Routes**
```javascript
// pages/api/flights.js
export default async function handler(req, res) {
  const flights = await getFlights();
  res.json(flights);
}

// Call from page
const response = await fetch('/api/flights');
```

**Option C: Hybrid (Recommended)**
```javascript
// Simple endpoints → Next.js API routes
/api/airports → pages/api/airports.js

// Complex endpoints → Keep in Express
/api/bookings → Express backend
/api/payments → Express backend
```

---

## Deployment Comparison

### SPA Deployment
```
Build: npm run build
  ↓
Output: Static files (HTML + JS + CSS)
  ↓
Deploy: Upload to Railway static hosting
  ↓
Backend: Separate Express server
```

### MPA Deployment
```
Build: npm run build
  ↓
Output: Next.js server + static files
  ↓
Deploy: Deploy to Vercel/Railway (SSR)
  ↓
Backend: Optional (can use API routes)
```

**Deployment Options:**
1. **Vercel** (Recommended for Next.js)
   - Zero config
   - Automatic scaling
   - Edge functions
   - Free tier

2. **Railway** (Current platform)
   - Works with Next.js
   - Need to configure SSR
   - Same platform as SPA

3. **Self-hosted**
   - Full control
   - More work
   - Need to manage server

---

## Performance Comparison

### SPA Performance
```
Initial Load:
- HTML: 2KB
- JS: 576KB (gzipped)
- Total: 578KB
- Time to Interactive: 3-5s

Navigation:
- Time: Instant (0ms)
- No network request

SEO:
- Score: 60/100 (JS-dependent)
```

### MPA Performance (Estimated)
```
Initial Load:
- HTML: 50KB (with content)
- JS: 100KB (page-specific)
- Total: 150KB
- Time to Interactive: 1-2s

Navigation:
- Time: 200-500ms (full page load)
- Network request required

SEO:
- Score: 95/100 (HTML-based)
```

**Winner:** MPA for initial load, SPA for navigation

---

## Testing Strategy Comparison

### SPA Testing
```javascript
// Component test
render(<HomePage />);
expect(screen.getByText('Welcome')).toBeInTheDocument();

// Navigation test
fireEvent.click(searchButton);
expect(mockNavigate).toHaveBeenCalledWith('/search');
```

### MPA Testing
```javascript
// Page test (same)
render(<HomePage />);
expect(screen.getByText('Welcome')).toBeInTheDocument();

// Navigation test (different)
fireEvent.click(searchButton);
expect(window.location.href).toBe('/search');

// Server-side test (new)
const { props } = await getServerSideProps({ req, res });
expect(props.user).toBeDefined();
```

**Additional Testing:**
- Server-side rendering tests
- API route tests
- Session management tests

---

## Cost Comparison

### SPA (Current)
```
Railway:
- Frontend: $5/month (static)
- Backend: $5/month (Express)
- Total: $10/month
```

### MPA (Estimated)
```
Option A: Vercel + Railway Backend
- Vercel: Free (hobby tier)
- Railway Backend: $5/month
- Total: $5/month

Option B: Railway Only
- Next.js SSR: $10/month
- Total: $10/month

Option C: Vercel (API routes replace backend)
- Vercel Pro: $20/month
- Total: $20/month
```

**Recommendation:** Option A (Vercel + Railway Backend)

---

## Migration Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Timeline overrun | Medium | High | Add buffer, prioritize |
| Breaking changes | Low | High | Thorough testing |
| Performance regression | Low | Medium | Performance testing |
| Analytics data loss | Low | High | Extensive analytics testing |
| Team learning curve | Medium | Medium | Training, documentation |
| Deployment issues | Low | High | Staging environment |

---

## Decision Matrix

### Should We Migrate?

**YES if:**
- ✅ Adobe tracking issues are critical
- ✅ SEO is important
- ✅ Initial load performance matters
- ✅ Team is willing to learn Next.js
- ✅ Have 3 months for migration

**NO if:**
- ❌ SPA is working fine
- ❌ Navigation speed is critical
- ❌ Team is not ready for change
- ❌ Timeline is too tight
- ❌ Resources are limited

**Recommendation:** **YES** - Adobe tracking issues justify migration

---

## Summary

### Key Takeaways

1. **MPA solves Adobe tracking issues** - No more race conditions
2. **Next.js keeps React** - Minimal component changes
3. **UI stays the same** - Material-UI works in Next.js
4. **Performance improves** - Faster initial load
5. **SEO improves** - Server-rendered HTML
6. **Migration is feasible** - 12 weeks with proper planning

### Next Steps

1. ✅ Review this document
2. ✅ Get stakeholder buy-in
3. ⏳ Start Phase 0 (Next.js setup)
4. ⏳ Begin migration

---

**Status:** 📋 **PLANNING COMPLETE**  
**Decision:** ✅ **PROCEED WITH MIGRATION**  
**Framework:** Next.js 14  
**Timeline:** 12 weeks
