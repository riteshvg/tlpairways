# React SPA to MPA Migration Plan

**Branch:** `MPA`  
**Objective:** Migrate from React Single Page Application to Multi-Page Application  
**Strategy:** Incremental, tested, essential-only migration with UI preservation

---

## Executive Summary

### Why MPA?

**Current Issues with SPA:**
- Adobe Data Layer race conditions (pageView timing)
- Complex state management across routes
- SEO challenges
- Initial bundle size (576KB gzipped)
- Analytics tracking complexity

**MPA Benefits:**
- ✅ Natural page loads = reliable Adobe tracking
- ✅ Simpler state management (per-page)
- ✅ Better SEO (server-rendered HTML)
- ✅ Smaller per-page bundles
- ✅ Easier to reason about

---

## Migration Strategy

### Approach: **Hybrid Incremental Migration**

1. **Keep SPA running** (main branch)
2. **Build MPA in parallel** (MPA branch)
3. **Migrate page by page**
4. **Test thoroughly at each step**
5. **Switch when ready**

### Technology Stack

**Framework:** Next.js (React-based MPA framework)
- ✅ Server-side rendering (SSR)
- ✅ Static generation (SSG)
- ✅ File-based routing
- ✅ API routes (can replace backend)
- ✅ Built-in optimization
- ✅ Keeps React components (UI preserved)

**Alternative:** Vanilla HTML + Express
- ✅ Simpler
- ✅ No framework overhead
- ❌ Lose React components (need rewrite)
- ❌ More manual work

**Recommendation:** **Next.js** (keeps UI, gradual migration)

---

## Phase-by-Phase Migration Plan

### Phase 0: Preparation & Setup ✅ (Week 1)

**Objective:** Set up Next.js project alongside existing React app

#### Tasks:
- [ ] **0.1** Create Next.js project in `/frontend-next`
- [ ] **0.2** Configure Next.js for TLAirways
  - [ ] Set up Material-UI (same theme)
  - [ ] Configure Auth0
  - [ ] Set up Adobe Data Layer
  - [ ] Configure CSP headers
- [ ] **0.3** Set up shared components directory
- [ ] **0.4** Create build scripts for both SPA and MPA
- [ ] **0.5** Document architecture decisions

**Tests:**
- [ ] Next.js dev server runs
- [ ] Material-UI theme matches SPA
- [ ] Auth0 login works
- [ ] Adobe Data Layer initializes

**Deliverables:**
- Working Next.js skeleton
- Documentation: `MPA_ARCHITECTURE.md`

---

### Phase 1: Static Pages Migration (Week 2)

**Objective:** Migrate pages that don't require authentication or complex state

#### Pages to Migrate:
1. **Homepage** (`/`)
2. **Login Page** (`/login`)

#### Tasks:
- [ ] **1.1** Create `pages/index.js` (Homepage)
  - [ ] Copy HomePage component
  - [ ] Add server-side data fetching (if needed)
  - [ ] Implement Adobe pageView tracking
  - [ ] Test consent banner
- [ ] **1.2** Create `pages/login.js` (Login)
  - [ ] Implement Auth0 login flow
  - [ ] Handle redirects
  - [ ] Test authentication
- [ ] **1.3** Migrate shared components
  - [ ] Navbar
  - [ ] Footer (if exists)
  - [ ] ConsentExperience
- [ ] **1.4** Configure routing
  - [ ] Set up Next.js routing
  - [ ] Handle 404 pages

**Tests:**
- [ ] Homepage loads and renders correctly
- [ ] UI matches SPA exactly
- [ ] Adobe pageView fires on load
- [ ] Consent banner works
- [ ] Login redirects to Auth0
- [ ] Login callback works
- [ ] Authenticated state persists

**Deliverables:**
- Working homepage (MPA)
- Working login (MPA)
- Test report: `PHASE1_TEST_RESULTS.md`

---

### Phase 2: Search & Results Pages (Week 3)

**Objective:** Migrate flight search functionality

#### Pages to Migrate:
3. **Flight Search** (`/search`)
4. **Search Results** (`/search-results`)

#### Tasks:
- [ ] **2.1** Create `pages/search.js`
  - [ ] Migrate FlightSearch component
  - [ ] Implement search form
  - [ ] Handle form submission (navigate to results)
- [ ] **2.2** Create `pages/search-results.js`
  - [ ] Fetch search params from URL
  - [ ] Call backend API (or use API routes)
  - [ ] Display results
  - [ ] Implement flight selection
