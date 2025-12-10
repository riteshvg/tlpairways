#!/bin/bash

# start-mpa.sh - Start TLP Airways MPA (Next.js + Backend)

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting TLP Airways MPA (Next.js + Backend)...${NC}"
echo ""

# Get the project root directory
PROJECT_ROOT="$(dirname "$0")"
cd "$PROJECT_ROOT" || { echo -e "${RED}Error: Project directory not found!${NC}"; exit 1; }

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# ============================================
# START BACKEND SERVER
# ============================================
echo -e "${CYAN}📡 Starting Backend Server (Port 5001)...${NC}"
echo -e "${CYAN}   Note: Port 5000 is blocked by macOS Control Center${NC}"

cd backend || { echo -e "${RED}Error: backend directory not found!${NC}"; exit 1; }

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Start backend in background
PORT=5001 npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

cd ..

echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo -e "${GREEN}   Logs: backend.log${NC}"
echo ""

# Wait a moment for backend to initialize
sleep 2

# ============================================
# START NEXT.JS FRONTEND
# ============================================
echo -e "${BLUE}🎨 Starting Next.js Frontend (Port 3000)...${NC}"

cd frontend-next || { echo -e "${RED}Error: frontend-next directory not found!${NC}"; exit 1; }

# Check for stale lock files
if [ -f ".next/dev/lock" ]; then
    echo -e "${YELLOW}🧹 Found stale lock file. Cleaning up...${NC}"
    rm .next/dev/lock
fi

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

cd ..

echo -e "${GREEN}---------------------------------------------------${NC}"
echo -e "${GREEN}🌐 Servers Starting...${NC}"
echo -e "${GREEN}---------------------------------------------------${NC}"
echo -e "  Frontend (Next.js): ${YELLOW}http://localhost:3000${NC}"
echo -e "  Backend API:        ${YELLOW}http://localhost:5001/api${NC}"
echo -e "  Backend Health:     ${YELLOW}http://localhost:5001/api/health${NC}"
echo -e "${GREEN}---------------------------------------------------${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Start frontend (this will run in foreground)
cd frontend-next
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
