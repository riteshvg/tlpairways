#!/bin/bash

echo "--- Starting Railway Build Process (MPA) ---"
echo "Build timestamp: $(date)"

# 1. Clean previous builds
echo "Cleaning previous frontend build artifacts..."
rm -rf frontend-next/.next
echo "Previous build artifacts removed."

# 2. Install dependencies
echo "Installing dependencies..."
cd frontend-next
npm install --legacy-peer-deps || { echo "npm install failed"; exit 1; }
echo "Dependencies installed."

# 3. Build the frontend (Next.js)
echo "Building frontend-next for production..."
npm run build || { echo "Frontend build failed"; exit 1; }
echo "Frontend build completed."

# 4. Verify build output
echo "Verifying frontend build output..."
if [ -d ".next" ]; then
  echo "Next.js build directory (.next) found."
else
  echo "ERROR: Frontend build output not found."
  exit 1
fi

echo "--- Railway Build Process Completed Successfully ---"