# Railway MPA Service Configuration

## Manual Configuration Steps:

### 1. In Railway Dashboard → Your MPA Service → Settings:

**Root Directory:**
```
frontend-next
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm run start
```

**Watch Paths:**
```
frontend-next/**
```

---

### 2. Alternative: Use Build Scripts

If the above doesn't work, use these custom scripts:

**Build Command:**
```
chmod +x build-mpa.sh && ./build-mpa.sh
```

**Start Command:**
```
chmod +x start-mpa.sh && ./start-mpa.sh
```

---

### 3. Environment Variables to Set:

```
NODE_ENV=production
PORT=3000
```

Add any Auth0 or other environment variables from your main service.

---

### 4. If Still Not Working - Create New Service:

1. Delete the current MPA service
2. Click "New" → "Empty Service"
3. Connect to GitHub repo
4. Select branch: `MPA`
5. Set Root Directory: `frontend-next`
6. Deploy

---

## Verification:

After deployment, check:
- Build logs should show "Next.js build" output
- Start logs should show "ready - started server on 0.0.0.0:3000"
- URL should serve Next.js pages, not React SPA

---

## Troubleshooting:

If you see "Unexpected token '>>>'" error:
- Railway is still serving the old React SPA
- Root directory is not set correctly
- Try deleting `.next` build cache and redeploying
