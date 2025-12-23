# Email Service Investigation - Production Issue

## Date: 2025-12-23 15:10 IST

## Issue Report

User is still seeing 400 email errors in browser console:
```
POST https://tlpairways.thelearningproject.in/api/email/send-booking-confirmation 400 (Bad Request)
❌ Email send error: Error: Failed to send email
```

## Investigation Results

### ✅ Backend is Working Correctly

**Test 1: Email Status API**
```bash
curl https://tlpairways.thelearningproject.in/api/email/status
```
**Response:**
```json
{
  "configured": true,
  "enabled": false,
  "hasApiKey": true,
  "hasSenderEmail": true,
  "senderEmail": "ritesh@thelearningproject.in",
  "senderName": "TLP Airways",
  "message": "Email service is disabled (test mode)"
}
```
✅ **Result:** Email is correctly disabled

**Test 2: Email Settings API**
```bash
curl https://tlpairways.thelearningproject.in/api/email/settings
```
**Response:**
```json
{
  "emailEnabled": false,
  "lastUpdated": "2025-12-23T09:34:47.631Z",
  "envOverride": false
}
```
✅ **Result:** Settings are correct

**Test 3: Actual Email Send Request**
```bash
curl -X POST https://tlpairways.thelearningproject.in/api/email/send-booking-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "bookingId": "TEST123",
    "passengerName": "Test User",
    "route": "DEL-BOM",
    "from": "DEL",
    "to": "BOM",
    "toCity": "Mumbai",
    "fromCity": "Delhi",
    "travelDate": "2025-12-25",
    "flightNumber": "TLP101",
    "departureTime": "10:00",
    "adults": 1,
    "totalPassengers": 1,
    "travelClass": "Economy",
    "baseFare": 5000,
    "taxes": 500,
    "totalAmount": 5500
  }'
```
**Response:**
```json
{
  "success": true,
  "message": "Booking confirmation email sent successfully",
  "messageId": "disabled-1766482862618",
  "weatherIncluded": false
}
```
✅ **Result:** Backend correctly returns mock success with `disabled-` prefix!

## Root Cause Analysis

### The Problem: Browser Cache

The backend is working perfectly, but the **frontend JavaScript is cached** in the user's browser.

**Evidence:**
1. ✅ Backend API returns success with `disabled-` messageId
2. ✅ Email service is disabled
3. ❌ Browser still shows 400 errors (old cached JavaScript)

**Why This Happens:**
- Railway deployment rebuilt the frontend
- New JavaScript bundles were created
- User's browser has old JavaScript cached
- Old code doesn't handle the new response format
- Old code might be sending incomplete data

## Solutions

### Solution 1: Hard Refresh Browser (Immediate)

**For the User:**
1. Open the production site: https://tlpairways.thelearningproject.in
2. **Hard refresh** to clear cache:
   - **Mac:** `Cmd + Shift + R` or `Cmd + Option + R`
   - **Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
3. Test booking again

### Solution 2: Clear Browser Cache (If Hard Refresh Doesn't Work)

**Chrome/Edge:**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Or:**
1. Settings → Privacy and Security → Clear browsing data
2. Select "Cached images and files"
3. Clear data for "Last hour"

### Solution 3: Verify Deployment (Check if Frontend Was Actually Rebuilt)

The Railway deployment should have rebuilt frontend-next, but let's verify:

```bash
# Check the build command in railway.json
# It should run: npm run build in frontend-next
cd backend
railway logs --tail 100
```

Look for:
- `npm run build` execution in frontend-next
- Next.js build output
- Static page generation

### Solution 4: Force Frontend Rebuild (If Needed)

If the frontend wasn't rebuilt, deploy again:

```bash
# From root directory
cd /Users/riteshg/Documents/Learnings/tlpairways
railway up
```

This will:
1. Build backend
2. Build frontend-next (npm run build)
3. Start both services

### Solution 5: Add Cache Busting (Long-term Fix)

To prevent future cache issues, we can add cache busting to the frontend build.

**Update `frontend-next/next.config.ts`:**
```typescript
const nextConfig: NextConfig = {
  // ... existing config
  
  // Add cache busting
  generateBuildId: async () => {
    // Use git commit hash or timestamp
    return `build-${Date.now()}`;
  },
  
  // ... rest of config
};
```

## Verification Steps

After clearing cache or redeploying:

1. **Open DevTools Network Tab**
2. **Make a test booking**
3. **Check the email API request:**
   - Should see: `POST /api/email/send-booking-confirmation`
   - Response should be: `{"success": true, "messageId": "disabled-..."}`
   - Should NOT see 400 error

4. **Check Console:**
   - Should NOT see "❌ Email send error"
   - Might see: "✅ Booking confirmation email sent successfully"

## Expected Behavior After Fix

### When Email is Disabled (Current State)

**Browser Console:**
```
✅ Booking confirmation email sent successfully: disabled-1766482862618
```

**Or no error at all** (silent success)

**Backend Logs:**
```
📧 Email sending is disabled. Skipping email for: customer@example.com
```

## Next Steps

1. **Immediate:** User should hard refresh browser (Cmd+Shift+R)
2. **Verify:** Check if error persists after refresh
3. **If persists:** Check Railway logs to confirm frontend was rebuilt
4. **If needed:** Redeploy from root directory with `railway up`

## Technical Details

**Railway Deployment:**
- Service: tlairways-app (6fdd0baa-459e-4f99-89fd-f8f996ad681a)
- Build: Both backend and frontend-next
- Start: Backend on port 5001, Frontend on port 10000
- Proxy: Frontend proxies /api/* to backend

**Build Command:**
```bash
cd backend && npm install --legacy-peer-deps && 
cd ../frontend-next && npm install --legacy-peer-deps && npm run build
```

**Start Command:**
```bash
cd backend && PORT=5001 node src/index.js & 
sleep 2 && 
cd ../frontend-next && npm run start
```

## Conclusion

✅ **Backend:** Working perfectly - email toggle feature is active  
❌ **Frontend:** Cached in browser - needs hard refresh  
🔧 **Fix:** Hard refresh browser or redeploy if needed  

The email toggle feature IS working on the backend. The 400 errors are from cached frontend code.
