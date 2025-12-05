# Phase 0 Day 3 - Auth0 Setup Instructions

## ✅ Files Created

1. **`env.example`** - Environment variables template
2. **`pages/api/auth/[...auth0].ts`** - Auth0 API routes
3. **`pages/_app.tsx`** - App wrapper with Auth0 & Material-UI
4. **`pages/index.tsx`** - Test homepage

---

## 🔧 Setup Steps

### Step 1: Create .env.local file

```bash
cd frontend-next
cp env.example .env.local
```

### Step 2: Get Auth0 Credentials

**From your SPA `.env` file, copy:**
- `REACT_APP_AUTH0_DOMAIN` → Use for `AUTH0_ISSUER_BASE_URL`
- `REACT_APP_AUTH0_CLIENT_ID` → Use for `AUTH0_CLIENT_ID`
- `REACT_APP_AUTH0_AUDIENCE` → Use for `AUTH0_AUDIENCE`

**Get Client Secret:**
1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to Applications → Your Application
3. Copy the **Client Secret**

### Step 3: Generate AUTH0_SECRET

```bash
openssl rand -hex 32
```

Copy the output and use it for `AUTH0_SECRET`

### Step 4: Update .env.local

```env
AUTH0_ISSUER_BASE_URL=https://dev-q6p3jrm5pbykuq23.us.auth0.com
AUTH0_CLIENT_ID=your_actual_client_id
AUTH0_CLIENT_SECRET=your_actual_client_secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_SECRET=054876b49fb14b4615c750479aa211e1b714336df9a46a424babb179261b634a
AUTH0_AUDIENCE=your_actual_audience
AUTH0_SCOPE=openid profile email
```

### Step 5: Update Auth0 Application Settings

In Auth0 Dashboard, add to your application:

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

---

## 🧪 Testing

### Start the dev server:

```bash
cd frontend-next
npm run dev
```

### Test the application:

1. **Open browser:** http://localhost:3000
2. **Click "Login with Auth0"**
3. **Verify:**
   - Redirects to Auth0 login
   - After login, redirects back
   - User info displays
   - Material-UI theme works
   - Logout works

---

## ✅ Expected Results

### Before Login:
- Homepage shows "Login with Auth0" button
- Material-UI theme applied (teal colors)
- No errors in console

### After Login:
- User avatar and name displayed
- User email shown
- Full user object in JSON
- "Logout" button visible

### After Logout:
- Redirects to homepage
- Shows login button again
- User session cleared

---

## 🐛 Troubleshooting

### Error: "Missing required environment variable"
- Check `.env.local` file exists
- Verify all variables are set
- Restart dev server

### Error: "Callback URL mismatch"
- Add `http://localhost:3000/api/auth/callback` to Auth0 dashboard
- Check `AUTH0_BASE_URL` is correct

### Error: "Invalid state"
- Clear browser cookies
- Regenerate `AUTH0_SECRET`
- Try incognito mode

### Material-UI not working:
- Check `_app.tsx` has ThemeProvider
- Verify theme.js is imported correctly
- Check browser console for errors

---

## 📋 Checklist

- [ ] Created `.env.local` file
- [ ] Added Auth0 credentials
- [ ] Generated AUTH0_SECRET
- [ ] Updated Auth0 dashboard settings
- [ ] Started dev server (`npm run dev`)
- [ ] Tested login flow
- [ ] Verified user info displays
- [ ] Tested logout
- [ ] Checked Material-UI theme works
- [ ] No console errors

---

## 🎯 Success Criteria

✅ **Day 3 Complete when:**
- Login redirects to Auth0
- Callback returns to app
- User info displays correctly
- Logout works
- Material-UI theme applied
- No errors in console

---

**Next:** Day 4 - Adobe Data Layer Setup
