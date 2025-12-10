#!/bin/bash
set -e

echo "🚀 Starting TLP Airways Services..."

# Start backend in background
echo "📡 Starting Backend API..."
cd backend
PORT=5001 node src/index.js &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to initialize
sleep 3

# Start frontend in foreground
echo "🎨 Starting Next.js Frontend..."
cd ../frontend-next
exec npm run start
