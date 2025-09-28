#!/bin/bash

echo "🚀 Starting Railway Build Process..."

# Clean any existing builds
echo "🧹 Cleaning previous builds..."
rm -rf frontend/build
rm -rf frontend/node_modules/.cache

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install --production --prefix backend

echo "📦 Installing frontend dependencies..."
npm install --prefix frontend

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build:production
cd ..

# Verify build
echo "✅ Verifying build..."
if [ -d "frontend/build" ]; then
    echo "✅ Build directory created successfully"
    echo "📁 Build contents:"
    ls -la frontend/build/
    echo "📁 JS files:"
    ls -la frontend/build/static/js/
else
    echo "❌ Build directory not found!"
    exit 1
fi

echo "🎉 Railway build completed successfully!"
