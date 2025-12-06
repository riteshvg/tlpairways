# 🚀 Git Upload & Production Deployment Workflow

This guide documents the standard procedure for pushing changes to the repository and deploying the MPA (Next.js) application to production on Railway.

## 📋 Prerequisites

Ensure you have the following installed:
- Git
- Railway CLI (optional, for manual deployments)
- Node.js (v18+)

## 🔄 The Workflow

### 1. Local Development & Testing

Always verify changes locally before pushing.

```bash
# Navigate to the MPA directory
cd frontend-next

# Start the local development server
npm run dev

# Verify changes at http://localhost:3000
# Check that the title says "TLP Airways | NEXT"
```

### 2. Prepare for Commit

1.  **Check Status**: see which files have changed.
    ```bash
    git status
    ```

2.  **Add Changes**: Stage the files you want to commit.
    ```bash
    git add .
    ```

3.  **Commit**: Write a clear, descriptive message (Conventional Commits recommended).
    ```bash
    git commit -m "feat: Describe your feature or fix here"
    ```

### 3. Push to GitHub (Trigger Deployment)

Pushing to the `main` branch automatically triggers a deployment on Railway (if GitHub integration is active).

```bash
# Push directly to main (or merge via Pull Request)
git push origin main
```

### 4. Railway Deployment (Production)

Railway listens to the `main` branch. When you push:
1.  Railway detects the new commit.
2.  It executes the build configuration defined in `nixpacks.toml` at the project root.
3.  **Build Phase**:
    - Runs `./railway-build.sh`
    - Installs dependencies.
    - runs `npm run build` inside `frontend-next/`.
4.  **Start Phase**:
    - Executes `cd frontend-next && npm run start`.
5.  **Health Check**:
    - Pings `/api/health` to ensure the app is live.
    - If successful, switches traffic to the new version.

### 🛑 Manual Deployment (If Auto-Deploy Fails)

If the automatic trigger doesn't work, use the Railway CLI from the **project root**:

```bash
# From the root of the repository (tlpairways/)
railway up
```

*Note: This pushes the local code directly to Railway, bypassing GitHub.*

## ⚙️ Configuration Reference

### Key Files
- **`nixpacks.toml`** (Root): Defines the build instructions for Railway.
- **`railway-build.sh`** (Root): The script that installs dependencies and builds the Next.js app.
- **`frontend-next/package.json`**: Contains the `build` and `start` scripts.

### Environment Variables (Required in Railway)
Ensure these variables are set in your Railway Project Settings:
- `NODE_ENV`: `production`
- `PORT`: `10000` (or leave default)
- `AUTH0_SECRET`: (Your 32-char secret)
- `AUTH0_BASE_URL`: `https://tlpairways.thelearningproject.in`
- `AUTH0_ISSUER_BASE_URL`: (Your Auth0 Domain)
- `AUTH0_CLIENT_ID`: (Your Client ID)
- `AUTH0_CLIENT_SECRET`: (Your Client Secret)

## ✅ Validation

To verify the deployment is successful:
1.  Visit `https://tlpairways.thelearningproject.in`
2.  Check the browser tab title: **"TLP Airways | NEXT"**
3.  Test the **Sign In** button.

---

**Troubleshooting:**
- **Build Failed?** Check Railway logs. Common issues are TypeScript errors (fix locally with `npm run build`).
- **Old Site visible?** The deployment might have failed health checks and rolled back. Verify `/api/health` works locally.
