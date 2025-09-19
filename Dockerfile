# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Copy build script
COPY railway-build.sh ./
RUN chmod +x railway-build.sh

# Copy all source code
COPY . .

# Run the build script
RUN ./railway-build.sh

# Expose port
EXPOSE 5002

# Start the backend server
CMD ["cd", "backend", "&&", "npm", "start"]
