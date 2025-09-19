#!/bin/bash
set -e

echo "🔧 Setting up local development environment..."

# Clean everything first
echo "🧹 Cleaning existing installations..."
rm -rf backend/node_modules frontend/node_modules
rm -f backend/package-lock.json frontend/package-lock.json

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

echo "🎉 Local development setup complete!"
echo ""
echo "To start development:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm start"
