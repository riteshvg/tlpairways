#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting Railway Build Process..."

# Step 1: Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production --no-audit --no-fund
echo "✅ Backend dependencies installed"

# Step 2: Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install --no-audit --no-fund
echo "✅ Frontend dependencies installed"

# Step 3: Build frontend
echo "🏗️ Building frontend..."
npm run build
echo "✅ Frontend build completed"

# Step 4: Go back to root
cd ..

echo "🎉 Railway build process completed successfully!"