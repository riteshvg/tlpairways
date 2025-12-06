#!/bin/bash
set -e

echo "Building Next.js MPA application..."

# Navigate to frontend-next directory
cd frontend-next

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the Next.js application
echo "Building Next.js app..."
npm run build

echo "Build completed successfully!"
