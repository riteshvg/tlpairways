# Quick Fix: Disable Email Sending in Production

## Problem
Emails are still being sent in production despite the toggle being disabled, causing 400 errors with junk email addresses.

## Solution
Set the `EMAIL_ENABLED` environment variable in Railway to `false`.

## Steps

### Option 1: Railway Dashboard (Recommended)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project: **tlpairways**
3. Click on the **backend** service
4. Go to the **Variables** tab
5. Click **+ New Variable**
6. Add:
   - **Variable**: `EMAIL_ENABLED`
   - **Value**: `false`
7. Click **Add**
8. The service will automatically redeploy

### Option 2: Railway CLI

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Set the variable
railway variables set EMAIL_ENABLED=false

# Verify it's set
railway variables
```

### Option 3: Using railway.json (Permanent)

Add to `backend/railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node src/server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "env": {
    "EMAIL_ENABLED": "false"
  }
}
```

Then commit and push:

```bash
git add backend/railway.json
git commit -m "Disable email sending in production"
git push
```

## Verification

### 1. Check the Variable is Set

```bash
railway variables | grep EMAIL_ENABLED
```

Expected output:
```
EMAIL_ENABLED=false
```

### 2. Check the Settings API

```bash
curl https://tlpairways.thelearningproject.in/api/email/settings
```

Expected response:
```json
{
  "emailEnabled": false,
  "envOverride": true,
  "envValue": "false",
  "lastUpdated": "..."
}
```

### 3. Test a Booking

1. Go to your production site
2. Complete a booking with a junk email (e.g., `test@test.com`)
3. Check the Railway logs:

Expected log:
```
📧 Email sending is disabled. Skipping email for: test@test.com
```

**No 400 errors should appear!**

## To Re-enable Emails Later

When you're ready to send real emails in production:

```bash
railway variables set EMAIL_ENABLED=true
```

Or delete the variable to use the default (enabled):

```bash
railway variables delete EMAIL_ENABLED
```

## Important Notes

- ✅ Environment variables take **precedence** over file-based settings
- ✅ Changes take effect immediately after redeployment
- ✅ The settings page will show "Environment Variable Override Active"
- ✅ File-based toggles won't work when env variable is set (this is intentional)

## Troubleshooting

### Still seeing 400 errors?

1. **Verify the variable is set:**
   ```bash
   railway variables | grep EMAIL_ENABLED
   ```

2. **Check the service redeployed:**
   - Go to Railway dashboard → Deployments
   - Ensure the latest deployment is "Active"

3. **Check the logs:**
   ```bash
   railway logs
   ```
   Look for: `📧 Email sending is disabled`

4. **Clear browser cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### Settings page shows error?

This is **expected** when using environment variables! The error message tells you:
> "Settings could not be persisted to disk. To persist this setting in production, set the EMAIL_ENABLED environment variable"

This is informational - the setting IS working via the environment variable.

## Summary

- **Quick Fix**: `railway variables set EMAIL_ENABLED=false`
- **Verify**: Check `/api/email/settings` shows `envOverride: true`
- **Test**: Complete booking with junk email, no errors should occur
- **Done**: Emails are now disabled in production! 🎉
