#!/bin/bash

# Script to inject build information into React app
# This creates environment variables that will be embedded in the build

# Get git commit hash
COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

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
