# Railway Environment Variables for Build Info

## Summary

Railway automatically provides Git-related environment variables during builds. Our build script now uses these instead of trying to run `git` commands (which don't work in Railway's build environment).

## Railway Auto-Provided Variables

Railway automatically sets these during every build:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `RAILWAY_GIT_COMMIT_SHA` | `f63d046a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q` | Full commit SHA |
| `RAILWAY_GIT_BRANCH` | `main` | Branch name |
| `RAILWAY_GIT_AUTHOR` | `Your Name` | Commit author |
| `RAILWAY_GIT_COMMIT_MESSAGE` | `feat: Add feature` | Commit message |
| `RAILWAY_ENVIRONMENT` | `production` | Environment name |

## No Manual Configuration Needed! ✅

**You don't need to add any environment variables manually in Railway.**

The updated script automatically:
1. Checks if `RAILWAY_GIT_COMMIT_SHA` exists
2. If yes → Uses Railway's variables
3. If no → Falls back to `git` commands (for local builds)

## How It Works

### On Railway (Production):
```bash
📦 Using Railway environment variables
✅ Build info generated:
   Commit: f63d046 (f63d046a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q)
   Branch: main
   Build Time: 2025-12-05T15:17:21Z
   Version: 0.1.0
```

### Locally (Development):
```bash
🔧 Using local git information
✅ Build info generated:
   Commit: 2c92c83 (2c92c83...)
   Branch: main
   Build Time: 2025-12-05T15:21:45Z
   Version: 0.1.0
```

## What Changed

### Before:
```bash
# Always tried to use git commands
COMMIT_HASH=$(git rev-parse HEAD)  # ❌ Fails on Railway
```

### After:
```bash
# Check Railway first, fall back to git
if [ -n "$RAILWAY_GIT_COMMIT_SHA" ]; then
  COMMIT_HASH="$RAILWAY_GIT_COMMIT_SHA"  # ✅ Works on Railway
else
  COMMIT_HASH=$(git rev-parse HEAD)      # ✅ Works locally
fi
```

## Next Deployment

The next time you deploy to Railway:
1. Railway will auto-set `RAILWAY_GIT_COMMIT_SHA`
2. Build script will detect it
3. Commit hash will be embedded in the build
4. Info button will show the correct commit! 🎉

## Testing

### To test locally:
```bash
cd frontend
bash scripts/generate-build-info.sh
# Should show: 🔧 Using local git information
```

### To simulate Railway:
```bash
cd frontend
export RAILWAY_GIT_COMMIT_SHA="f63d046a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q"
export RAILWAY_GIT_BRANCH="main"
bash scripts/generate-build-info.sh
# Should show: 📦 Using Railway environment variables
```

## Current Status

- ✅ Script updated to use Railway variables
- ✅ Committed to `main` (commit `2c92c83`)
- ✅ Pushed to GitHub
- ⏳ Next Railway deployment will show correct commit hash

## No Action Required

Railway handles everything automatically. Just deploy and the commit hash will appear in the build info modal!
