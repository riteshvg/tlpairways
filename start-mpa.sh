#!/bin/bash

# start-mpa.sh - One-click script to start TLP Airways MPA

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting TLP Airways MPA (Next.js)...${NC}"

# 1. Navigate to the project directory
PROJECT_DIR="$(dirname "$0")/frontend-next"
cd "$PROJECT_DIR" || { echo -e "${RED}Error: frontend-next directory not found!${NC}"; exit 1; }

# 2. Check for stale lock files and clean them up
# This fixes the "Unable to acquire lock" error you just saw
if [ -f ".next/dev/lock" ]; then
    echo -e "${YELLOW}🧹 Found stale lock file. Cleaning up...${NC}"
    rm .next/dev/lock
fi

# 3. Check node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# 4. Start the Development Server
echo -e "${GREEN}---------------------------------------------------${NC}"
echo -e "${GREEN}Server starting...${NC}"
echo -e "Access the app at: ${YELLOW}http://localhost:3000${NC} (or next available port)"
echo -e "${GREEN}---------------------------------------------------${NC}"

npm run dev
