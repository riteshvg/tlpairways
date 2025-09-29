#!/bin/bash

echo "--- Starting Railway Build Process ---"

# 1. Clean previous builds
echo "Cleaning previous frontend build artifacts..."
rm -rf frontend/build
echo "Previous build artifacts removed."

# 2. Install all dependencies
echo "Installing all dependencies (backend and frontend)..."
npm run install:all || { echo "npm install:all failed"; exit 1; }
echo "All dependencies installed."

# 3. Build the frontend
echo "Building frontend for production..."
npm run build:frontend || { echo "Frontend build failed"; exit 1; }
echo "Frontend build completed."

# 4. Verify build output
echo "Verifying frontend build output..."
if [ -d "frontend/build" ] && [ "$(ls -A frontend/build/static/js/)" ]; then
  echo "Frontend build directory and JS files found."
  ls -la frontend/build/static/js/
else
  echo "ERROR: Frontend build output not found or is empty."
  exit 1
fi

echo "--- Railway Build Process Completed Successfully ---"