#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting Railway Build Process..."
echo "📋 Environment Info:"
echo "   Node version: $(node --version)"
echo "   NPM version: $(npm --version)"
echo "   Working directory: $(pwd)"

# Clean any existing node_modules to prevent conflicts
echo "🧹 Cleaning existing node_modules..."
rm -rf frontend/node_modules backend/node_modules

echo "📦 Installing backend dependencies..."
cd backend
npm install --only=production --no-audit --no-fund
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install --no-audit --no-fund
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"

echo "🔨 Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend build completed"

echo "📊 Build Summary:"
echo "   Backend dependencies: $(ls backend/node_modules 2>/dev/null | wc -l) packages"
echo "   Frontend dependencies: $(ls frontend/node_modules 2>/dev/null | wc -l) packages"
echo "   Build artifacts: $(ls frontend/build 2>/dev/null | wc -l) files"

echo "🎉 Railway build process completed successfully!"
