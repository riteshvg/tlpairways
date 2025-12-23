# Railway Deployment - Email Toggle Feature

## Current Situation

The email toggle feature has been merged to `main` and pushed to GitHub, but Railway hasn't deployed it yet. The production site is still running the old code without the email toggle feature.

## Evidence

**Settings API Response (shows new code is NOT deployed):**
```json
{
  "emailEnabled": false,
  "lastUpdated": "2025-12-23T09:12:41.978Z",
  "envOverride": false
}
```

The settings endpoint exists (which is good), but the email service is still trying to send emails and failing with a 400 error.

## Solution: Trigger Railway Deployment

### Option 1: Via Railway Dashboard (Recommended)

1. Go to [Railway Dashboard](https://railway.app)
2. Select your `tlpairways` project
3. Click on your backend service
4. Click **"Deploy"** or **"Redeploy"** button
5. Wait for deployment to complete (usually 2-5 minutes)

### Option 2: Via Git Push (Force Redeploy)

```bash
# Make a small change to force redeploy
git commit --allow-empty -m "chore: Trigger Railway redeploy for email toggle feature"
git push origin main
```

### Option 3: Via Railway CLI

```bash
# Install Railway CLI if not installed
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Trigger deployment
railway up
```

## What to Expect After Deployment

Once Railway redeploys with the new code:

1. **Email sending will be disabled by default** (or use existing settings)
2. **No more 400 errors** - emails will be skipped silently
3. **Settings page will be available** at `/settings`
4. **Logs will show**: "📧 Email sending is disabled. Skipping email for: {email}"

## Verify Deployment

After Railway redeploys, verify with:

```bash
# Check if the new code is deployed
curl https://tlpairways.thelearningproject.in/api/email/status

# Should show:
# {
#   "configured": true,
#   "enabled": false,  <-- This is the key
#   "message": "Email service is disabled (test mode)"
# }
```

## Configure Email Settings in Production

Once deployed, you can:

### Via Settings Page:
Visit: https://tlpairways.thelearningproject.in/settings

### Via API:
```bash
# Disable emails (for testing)
curl -X POST https://tlpairways.thelearningproject.in/api/email/settings \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": false}'

# Enable emails (when ready for production)
curl -X POST https://tlpairways.thelearningproject.in/api/email/settings \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": true}'
```

### Via Environment Variable (Permanent):
In Railway dashboard:
1. Go to your backend service
2. Click **Variables**
3. Add: `EMAIL_ENABLED=false`
4. Redeploy

## Current Error Explanation

The 400 Bad Request error you're seeing is because:

1. **Old code is running** - doesn't have the email toggle check
2. **Email validation is failing** - likely due to fake/test email addresses
3. **Brevo API is rejecting** - invalid recipient or missing required fields

Once the new code deploys, emails will be skipped entirely when disabled, so no 400 errors will occur.

## Timeline

- ✅ Code merged to main: Done
- ✅ Code pushed to GitHub: Done
- ⏳ Railway auto-deploy: Pending (or needs manual trigger)
- ⏳ Email toggle active: After deployment

## Next Steps

1. **Trigger Railway deployment** (use Option 1 or 2 above)
2. **Wait for deployment** to complete
3. **Verify** the new code is running
4. **Test** by making a booking
5. **Check logs** - should see "Email sending is disabled" instead of errors

---

**Note:** Railway typically auto-deploys when you push to the main branch, but sometimes it needs a manual trigger or there might be a delay. Check your Railway dashboard for deployment status.
