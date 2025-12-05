# Accelerated MPA Migration - Execution Plan

**Goal:** Complete working MPA with essential pages, then test

**Timeline:** Immediate execution (condensed from 12 weeks)

**Strategy:** Build core functionality, skip non-essential features

---

## ✅ Phase 0: Setup (COMPLETE - 80%)

- [x] Next.js installation
- [x] Material-UI setup
- [x] Auth0 integration
- [x] Adobe Data Layer
- [ ] Testing setup (will do at end)

**Status:** Ready to proceed to Phase 1

---

## 🎯 Phase 1: Core Pages (PRIORITY)

### Essential Pages to Migrate:

1. **Homepage** (`/`) - Entry point
2. **Search** (`/search`) - Flight search form
3. **Results** (`/results`) - Search results display
4. **Login** (`/login`) - Authentication

**Skip for now:**
- Booking flow (complex, not needed for demo)
- User profile pages
- Settings

**Approach:**
- Copy components from SPA
- Adapt to Next.js Pages Router
- Use URL params instead of React context
- Server-side data fetching where beneficial

---

## 🎯 Phase 2: Data & API Integration

### API Strategy:

**Option: Proxy to existing backend**
- Keep Express backend running
- Next.js proxies API calls
- No backend migration needed

**Implementation:**
- Use `next.config.js` rewrites
- Or create API route proxies
- Minimal changes to API calls

---

## 🎯 Phase 3: Testing & Verification

### Tests to Run:

1. **Functional:**
   - Pages load
   - Navigation works
   - Forms submit
   - API calls work

2. **Adobe Analytics:**
   - pageView fires on all pages
   - No race conditions
   - No timeout errors
   - Data layer correct

3. **Performance:**
   - Page load times
   - Bundle sizes
   - Lighthouse scores

4. **Cross-browser:**
   - Chrome
   - Firefox
   - Safari

---

## 📋 Execution Steps

### Step 1: Complete Phase 0 (5 min)
- [x] Setup complete
- [ ] Quick testing setup

### Step 2: Build Core Pages (30-45 min)
- [ ] Homepage with search
- [ ] Search results page
- [ ] Login page
- [ ] Basic navigation

### Step 3: API Integration (15 min)
- [ ] Configure API proxy
- [ ] Test API calls
- [ ] Verify data flow

### Step 4: Adobe Verification (10 min)
- [ ] Test pageView on all pages
- [ ] Verify no race conditions
- [ ] Check Adobe Debugger

### Step 5: Testing (20 min)
- [ ] Manual testing
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] Document results

**Total Estimated Time:** 90-120 minutes

---

## 🎯 Success Criteria

### Must Have:
- ✅ 3-4 working pages
- ✅ Navigation between pages
- ✅ Adobe tracking works (no race conditions)
- ✅ Material-UI theme matches SPA
- ✅ Auth0 login works
- ✅ API calls work

### Nice to Have:
- Search functionality works
- Results display correctly
- Performance better than SPA
- No console errors

---

## 📝 What We'll Skip (For Now)

- Full booking flow
- Payment integration
- User profile pages
- My bookings page
- Settings page
- Email notifications
- Complex state management
- Full test coverage

**Rationale:** Focus on proving MPA solves Adobe issues

---

## 🚀 Let's Execute!

**Current Status:** Phase 0 at 80%  
**Next:** Complete Phase 0, then build core pages  
**ETA:** 90-120 minutes for working demo

---

**Ready to proceed?** ✅
