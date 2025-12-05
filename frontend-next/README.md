# TLAirways MPA - Next.js Demo

**Multi-Page Application (MPA) built with Next.js to eliminate Adobe Data Layer race conditions**

---

## 🚀 Quick Start

```bash
# Install dependencies (if needed)
npm install

# Start development server
npm run dev

# Open browser
# http://localhost:3000
```

---

## 📋 Pages

- **Homepage** (`/`) - Hero, destinations, features
- **Search** (`/search`) - Flight search form
- **Results** (`/results`) - Flight search results
- **Profile** (`/profile`) - User profile (requires Auth0)

---

## 🔑 Auth0 Setup (Optional)

### Required for:
- Login/logout
- Profile page
- User-specific features

### Not required for:
- ✅ Homepage
- ✅ Search page
- ✅ Results page
- ✅ **Adobe Analytics testing** (main goal!)

### Setup Steps:

1. **Check current status:**
   ```bash
   ./check-auth0.sh
   ```

2. **Get credentials from Auth0 Dashboard:**
   - Go to https://manage.auth0.com/
   - Applications → Your App → Settings
   - Copy: Domain, Client ID, Client Secret

3. **Update `.env.local`:**
   ```bash
   nano .env.local
   # or
   code .env.local
   ```

4. **Replace placeholders:**
   ```env
   AUTH0_ISSUER_BASE_URL=https://your-actual-domain.auth0.com
   AUTH0_CLIENT_ID=your_actual_client_id
   AUTH0_CLIENT_SECRET=your_actual_client_secret
   ```

5. **Restart server:**
   ```bash
   npm run dev
   ```

---

## 🧪 Testing Adobe Analytics

### Main Goal: Verify MPA eliminates race conditions

1. **Start server:** `npm run dev`
2. **Open:** http://localhost:3000
3. **Open DevTools Console** (F12)
4. **Look for these messages:**
   ```
   ✅ MPA: Consent initialized (server-side)
   ✅ MPA: pageView pushed SYNCHRONOUSLY
   ✅ MPA: Adobe Launch loaded - data layer was ready!
   ```

5. **Check data layer:**
   ```javascript
   window.adobeDataLayer
   ```

6. **Navigate between pages and verify:**
   - pageView fires on every page
   - No timeout errors
   - No race conditions

### Success Criteria:
- ✅ pageView fires BEFORE Adobe Launch loads
- ✅ No "Failed to execute 'Send event'" errors
- ✅ Data layer always has correct data

---

## 📚 Documentation

See `/documentation/` for:
- `SESSION_CHECKPOINT.md` - Current status & next steps
- `MPA_DEMO_TESTING_GUIDE.md` - Detailed testing guide
- `MPA_MIGRATION_MASTER_PLAN.md` - Full migration plan
- `SPA_VS_MPA_ARCHITECTURE.md` - Technical comparison

---

**Built with:** Next.js 16, Material-UI 7, Auth0, TypeScript

**Main Achievement:** Eliminates Adobe Data Layer race conditions! 🎉
