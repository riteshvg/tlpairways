#!/bin/bash

# TLAirways Development Server Startup Script
# This script starts both frontend and backend servers on specified ports

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=3002
BACKEND_PORT=3001
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"

echo -e "${BLUE}🚀 TLAirways Development Server Startup${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    echo -e "${YELLOW}🔍 Checking port $port...${NC}"
    if check_port $port; then
        echo -e "${YELLOW}⚠️  Port $port is in use. Stopping existing processes...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 2
        if check_port $port; then
            echo -e "${RED}❌ Failed to free port $port${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ Port $port is now free${NC}"
        fi
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
    fi
}

# Function to start backend server
start_backend() {
    echo -e "${CYAN}🔧 Starting Backend Server...${NC}"
    echo -e "${CYAN}Port: $BACKEND_PORT${NC}"
    echo -e "${CYAN}Directory: $BACKEND_DIR${NC}"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "${RED}❌ Backend directory '$BACKEND_DIR' not found${NC}"
        exit 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json not found in backend directory${NC}"
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
        npm install
    fi
    
    # Start backend server
    echo -e "${GREEN}🚀 Starting backend on port $BACKEND_PORT...${NC}"
    PORT=$BACKEND_PORT npm start &
    BACKEND_PID=$!
    
    cd ..
    echo -e "${GREEN}✅ Backend started with PID: $BACKEND_PID${NC}"
}

# Function to start frontend server
start_frontend() {
    echo -e "${PURPLE}🎨 Starting Frontend Server...${NC}"
    echo -e "${PURPLE}Port: $FRONTEND_PORT${NC}"
    echo -e "${PURPLE}Directory: $FRONTEND_DIR${NC}"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}❌ Frontend directory '$FRONTEND_DIR' not found${NC}"
        exit 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json not found in frontend directory${NC}"
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install
    fi
    
    # Start frontend server
    echo -e "${GREEN}🚀 Starting frontend on port $FRONTEND_PORT...${NC}"
    PORT=$FRONTEND_PORT npm start &
    FRONTEND_PID=$!
    
    cd ..
    echo -e "${GREEN}✅ Frontend started with PID: $FRONTEND_PID${NC}"
}

# Function to wait for servers to be ready
wait_for_servers() {
    echo -e "${BLUE}⏳ Waiting for servers to be ready...${NC}"
    
    # Wait for backend
    echo -e "${CYAN}🔍 Checking backend health...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:$BACKEND_PORT/api/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is ready!${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Backend failed to start within 30 seconds${NC}"
            exit 1
        fi
        sleep 1
    done
    
    # Wait for frontend
    echo -e "${PURPLE}🔍 Checking frontend...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend is ready!${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Frontend failed to start within 30 seconds${NC}"
            exit 1
        fi
        sleep 1
    done
}

# Function to show server information
show_server_info() {
    echo ""
    echo -e "${GREEN}🎉 TLAirways Development Servers Started Successfully!${NC}"
    echo -e "${GREEN}=================================================${NC}"
    echo ""
    echo -e "${CYAN}🔧 Backend Server:${NC}"
    echo -e "   URL: ${BLUE}http://localhost:$BACKEND_PORT${NC}"
    echo -e "   Health: ${BLUE}http://localhost:$BACKEND_PORT/api/health${NC}"
    echo -e "   PID: ${YELLOW}$BACKEND_PID${NC}"
    echo ""
    echo -e "${PURPLE}🎨 Frontend Server:${NC}"
    echo -e "   URL: ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
    echo -e "   Network: ${BLUE}http://$(ipconfig getifaddr en0):$FRONTEND_PORT${NC}"
    echo -e "   PID: ${YELLOW}$FRONTEND_PID${NC}"
    echo ""
    echo -e "${YELLOW}📋 Useful Commands:${NC}"
    echo -e "   Stop servers: ${RED}Ctrl+C${NC}"
    echo -e "   View logs: Check terminal output above"
    echo -e "   Restart: Run this script again"
    echo ""
    echo -e "${GREEN}🚀 Ready to develop! Open http://localhost:$FRONTEND_PORT in your browser${NC}"
    echo ""
}

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${CYAN}🔧 Stopping backend (PID: $BACKEND_PID)${NC}"
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${PURPLE}🎨 Stopping frontend (PID: $FRONTEND_PID)${NC}"
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Kill any remaining processes on our ports
    lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null
    lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null
    
    echo -e "${GREEN}✅ All servers stopped${NC}"
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM

# Main execution
echo -e "${YELLOW}🔍 Checking system requirements...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"
echo ""

# Check and free ports
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT
echo ""

# Start servers
start_backend
echo ""
start_frontend
echo ""

# Wait for servers to be ready
wait_for_servers

# Show server information
show_server_info

# Keep script running and wait for interrupt
echo -e "${YELLOW}💡 Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for user interrupt
while true; do
    sleep 1
done
