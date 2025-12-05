# MPA Migration - Quick Reference Checklist

**Branch:** `MPA`  
**Framework:** Next.js 14  
**Timeline:** 12 weeks

---

## Phase 0: Setup (Week 1) ⏳

### Day 1-2: Next.js Installation
- [ ] Install Next.js: `npx create-next-app@latest frontend-next`
- [ ] Configure TypeScript (optional)
- [ ] Set up folder structure
- [ ] Install Material-UI: `npm install @mui/material @emotion/react @emotion/styled`
- [ ] Copy theme from SPA

### Day 3: Authentication
- [ ] Install Auth0: `npm install @auth0/nextjs-auth0`
- [ ] Configure Auth0 environment variables
- [ ] Create `/api/auth/[...auth0].js`
- [ ] Test login/logout

### Day 4: Adobe Data Layer
- [ ] Copy Adobe initialization from SPA `index.html`
- [ ] Create `_document.js` with Adobe scripts
- [ ] Test data layer initialization
- [ ] Verify Adobe Launch loads

### Day 5: Testing Setup
- [ ] Install Jest: `npm install --save-dev jest @testing-library/react`
- [ ] Install Cypress: `npm install --save-dev cypress`
- [ ] Create test scripts in `package.json`
- [ ] Write first test

---

## Phase 1: Static Pages (Week 2) ⏳

### Homepage
- [ ] Create `pages/index.js`
- [ ] Copy `HomePage.js` component
- [ ] Add Adobe pageView tracking
- [ ] Test: Homepage loads
- [ ] Test: Adobe pageView fires
- [ ] Test: UI matches SPA

### Login Page
- [ ] Create `pages/login.js`
- [ ] Implement Auth0 login
- [ ] Test: Login redirects to Auth0
- [ ] Test: Callback works
- [ ] Test: User is authenticated

---

## Phase 2: Search Flow (Week 3) ⏳

### Search Page
- [ ] Create `pages/search.js`
- [ ] Copy `FlightSearch` component
- [ ] Test: Search form renders
- [ ] Test: Form submission works

### Results Page
- [ ] Create `pages/search-results.js`
- [ ] Copy `SearchResults` component
- [ ] Implement data fetching
- [ ] Test: Results display
- [ ] Test: Flight selection works

---

## Phase 3: Booking Flow (Week 4-5) ⏳

### Traveller Details
- [ ] Create `pages/traveller-details.js`
- [ ] Implement form validation
- [ ] Test: Form works
- [ ] Test: Data saves

### Ancillary Services
- [ ] Create `pages/ancillary.js`
- [ ] Implement selections
- [ ] Test: Selections save

### Payment
- [ ] Create `pages/payment.js`
- [ ] Implement payment processing
- [ ] Test: Payment works

### Confirmation
- [ ] Create `pages/confirmation.js`
- [ ] Implement booking display
- [ ] Test: Confirmation shows
- [ ] Test: Adobe commerce events fire

---

## Phase 4: Auth Pages (Week 6) ⏳

### Profile
- [ ] Create `pages/profile.js`
- [ ] Implement auth middleware
- [ ] Test: Auth required
- [ ] Test: Profile loads

### My Bookings
- [ ] Create `pages/my-bookings.js`
- [ ] Fetch bookings server-side
- [ ] Test: Bookings display

### Settings
- [ ] Create `pages/settings.js`
- [ ] Implement settings updates
- [ ] Test: Settings save

---

## Phase 5: Utility Pages (Week 7) ⏳

### Script Manager
- [ ] Create `pages/script-manager.js`
- [ ] Test: Script management works

---

## Phase 6: Backend (Week 8) ⏳

### API Routes
- [ ] Create `pages/api/airports.js`
- [ ] Create `pages/api/health.js`
- [ ] Configure proxy for backend
- [ ] Test: All APIs work

---

## Phase 7: Adobe Analytics (Week 9) ⏳

### Tracking Implementation
- [ ] Verify pageView on all pages
- [ ] Test commerce events
- [ ] Test click tracking
- [ ] Remove SPA workarounds
- [ ] Verify in Adobe Debugger

---

## Phase 8: Optimization (Week 10) ⏳

### Performance
- [ ] Implement code splitting
- [ ] Optimize images
- [ ] Run Lighthouse
- [ ] Target: Score > 90

### SEO
- [ ] Add meta tags
- [ ] Create sitemap
- [ ] Add robots.txt

---

## Phase 9: Testing (Week 11) ⏳

### Comprehensive Tests
- [ ] Unit tests (80% coverage)
- [ ] Integration tests
- [ ] E2E tests (booking flow)
- [ ] Cross-browser tests
- [ ] Mobile tests
- [ ] Performance tests
- [ ] Security tests

---

## Phase 10: Deployment (Week 12) ⏳

### Staging
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Get stakeholder approval

### Production
- [ ] Deploy to production
- [ ] Route 10% traffic
- [ ] Monitor metrics
- [ ] Increase to 100%
- [ ] Decommission SPA

---

## Testing Checklist (Every Phase)

### Functional
- [ ] Page loads correctly
- [ ] UI matches SPA exactly
- [ ] All interactions work
- [ ] Forms validate
- [ ] Data saves correctly

### Analytics
- [ ] Adobe pageView fires
- [ ] Data layer is correct
- [ ] No console errors
- [ ] Events fire correctly

### Performance
- [ ] Page load < 2s
- [ ] No layout shift
- [ ] Images load quickly

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] ARIA labels present

---

## Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run all tests
npm run test:unit        # Unit tests
npm run test:e2e         # E2E tests
npm run test:visual      # Visual regression

# Deployment
npm run deploy:staging   # Deploy to staging
npm run deploy:prod      # Deploy to production

# Utilities
npm run lint             # Lint code
npm run format           # Format code
npm run analyze          # Analyze bundle
```

---

## Success Metrics

### Must Have ✅
- [ ] All pages work
- [ ] UI identical to SPA
- [ ] Adobe tracking works
- [ ] No errors in production
- [ ] Performance equal or better

### Nice to Have 🎯
- [ ] SEO improved
- [ ] Bundle size reduced
- [ ] Lighthouse score > 90
- [ ] Development easier

---

## Rollback Triggers 🚨

**Rollback if:**
- Error rate > 5%
- Page load > 5s
- Analytics data loss > 10%
- Critical functionality broken

**Rollback process:**
1. Switch traffic to SPA
2. Investigate issues
3. Fix and redeploy

---

## Current Status

**Phase:** 0 (Preparation)  
**Progress:** 0%  
**Next Action:** Set up Next.js project

---

## Quick Start

```bash
# 1. Create Next.js project
cd /Users/riteshg/Documents/Learnings/tlpairways
npx create-next-app@latest frontend-next

# 2. Install dependencies
cd frontend-next
npm install @mui/material @emotion/react @emotion/styled
npm install @auth0/nextjs-auth0

# 3. Copy theme
cp ../frontend/src/theme/theme.js ./theme/

# 4. Start development
npm run dev
```

---

**Ready to start?** ✅  
**First task:** Set up Next.js project (Phase 0, Day 1)
