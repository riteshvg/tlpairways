# Railway Environment Variables Setup Guide

## 🚨 Critical: Email Service Configuration

The error `BREVO_API_KEY is not configured` means the backend environment variables are missing in Railway.

## Required Environment Variables for Backend

### Email Service (Brevo)

Add these to your **Railway Backend Service** → **Variables** tab:

```env
BREVO_API_KEY=your-brevo-api-key-here
SENDER_EMAIL=noreply@tlpairways.com
SENDER_NAME=TLP Airways
```

**Optional:**
```env
REPLY_TO_EMAIL=support@tlpairways.com
```

### WhatsApp Service (Meta)

```env
WHATSAPP_PROVIDER=meta
WHATSAPP_API_KEY=your-meta-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
```

### Other Backend Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-connection-string
```

## Required Environment Variables for Frontend

Add these to your **Railway Frontend Service** → **Variables** tab:

```env
REACT_APP_API_URL=https://tlpairways.up.railway.app/api
```

**Note:** Replace `tlpairways.up.railway.app` with your actual backend Railway URL.

## How to Set Environment Variables in Railway

### Step 1: Get Your Brevo API Key

1. Go to [Brevo Dashboard](https://app.brevo.com)
2. Navigate to **Settings** → **API Keys**
3. Click **Generate a new API key**
4. Copy the API key (starts with `xkeysib-...`)

### Step 2: Verify Sender Email

1. In Brevo Dashboard, go to **Senders & IP** → **Senders**
2. Click **Add a sender**
3. Enter your sender email (e.g., `noreply@tlpairways.com`)
4. Verify the email by clicking the verification link sent to that email

### Step 3: Add Variables to Railway Backend

1. Go to [Railway Dashboard](https://railway.app)
2. Open your **Backend Service**
3. Click on **Variables** tab
4. Click **+ New Variable** for each:

   **Variable 1:**
   - Name: `BREVO_API_KEY`
   - Value: `xkeysib-your-actual-api-key-here`

   **Variable 2:**
   - Name: `SENDER_EMAIL`
   - Value: `noreply@tlpairways.com` (must be verified in Brevo)

   **Variable 3:**
   - Name: `SENDER_NAME`
   - Value: `TLP Airways`

### Step 4: Add Variables to Railway Frontend

1. Open your **Frontend Service** in Railway
2. Click on **Variables** tab
3. Click **+ New Variable**:

   **Variable:**
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.railway.app/api`
   
   **Important:** Replace `your-backend-url.railway.app` with your actual backend Railway URL.

### Step 5: Redeploy Services

After adding environment variables:

1. **Backend Service:**
   - Railway will auto-redeploy when you add variables
   - Or manually click **Redeploy**

2. **Frontend Service:**
   - Must be manually redeployed after adding `REACT_APP_API_URL`
   - Click **Redeploy** button

## Verification

### Test Backend Email Service

After redeploying backend, test the email service:

```bash
# Check email service status
curl https://your-backend-url.railway.app/api/email/status

# Should return:
{
  "configured": true,
  "hasApiKey": true,
  "hasSenderEmail": true,
  "senderEmail": "noreply@tlpairways.com",
  "senderName": "TLP Airways",
  "message": "Email service is configured and ready"
}
```

### Test Frontend API Connection

After redeploying frontend, check browser console:
- Should NOT see CSP errors
- Should NOT see CORS errors
- Email sending should work

## Troubleshooting

### Error: "BREVO_API_KEY is not configured"

**Solution:**
1. Verify `BREVO_API_KEY` is set in Railway backend variables
2. Check variable name is exactly `BREVO_API_KEY` (case-sensitive)
3. Ensure no extra spaces in the value
4. Redeploy backend service

### Error: "SENDER_EMAIL is not configured"

**Solution:**
1. Add `SENDER_EMAIL` variable in Railway backend
2. Ensure email is verified in Brevo dashboard
3. Redeploy backend service

### Error: "Invalid API key" from Brevo

**Solution:**
1. Verify API key is correct (starts with `xkeysib-`)
2. Check if API key has expired
3. Generate a new API key in Brevo dashboard
4. Update `BREVO_API_KEY` in Railway
5. Redeploy backend

### Email not sending

**Check:**
1. Backend logs for detailed error messages
2. Brevo dashboard → Statistics for delivery status
3. Sender email verification status
4. API key permissions in Brevo

## Quick Checklist

- [ ] `BREVO_API_KEY` set in Railway backend
- [ ] `SENDER_EMAIL` set in Railway backend (and verified in Brevo)
- [ ] `SENDER_NAME` set in Railway backend
- [ ] `REACT_APP_API_URL` set in Railway frontend
- [ ] Backend service redeployed
- [ ] Frontend service redeployed
- [ ] Test email sent successfully

## Security Notes

⚠️ **Never commit `.env` files to git**
⚠️ **Never share API keys in public repositories**
⚠️ **Rotate API keys if accidentally exposed**

