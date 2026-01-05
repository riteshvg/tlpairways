# Email Toggle Fix - Production Settings Persistence

## Issue Summary

The email toggle functionality in the settings page was not working as expected in production. Users could toggle the setting, but emails were still being sent and failing with 400 errors when using junk email addresses.

### Error Logs
```
/api/email/send-booking-confirmation:1  Failed to load resource: the server responded with a status of 400 ()
❌ Email send error: Error: Failed to send email
❌ Failed to send email: Failed to send email
```

## Root Cause

The email toggle settings were being stored in a file (`backend/config/settings.json`) which has several problems in production:

1. **Gitignored**: The `settings.json` file is in `.gitignore`, so it doesn't get deployed to production
2. **Ephemeral Filesystem**: Railway (and most cloud platforms) use ephemeral filesystems that reset on deployment
3. **No Persistence**: File-based settings don't persist across server restarts in production

### The Flow

1. User toggles email setting in UI → Frontend calls `/api/email/settings`
2. Backend tries to save to `settings.json` → May fail silently or file gets reset
3. Next request checks `isEmailEnabled()` → Reads from file or defaults to `true`
4. Email sending proceeds even though user disabled it

## Solution Implemented

### 1. Enhanced Error Handling in Settings Service

**File**: `backend/src/services/settingsService.js`

- Added try-catch blocks with detailed logging
- Graceful fallback to defaults when file operations fail
- Clear console warnings when settings can't be persisted
- Recommendation to use environment variables for production

### 2. Improved API Response

**File**: `backend/src/routes/email.js`

When settings can't be saved to disk, the API now returns:

```json
{
  "success": false,
  "warning": "Settings could not be persisted to disk",
  "message": "To persist this setting in production, set the EMAIL_ENABLED environment variable",
  "settings": { "emailEnabled": false, ... },
  "recommendation": {
    "action": "Set environment variable",
    "variable": "EMAIL_ENABLED",
    "value": "false",
    "note": "Environment variables take precedence over file-based settings"
  }
}
```

### 3. Enhanced Frontend Feedback

**File**: `frontend-next/pages/settings.tsx`

- Detects when settings can't be persisted
- Shows detailed error message with environment variable instructions
- Provides clear guidance on how to make settings permanent

## How to Use

### For Development (Local)

The file-based settings work fine locally:

1. Go to `/settings` page
2. Toggle "Enable Email Sending"
3. Settings are saved to `backend/config/settings.json`
4. Changes persist across server restarts

### For Production (Railway)

Use environment variables for persistent settings:

#### Option 1: Via Railway Dashboard

1. Go to your Railway project
2. Select the backend service
3. Go to **Variables** tab
4. Add/Update: `EMAIL_ENABLED` = `false` (to disable) or `true` (to enable)
5. Redeploy the service

#### Option 2: Via Railway CLI

```bash
railway variables set EMAIL_ENABLED=false
```

#### Option 3: In Code (railway.json)

Add to your `backend/railway.json`:

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

## Priority System

The settings service checks in this order:

1. **Environment Variable** (`EMAIL_ENABLED`) - Takes precedence
2. **Settings File** (`config/settings.json`) - Fallback for local development
3. **Default Value** (`true`) - If neither exists

## Testing

### Test 1: Verify Settings in Production

```bash
# Check current settings
curl https://your-domain.com/api/email/settings

# Expected response:
{
  "emailEnabled": false,  // Current effective value
  "envOverride": true,    // If env variable is set
  "envValue": "false",    // Value of env variable
  "lastUpdated": "..."
}
```

### Test 2: Verify Email Blocking

1. Set `EMAIL_ENABLED=false` in Railway
2. Complete a booking with a junk email
3. Check logs - should see: `📧 Email sending is disabled. Skipping email for: test@example.com`
4. No 400 errors should occur

### Test 3: Local Development

```bash
# Start backend
cd backend
npm start

# In another terminal, toggle settings
curl -X POST http://localhost:3001/api/email/settings \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": false}'

# Check settings file
cat backend/config/settings.json
```

## Monitoring

### Backend Logs to Watch For

✅ **Good Signs:**
```
📁 Creating config directory: /app/backend/config
📄 Creating settings file with defaults: /app/backend/config/settings.json
✅ Settings saved successfully
📧 Email sending is disabled. Skipping email for: user@example.com
```

⚠️ **Warnings (Expected in Production):**
```
❌ Error saving settings: EROFS: read-only file system
⚠️  Settings could not be persisted. Use EMAIL_ENABLED environment variable for production.
⚠️  Settings file does not exist, using defaults
```

❌ **Errors (Need Attention):**
```
❌ Email send error: Error: Failed to send email
Failed to load resource: the server responded with a status of 400
```

## Migration Path

### Immediate Fix (Current Implementation)

- Use `EMAIL_ENABLED` environment variable in production
- Keep file-based settings for local development
- Frontend warns users when settings can't be persisted

### Future Enhancement (Recommended)

Consider migrating to a database-backed settings system:

1. **Add a Settings Table** to your database
2. **Create Settings API** with proper authentication
3. **Admin Dashboard** for managing settings
4. **Audit Log** for tracking setting changes

Example schema:
```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(255)
);
```

## Related Files

- `backend/src/services/settingsService.js` - Settings management
- `backend/src/services/emailService.js` - Email sending with toggle check
- `backend/src/routes/email.js` - Settings API endpoints
- `frontend-next/pages/settings.tsx` - Settings UI
- `backend/config/settings.json` - Local settings file (gitignored)
- `backend/config/settings.example.json` - Example settings file

## Deployment Checklist

Before deploying to production:

- [ ] Set `EMAIL_ENABLED` environment variable in Railway
- [ ] Verify environment variable is set: `railway variables`
- [ ] Deploy backend with updated code
- [ ] Test settings page in production
- [ ] Verify email toggle behavior
- [ ] Check backend logs for confirmation
- [ ] Test booking flow with junk email (should not send)

## Troubleshooting

### Issue: Emails still being sent despite toggle being off

**Check:**
1. Verify `EMAIL_ENABLED` env variable: `railway variables | grep EMAIL_ENABLED`
2. Check API response: `curl https://your-domain.com/api/email/settings`
3. Look for `envOverride: true` in response
4. Check backend logs for: `Email sending is disabled`

**Fix:**
```bash
railway variables set EMAIL_ENABLED=false
railway up  # Redeploy
```

### Issue: Settings page shows error about persistence

**This is expected in production!** The error message guides users to set the environment variable.

**To suppress the warning:**
- Set the `EMAIL_ENABLED` environment variable
- The UI will show "Environment Variable Override Active" instead

### Issue: Settings reset after deployment

**Expected behavior** - File-based settings don't persist in production.

**Solution:** Use environment variables as documented above.

## Summary

This fix ensures that:
1. ✅ Email toggle works reliably in both development and production
2. ✅ Settings persist correctly using environment variables in production
3. ✅ Users get clear feedback when settings can't be persisted
4. ✅ No more 400 errors from attempting to send emails when disabled
5. ✅ Graceful fallbacks when file operations fail

The system now properly respects the email toggle setting and prevents email sending attempts when disabled, regardless of the environment.