- [ ] **2.3** Set up API routes (if needed)
  - [ ] `pages/api/flights/search.js`
  - [ ] Proxy to existing backend or implement directly
- [ ] **2.4** Migrate booking context
  - [ ] Use URL params instead of React context
  - [ ] Store selection in session/cookies

**Tests:**
- [ ] Search form works
- [ ] Results page receives search params
- [ ] Flight data loads correctly
- [ ] Flight selection works
- [ ] Navigation to booking works
- [ ] Adobe tracking fires correctly
- [ ] Performance: Page load < 2s

**Deliverables:**
- Working search flow (MPA)
- API routes documentation
- Test report: `PHASE2_TEST_RESULTS.md`

---

### Phase 3: Booking Flow (Week 4-5)

**Objective:** Migrate the core booking process

#### Pages to Migrate:
5. **Traveller Details** (`/traveller-details`)
6. **Ancillary Services** (`/ancillary`)
7. **Payment** (`/payment`)
8. **Confirmation** (`/confirmation`)

#### Tasks:
- [ ] **3.1** Create `pages/traveller-details.js`
  - [ ] Migrate TravellerDetails component
  - [ ] Form validation
  - [ ] Save to session/backend
  - [ ] Navigate to ancillary
- [ ] **3.2** Create `pages/ancillary.js`
  - [ ] Migrate AncillaryServices component
  - [ ] Load traveller data
  - [ ] Handle selections
  - [ ] Navigate to payment
- [ ] **3.3** Create `pages/payment.js`
  - [ ] Migrate Payment component
  - [ ] Implement payment processing
  - [ ] Handle success/failure
  - [ ] Navigate to confirmation
- [ ] **3.4** Create `pages/confirmation.js`
  - [ ] Migrate BookingConfirmation component
  - [ ] Load booking data
  - [ ] Display confirmation
  - [ ] Implement Adobe commerce tracking
- [ ] **3.5** Implement booking state management
  - [ ] Use server sessions (Next.js API routes)
  - [ ] Or use encrypted cookies
  - [ ] Or store in backend

**Tests:**
- [ ] Complete booking flow works end-to-end
- [ ] Data persists across pages
- [ ] Payment processing works
- [ ] Confirmation displays correctly
- [ ] Adobe commerce events fire
- [ ] Email notifications sent
- [ ] Booking saved to database
- [ ] Error handling works

**Deliverables:**
- Working booking flow (MPA)
- Session management documentation
- Test report: `PHASE3_TEST_RESULTS.md`

---

### Phase 4: Authenticated Pages (Week 6)

**Objective:** Migrate user account pages

#### Pages to Migrate:
9. **User Profile** (`/profile`)
10. **My Bookings** (`/my-bookings`)
11. **Settings** (`/settings`)

#### Tasks:
- [ ] **4.1** Implement authentication middleware
  - [ ] Create `middleware.js` for auth checks
  - [ ] Redirect unauthenticated users
- [ ] **4.2** Create `pages/profile.js`
  - [ ] Migrate UserProfilePage component
  - [ ] Fetch user data server-side
  - [ ] Handle profile updates
- [ ] **4.3** Create `pages/my-bookings.js`
  - [ ] Migrate MyBookingsPage component
  - [ ] Fetch bookings server-side
  - [ ] Display booking history
- [ ] **4.4** Create `pages/settings.js`
  - [ ] Migrate SettingsPage component
  - [ ] Handle settings updates
  - [ ] Implement consent management

**Tests:**
- [ ] Auth middleware blocks unauthenticated access
- [ ] Profile loads user data
- [ ] Profile updates work
- [ ] Bookings display correctly
- [ ] Settings save correctly
- [ ] Logout works

**Deliverables:**
- Working authenticated pages (MPA)
- Auth middleware documentation
- Test report: `PHASE4_TEST_RESULTS.md`

---

### Phase 5: Admin & Utility Pages (Week 7)

**Objective:** Migrate remaining pages

#### Pages to Migrate:
12. **Script Manager** (`/script-manager`)

#### Tasks:
- [ ] **5.1** Create `pages/script-manager.js`
  - [ ] Migrate ScriptManagerPage component
  - [ ] Implement script management
  - [ ] Test Adobe Launch loading

**Tests:**
- [ ] Script manager works
- [ ] Adobe Launch scripts load correctly

**Deliverables:**
- Complete MPA application
- Test report: `PHASE5_TEST_RESULTS.md`

---

### Phase 6: Backend Integration (Week 8)

**Objective:** Decide on backend strategy

#### Options:

**Option A: Keep Existing Backend**
- ✅ No backend changes needed
- ✅ Faster migration
- ❌ Two separate services

