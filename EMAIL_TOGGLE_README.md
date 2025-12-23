# Email Toggle Feature - Quick Start

## What is this?

A runtime-toggleable email enable/disable feature that prevents fake email addresses from bouncing during testing, which could mark your domain as SPAM.

## Quick Access

**Settings Page:** http://localhost:3000/settings (or your deployed URL + `/settings`)

## Quick Toggle via API

### Disable emails (for testing):
```bash
curl -X POST http://localhost:5001/api/email/settings \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": false}'
```

### Enable emails (for production):
```bash
curl -X POST http://localhost:5001/api/email/settings \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": true}'
```

### Check current status:
```bash
curl http://localhost:5001/api/email/settings
```

## When to Use

### Disable emails when:
- ✅ Testing with fake email addresses
- ✅ Development and debugging
- ✅ Demo environments
- ✅ Running automated tests

### Enable emails when:
- ✅ Production with real customers
- ✅ Testing with valid email addresses
- ✅ User acceptance testing

## How It Works

1. **Disabled:** Email service returns success but doesn't send actual emails
2. **Enabled:** Emails are sent normally via Brevo
3. **Settings persist** across server restarts
4. **Environment variable** `EMAIL_ENABLED` can override (if set)

## Testing

Run the test script:
```bash
./test-email-toggle.sh
```

## Full Documentation

See `documentation/EMAIL_TOGGLE_FEATURE.md` for complete details.

## Files

- **Settings Service:** `backend/src/services/settingsService.js`
- **Settings UI:** `frontend-next/pages/settings.tsx`
- **Settings File:** `backend/config/settings.json` (auto-created)
- **API Routes:** `backend/src/routes/email.js`

## Troubleshooting

**Toggle not working?**
- Check if `EMAIL_ENABLED` environment variable is set (it overrides the toggle)
- Check server logs for errors
- Verify settings file permissions

**Settings not persisting?**
- Ensure `backend/config/` directory exists and is writable
- Check for file system errors in logs

## Support

For issues or questions, see the full documentation in `documentation/EMAIL_TOGGLE_FEATURE.md`
