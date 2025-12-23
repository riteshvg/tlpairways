# Email Toggle Feature

## Overview

This feature allows you to enable/disable email sending functionality at runtime without restarting the server. This is particularly useful during testing to prevent fake email addresses from bouncing and potentially marking your domain as SPAM.

## Components

### Backend

1. **Settings Service** (`backend/src/services/settingsService.js`)
   - Manages runtime-toggleable settings
   - Stores settings in `backend/config/settings.json`
   - Supports environment variable override via `EMAIL_ENABLED`

2. **Email Service Updates** (`backend/src/services/emailService.js`)
   - Checks email enabled status before sending
   - Returns mock success response when disabled
   - Logs when emails are skipped

3. **API Routes** (`backend/src/routes/email.js`)
   - `GET /api/email/settings` - Get current email settings
   - `POST /api/email/settings` - Update email settings
   - `GET /api/email/status` - Get email service status (includes enabled flag)

### Frontend

1. **Settings Page** (`frontend-next/pages/settings.tsx`)
   - User-friendly toggle switch
   - Real-time status updates
   - Helpful documentation about when to use
   - Warning when environment variable override is active

## Usage

### Via Settings Page (Recommended)

1. Navigate to `/settings` in your browser
2. Toggle the "Enable Email Sending" switch
3. The change takes effect immediately

### Via API

**Get current settings:**
```bash
curl http://localhost:5001/api/email/settings
```

**Disable email sending:**
```bash
curl -X POST http://localhost:5001/api/email/settings \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": false}'
```

**Enable email sending:**
```bash
curl -X POST http://localhost:5001/api/email/settings \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": true}'
```

### Via Environment Variable

You can also set the `EMAIL_ENABLED` environment variable:

```bash
# Disable emails
EMAIL_ENABLED=false npm start

# Enable emails (default)
EMAIL_ENABLED=true npm start
```

**Note:** Environment variable takes precedence over the settings file. If set, the toggle in the settings page will be disabled with a warning message.

## Settings File

Settings are stored in `backend/config/settings.json`:

```json
{
  "emailEnabled": true,
  "lastUpdated": "2025-12-23T09:00:00.000Z"
}
```

This file is automatically created on first use with default settings.

## When to Disable Emails

### Testing Scenarios
- Testing with fake or invalid email addresses
- Development and debugging
- Demo environments
- Automated testing

### Why It Matters
When emails bounce (invalid addresses), email service providers like Brevo track this. Too many bounces can:
- Mark your domain as SPAM
- Reduce email deliverability
- Damage sender reputation
- Potentially suspend your email service account

## When to Enable Emails

- Production environment with real customers
- Staging environment with valid test email addresses
- User acceptance testing with real emails

## Behavior When Disabled

When email sending is disabled:
1. The email service returns a mock success response
2. No actual email is sent via Brevo
3. A log message indicates the email was skipped
4. The confirmation page still shows "email sent" status (to maintain UX)
5. Message ID is generated as `disabled-{timestamp}`

Example log output:
```
📧 Email sending is disabled. Skipping email for: test@example.com
```

## Production Deployment

### Railway Environment Variable

To disable emails in Railway:
1. Go to your Railway project
2. Navigate to Variables
3. Add: `EMAIL_ENABLED=false`
4. Redeploy

### Recommended Approach

For production, we recommend:
1. Keep `EMAIL_ENABLED` unset (or set to `true`)
2. Use the settings page to toggle as needed
3. Only use environment variable for permanent configuration

## Testing the Feature

1. **Test Disable:**
   ```bash
   # Disable via API
   curl -X POST http://localhost:5001/api/email/settings \
     -H "Content-Type: application/json" \
     -d '{"emailEnabled": false}'
   
   # Make a test booking
   # Check logs - should see "Email sending is disabled"
   ```

2. **Test Enable:**
   ```bash
   # Enable via API
   curl -X POST http://localhost:5001/api/email/settings \
     -H "Content-Type: application/json" \
     -d '{"emailEnabled": true}'
   
   # Make a test booking with valid email
   # Email should be sent
   ```

3. **Test Settings Page:**
   - Navigate to http://localhost:3000/settings
   - Toggle the switch
   - Make a test booking
   - Verify behavior matches toggle state

## Files Modified/Created

### Created
- `backend/src/services/settingsService.js` - Settings management service
- `frontend-next/pages/settings.tsx` - Settings UI page
- `documentation/EMAIL_TOGGLE_FEATURE.md` - This documentation

### Modified
- `backend/src/services/emailService.js` - Added email enabled check
- `backend/src/routes/email.js` - Added settings endpoints

## API Response Examples

### Get Settings
```json
{
  "emailEnabled": true,
  "envOverride": false,
  "envValue": undefined,
  "lastUpdated": "2025-12-23T09:00:00.000Z"
}
```

### Update Settings (Success)
```json
{
  "success": true,
  "message": "Email sending disabled",
  "settings": {
    "emailEnabled": false,
    "envOverride": false,
    "lastUpdated": "2025-12-23T09:01:00.000Z"
  }
}
```

### Email Service Status
```json
{
  "configured": true,
  "enabled": false,
  "hasApiKey": true,
  "hasSenderEmail": true,
  "senderEmail": "noreply@tlpairways.com",
  "senderName": "TLP Airways",
  "message": "Email service is disabled (test mode)"
}
```

## Troubleshooting

### Toggle Not Working
- Check if `EMAIL_ENABLED` environment variable is set
- If set, it overrides the settings file
- Remove the env var or use it to control the setting

### Settings Not Persisting
- Ensure `backend/config/` directory has write permissions
- Check server logs for file system errors

### Emails Still Sending When Disabled
- Verify settings with `GET /api/email/settings`
- Check server logs for the "Email sending is disabled" message
- Ensure you're testing the correct environment

## Future Enhancements

Potential improvements:
1. Add more granular controls (e.g., disable only for certain email types)
2. Add email sending history/logs in the UI
3. Add notification when emails are disabled
4. Add role-based access control for settings
5. Add audit log for settings changes
