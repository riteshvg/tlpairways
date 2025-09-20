#!/bin/bash

# Simple TLAirways Development Server Startup Script
# Starts both frontend (3002) and backend (3001) servers

echo "🚀 Starting TLAirways Development Servers..."

# Kill any existing processes on ports 3001 and 3002
echo "🔍 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null

# Start backend on port 3001
echo "🔧 Starting backend on port 3001..."
cd backend && PORT=3001 npm start &
BACKEND_PID=$!
cd ..

# Start frontend on port 3002
echo "🎨 Starting frontend on port 3002..."
cd frontend && PORT=3002 npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers started successfully!"
echo "🔧 Backend: http://localhost:3001"
echo "🎨 Frontend: http://localhost:3002"
echo ""
echo "💡 Press Ctrl+C to stop all servers"

# Wait for interrupt
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
