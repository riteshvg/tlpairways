# Finding Your Railway Backend API URL

## Quick Answer

For project name **"tlpairways"**, your backend API URL is likely:

```
https://tlpairways-production.up.railway.app/api
```

OR

```
https://tlpairways-backend.up.railway.app/api
```

OR

```
https://tlpairways.up.railway.app/api
```

The exact URL depends on your **service name** within the project.

## Step-by-Step Guide

### 1. Go to Railway Dashboard
- Visit: https://railway.app
- Log in to your account
- Open project: **tlpairways**

### 2. Find Your Backend Service
- Look for a service named:
  - `backend`
  - `production`
  - `api`
  - Or the main service (if you only have one)

### 3. Get the Service URL
- Click on the backend service
- Go to **Settings** tab
- Scroll to **Networking** section
- Find **Public Domain** or **Custom Domain**
- This is your backend URL

### 4. Construct API URL
- Take the domain from step 3
- Add `/api` at the end
- Example: `https://tlpairways-production.up.railway.app/api`

## Verify the URL

Test if the URL works:

```bash
# Test health endpoint
curl https://your-backend-url.railway.app/api/health

# Should return: {"status":"ok",...}
```

## Set in Frontend Environment

Once you have the URL:

1. Go to Railway Dashboard → **tlpairways** project
2. Click on your **Frontend Service**
3. Go to **Variables** tab
4. Add new variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api`
5. **Redeploy** the frontend service

## Common Railway URL Patterns

- **Default**: `https://[service-name].up.railway.app`
- **Production service**: `https://tlpairways-production.up.railway.app`
- **Backend service**: `https://tlpairways-backend.up.railway.app`
- **Main service**: `https://tlpairways.up.railway.app`

## Quick Test Commands

```bash
# Test health
curl https://tlpairways-production.up.railway.app/api/health

# Test email status
curl https://tlpairways-production.up.railway.app/api/email/status

# Test WhatsApp status
curl https://tlpairways-production.up.railway.app/api/whatsapp/status
```

## Troubleshooting

### If URL doesn't work:
1. Check if service is running (green status in Railway)
2. Verify the service has a public domain assigned
3. Check if port is correctly configured (Railway auto-assigns PORT env var)
4. Verify `/api` routes are properly set up in backend

### If CORS errors persist:
1. Verify backend CORS allows your frontend domain
2. Check backend environment variables
3. Ensure `NODE_ENV=production` is set in backend

