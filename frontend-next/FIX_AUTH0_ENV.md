# Fix Auth0 Environment Variables

## Issue
You're getting the error: `"ikm" must be an instance of Uint8Array or a string`

This happens because the Auth0 configuration in `.env.local` has placeholder values.

## What I Fixed
✅ Added `AUTH0_SECRET=pUIiMiCRdnvWeSzT+IUwRrh2bLc0eBpoJDtMID49rmU=`

## What You Need to Fix

Your `.env.local` currently has these **placeholder values** that need to be replaced:

```bash
AUTH0_CLIENT_ID=your-client-id          # ❌ Replace this
AUTH0_CLIENT_SECRET=your-client-secret  # ❌ Replace this
```

### Option 1: Get Real Auth0 Credentials

1. Go to your Auth0 Dashboard: https://manage.auth0.com/
2. Navigate to **Applications** → **Applications**
3. Find your application (or create a new one)
4. Copy the **Client ID** and **Client Secret**
5. Update `.env.local`:

```bash
AUTH0_CLIENT_ID=<your-real-client-id>
AUTH0_CLIENT_SECRET=<your-real-client-secret>
```

### Option 2: Use Existing Backend Auth0 Config

I noticed you might have Auth0 configured in your backend. Let me check:

```bash
# Check backend .env
cat /Users/riteshg/Documents/Learnings/tlpairways/backend/.env | grep AUTH0
```

If you have Auth0 credentials there, copy them to `frontend-next/.env.local`.

## Complete Required Variables

Your `.env.local` should have these Auth0 variables:

```bash
# Auth0 Configuration
AUTH0_DOMAIN=dev-q6p3jrm5pbykuq23.us.auth0.com  # ✅ You have this
AUTH0_CLIENT_ID=<your-real-client-id>            # ❌ Update this
AUTH0_CLIENT_SECRET=<your-real-client-secret>    # ❌ Update this
AUTH0_SECRET=pUIiMiCRdnvWeSzT+IUwRrh2bLc0eBpoJDtMID49rmU=  # ✅ Just added
AUTH0_AUDIENCE=https://api.tlairways.com         # ✅ You have this
APP_BASE_URL=http://localhost:3000               # ✅ You have this
```

## After Updating

1. **Save** the `.env.local` file
2. **Restart** your Next.js dev server:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   npm run dev
   ```
3. **Try signing in again**

## Quick Fix Command

If you have the real values, you can update them with:

```bash
cd /Users/riteshg/Documents/Learnings/tlpairways/frontend-next

# Replace with your actual values
sed -i '' 's/AUTH0_CLIENT_ID=your-client-id/AUTH0_CLIENT_ID=YOUR_REAL_CLIENT_ID/' .env.local
sed -i '' 's/AUTH0_CLIENT_SECRET=your-client-secret/AUTH0_CLIENT_SECRET=YOUR_REAL_CLIENT_SECRET/' .env.local
```

## Verification

After updating, verify the variables are set:

```bash
grep "AUTH0" .env.local
```

You should see real values, not placeholders.

## Need Help Finding Auth0 Credentials?

Let me know and I can help you:
1. Check if they're in your backend `.env`
2. Guide you through creating a new Auth0 application
3. Set up the correct configuration

---

**Status**: 
- ✅ `AUTH0_SECRET` added
- ⏳ Waiting for you to update `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET`
