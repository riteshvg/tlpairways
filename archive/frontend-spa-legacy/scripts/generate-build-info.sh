#!/bin/bash

# Script to inject build information into React app
# This creates environment variables that will be embedded in the build

# Check if running on Railway (Railway provides these env vars automatically)
if [ -n "$RAILWAY_GIT_COMMIT_SHA" ]; then
  # Use Railway's environment variables
  COMMIT_HASH="$RAILWAY_GIT_COMMIT_SHA"
  COMMIT_SHORT="${RAILWAY_GIT_COMMIT_SHA:0:7}"
  BRANCH="${RAILWAY_GIT_BRANCH:-unknown}"
  echo "📦 Using Railway environment variables"
else
  # Use git commands for local builds
  COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
  COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  echo "🔧 Using local git information"
fi

# Get build timestamp
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Get version from package.json
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")

# Create .env.production.local file with build info
cat > .env.production.local << EOF
# Auto-generated build information
# Generated at: ${BUILD_TIME}

REACT_APP_COMMIT_HASH=${COMMIT_HASH}
REACT_APP_COMMIT_SHORT=${COMMIT_SHORT}
REACT_APP_BRANCH=${BRANCH}
REACT_APP_BUILD_TIME=${BUILD_TIME}
REACT_APP_VERSION=${VERSION}
EOF

echo "✅ Build info generated:"
echo "   Commit: ${COMMIT_SHORT} (${COMMIT_HASH})"
echo "   Branch: ${BRANCH}"
echo "   Build Time: ${BUILD_TIME}"
echo "   Version: ${VERSION}"
echo ""
echo "📝 Created: .env.production.local"
