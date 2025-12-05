# Quick Setup Guide - Phase 0

## ✅ Automated Setup (Recommended)

Since you already have a `.env` file in the SPA, we've created an automatic conversion script!

### Step 1: Run the conversion script

```bash
cd frontend-next
./convert-env.sh
```

This automatically:
- ✅ Reads your SPA `.env` file
- ✅ Converts REACT_APP_* variables to AUTH0_* format
- ✅ Generates AUTH0_SECRET
- ✅ Creates `.env.local` for Next.js

### Step 2: Add Auth0 Client Secret

The script creates `.env.local` but you need to add your Client Secret:

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to Applications → Your Application
3. Copy the **Client Secret**
4. Edit `frontend-next/.env.local`
5. Replace `your_client_secret_here` with actual secret

### Step 3: Update Auth0 Dashboard

Add these URLs to your Auth0 Application settings:

**Allowed Callback URLs:**
```
http://localhost:3000/api/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000
```

**Allowed Web Origins:**
```
http://localhost:3000
```

### Step 4: Test it!

```bash
cd frontend-next
npm run dev
```

Open http://localhost:3000 and click "Login with Auth0"

---

## 📝 What the script created:

Your `.env.local` now has:
- ✅ AUTH0_ISSUER_BASE_URL (from REACT_APP_AUTH0_DOMAIN)
- ✅ AUTH0_CLIENT_ID (from REACT_APP_AUTH0_CLIENT_ID)
- ✅ AUTH0_AUDIENCE (from REACT_APP_AUTH0_AUDIENCE)
- ✅ AUTH0_SECRET (auto-generated)
- ✅ AUTH0_BASE_URL (http://localhost:3000)
- ⚠️ AUTH0_CLIENT_SECRET (you need to add this)

---

## 🎯 Next Steps

1. Add Client Secret to `.env.local`
2. Update Auth0 Dashboard
3. Run `npm run dev`
4. Test login/logout

---

**Status:** Ready to test! 🚀