**Option B: Migrate to Next.js API Routes**
- ✅ Single deployment
- ✅ Simpler architecture
- ❌ More work
- ❌ Need to migrate all endpoints

**Option C: Hybrid (Recommended)**
- ✅ Use Next.js API routes for simple endpoints
- ✅ Keep backend for complex logic (payments, bookings)
- ✅ Best of both worlds

#### Tasks (Option C):
- [ ] **6.1** Identify simple endpoints to migrate
  - [ ] `/api/airports` → Next.js API route
  - [ ] `/api/health` → Next.js API route
- [ ] **6.2** Keep complex endpoints in backend
  - [ ] `/api/bookings` → Keep in Express
  - [ ] `/api/payments` → Keep in Express
  - [ ] `/api/email` → Keep in Express
- [ ] **6.3** Configure proxy for backend calls
  - [ ] Use Next.js rewrites
  - [ ] Or use API route proxy

**Tests:**
- [ ] All API calls work
- [ ] No CORS issues
- [ ] Performance is acceptable

**Deliverables:**
- Backend integration complete
- API documentation updated
- Test report: `PHASE6_TEST_RESULTS.md`

---

### Phase 7: Adobe Analytics Migration (Week 9)

**Objective:** Ensure Adobe tracking works perfectly in MPA

#### Tasks:
- [ ] **7.1** Implement server-side pageView push
  - [ ] Push pageView in `_document.js` or `_app.js`
  - [ ] Ensure it fires before Adobe Launch
- [ ] **7.2** Test all Adobe events
  - [ ] pageView on all pages
  - [ ] commerce events (booking flow)
  - [ ] click tracking
  - [ ] consent tracking
- [ ] **7.3** Remove SPA-specific workarounds
  - [ ] Remove route change tracking
  - [ ] Remove delayed loading
  - [ ] Remove enrichment logic
- [ ] **7.4** Verify in Adobe Debugger
  - [ ] All rules fire correctly
  - [ ] No timeout errors
  - [ ] Data layer is correct

**Tests:**
- [ ] pageView fires on every page load
- [ ] No race conditions
- [ ] No timeout errors
- [ ] Commerce tracking works
- [ ] Adobe Debugger shows correct data

**Deliverables:**
- Adobe Analytics fully working
- Adobe implementation documentation
- Test report: `PHASE7_TEST_RESULTS.md`

---

### Phase 8: Performance Optimization (Week 10)

**Objective:** Optimize MPA for performance

#### Tasks:
- [ ] **8.1** Implement code splitting
  - [ ] Use dynamic imports
  - [ ] Split by route
- [ ] **8.2** Optimize images
  - [ ] Use Next.js Image component
  - [ ] Implement lazy loading
- [ ] **8.3** Implement caching
  - [ ] Cache API responses
  - [ ] Use ISR (Incremental Static Regeneration) where possible
- [ ] **8.4** Optimize bundle size
  - [ ] Remove unused dependencies
  - [ ] Tree-shake Material-UI
- [ ] **8.5** Implement SEO
  - [ ] Add meta tags
  - [ ] Create sitemap
  - [ ] Add robots.txt

**Tests:**
- [ ] Lighthouse score > 90
- [ ] Page load time < 2s
- [ ] Bundle size < 200KB per page
- [ ] SEO score > 90

**Deliverables:**
- Optimized MPA application
- Performance report
- SEO audit report

---

### Phase 9: Testing & QA (Week 11)

**Objective:** Comprehensive testing before deployment

#### Testing Checklist:

**Functional Testing:**
- [ ] All pages load correctly
- [ ] All forms work
- [ ] All API calls work
- [ ] Authentication works
- [ ] Booking flow works end-to-end
- [ ] Payment processing works
- [ ] Email notifications work

**Cross-Browser Testing:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Mobile Testing:**
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design works

**Analytics Testing:**
- [ ] Adobe pageView on all pages
- [ ] Commerce events fire
- [ ] Click tracking works
- [ ] Consent tracking works

**Performance Testing:**
- [ ] Load testing
- [ ] Stress testing
- [ ] Page speed tests

**Security Testing:**
- [ ] Auth0 security
- [ ] CSP headers
- [ ] XSS protection
- [ ] CSRF protection

**Deliverables:**
- Complete test report
- Bug list with priorities
- Sign-off from stakeholders

---

### Phase 10: Deployment & Cutover (Week 12)

**Objective:** Deploy MPA to production

#### Deployment Strategy:

**Option A: Blue-Green Deployment**
- Deploy MPA to new URL
- Test thoroughly
- Switch DNS when ready

**Option B: Gradual Rollout**
- Deploy MPA alongside SPA
- Route 10% of traffic to MPA
- Increase gradually
- Monitor metrics

**Option C: Big Bang (Not Recommended)**
- Replace SPA with MPA all at once
- High risk

**Recommendation:** **Option B** (Gradual Rollout)

#### Tasks:
- [ ] **10.1** Deploy MPA to staging
  - [ ] Test on staging environment
  - [ ] Run smoke tests
- [ ] **10.2** Deploy MPA to production
  - [ ] Set up load balancer
  - [ ] Route 10% traffic to MPA
- [ ] **10.3** Monitor metrics
  - [ ] Error rates
  - [ ] Performance
  - [ ] Analytics data
- [ ] **10.4** Increase traffic gradually
  - [ ] 10% → 25% → 50% → 100%
- [ ] **10.5** Decommission SPA
  - [ ] Archive SPA code
  - [ ] Update documentation

**Tests:**
- [ ] Staging tests pass
- [ ] Production smoke tests pass
- [ ] No increase in error rates
- [ ] Performance is acceptable
- [ ] Analytics data is correct

**Deliverables:**
- MPA in production
- Deployment documentation
- Rollback plan
- Post-deployment report

---

## Testing Strategy

### Test Types:

1. **Unit Tests**
   - Test individual components
   - Use Jest + React Testing Library
   - Aim for 80% coverage

2. **Integration Tests**
   - Test page interactions
   - Test API integrations
   - Use Cypress or Playwright

3. **E2E Tests**
   - Test complete user flows
   - Booking flow end-to-end
   - Use Cypress or Playwright

4. **Visual Regression Tests**
   - Ensure UI matches SPA
   - Use Percy or Chromatic

5. **Performance Tests**
   - Lighthouse CI
   - Load testing with k6

6. **Analytics Tests**
   - Adobe Debugger
   - Manual verification

### Test Automation:

```bash
# Run all tests
npm run test:all

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run visual tests
npm run test:visual

# Run performance tests
npm run test:performance
```

---

## Rollback Plan

### If Migration Fails:

1. **Immediate Rollback**
   - Switch traffic back to SPA
   - Takes < 5 minutes

2. **Investigate Issues**
   - Review logs
   - Identify root cause

3. **Fix and Retry**
   - Fix issues in MPA branch
   - Test thoroughly
   - Retry deployment

### Rollback Triggers:

- Error rate > 5%
- Page load time > 5s
- Analytics data loss > 10%
- Critical functionality broken

---

## Success Criteria

### MPA is successful if:

- ✅ All pages work correctly
- ✅ UI matches SPA exactly
- ✅ Performance is equal or better
- ✅ Adobe Analytics works perfectly
- ✅ No increase in error rates
- ✅ SEO improves
- ✅ Bundle size decreases
- ✅ Development is easier

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 0. Preparation | Week 1 | Next.js setup |
| 1. Static Pages | Week 2 | Homepage, Login |
| 2. Search | Week 3 | Search flow |
| 3. Booking | Week 4-5 | Booking flow |
| 4. Auth Pages | Week 6 | Profile, Bookings |
| 5. Utility | Week 7 | Script Manager |
| 6. Backend | Week 8 | API integration |
| 7. Analytics | Week 9 | Adobe tracking |
| 8. Optimization | Week 10 | Performance |
| 9. Testing | Week 11 | QA complete |
| 10. Deployment | Week 12 | Production |

**Total:** 12 weeks (3 months)

---

## Resources Needed

### Team:
- 1 Frontend Developer (full-time)
- 1 Backend Developer (part-time)
- 1 QA Engineer (part-time)
- 1 DevOps Engineer (part-time)

### Tools:
- Next.js
- Material-UI
- Auth0
- Adobe Analytics
- Cypress/Playwright
- Lighthouse CI

### Infrastructure:
- Staging environment
- Production environment
- Load balancer (for gradual rollout)

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Timeline overrun | High | Medium | Add buffer time |
| Breaking changes | High | Low | Thorough testing |
| Performance issues | Medium | Low | Performance testing |
| Analytics data loss | High | Low | Extensive analytics testing |
| Team availability | Medium | Medium | Cross-training |

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Get approval** to proceed
3. **Set up Next.js project** (Phase 0)
4. **Start migration** (Phase 1)

---

**Status:** 📋 **PLANNING COMPLETE**  
**Ready to Start:** ✅ **YES**  
**Estimated Completion:** 12 weeks from start
