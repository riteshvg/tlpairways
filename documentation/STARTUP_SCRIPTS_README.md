# 🚀 TLAirways Development Startup Scripts

This directory contains several startup scripts to easily run the TLAirways development environment with both frontend and backend servers.

## 📋 **Available Scripts**

### **1. Full-Featured Script (Recommended)**
```bash
./start-dev.sh
```

**Features:**
- ✅ **Port Management:** Automatically checks and frees ports 3001 and 3002
- ✅ **Dependency Installation:** Automatically installs npm dependencies if needed
- ✅ **Health Checks:** Waits for both servers to be ready before showing success
- ✅ **Process Management:** Properly handles server PIDs for cleanup
- ✅ **Colored Output:** Beautiful colored terminal output with status indicators
- ✅ **Error Handling:** Comprehensive error checking and reporting
- ✅ **Cleanup:** Graceful shutdown with Ctrl+C

### **2. Simple Script (Quick Start)**
```bash
./start-simple.sh
```

**Features:**
- ✅ **Quick Startup:** Minimal script for fast development
- ✅ **Basic Cleanup:** Clears existing processes on ports
- ✅ **Simple Output:** Clean, minimal terminal output
- ✅ **Easy Stop:** Ctrl+C to stop all servers

### **3. Windows Batch File**
```cmd
start-dev.bat
```

**Features:**
- ✅ **Windows Compatible:** Works on Windows systems
- ✅ **Separate Windows:** Opens each server in its own terminal window
- ✅ **Port Management:** Clears existing processes on ports
- ✅ **Easy Management:** Close terminal windows to stop servers

## 🎯 **Server Configuration**

| Server | Port | URL | Purpose |
|--------|------|-----|---------|
| **Frontend** | 3002 | http://localhost:3002 | React development server |
| **Backend** | 3001 | http://localhost:3001 | Node.js API server |

## 🚀 **Quick Start Guide**

### **For macOS/Linux:**
```bash
# Make scripts executable (if needed)
chmod +x start-dev.sh start-simple.sh

# Start with full features
./start-dev.sh

# OR start with simple script
./start-simple.sh
```

### **For Windows:**
```cmd
# Double-click or run from command prompt
start-dev.bat
```

## 📊 **Expected Output**

### **Full-Featured Script:**
```
🚀 TLAirways Development Server Startup
=====================================

🔍 Checking system requirements...
✅ Node.js version: v18.17.0
✅ npm version: 9.6.7

🔍 Checking port 3001...
✅ Port 3001 is available

🔍 Checking port 3002...
✅ Port 3002 is available

🔧 Starting Backend Server...
Port: 3001
Directory: backend
🚀 Starting backend on port 3001...
✅ Backend started with PID: 12345

🎨 Starting Frontend Server...
Port: 3002
Directory: frontend
🚀 Starting frontend on port 3002...
✅ Frontend started with PID: 12346

⏳ Waiting for servers to be ready...
🔍 Checking backend health...
✅ Backend is ready!
🔍 Checking frontend...
✅ Frontend is ready!

🎉 TLAirways Development Servers Started Successfully!
=================================================

🔧 Backend Server:
   URL: http://localhost:3001
   Health: http://localhost:3001/api/health
   PID: 12345

🎨 Frontend Server:
   URL: http://localhost:3002
   Network: http://192.168.1.31:3002
   PID: 12346

📋 Useful Commands:
   Stop servers: Ctrl+C
   View logs: Check terminal output above
   Restart: Run this script again

🚀 Ready to develop! Open http://localhost:3002 in your browser

💡 Press Ctrl+C to stop all servers
```

### **Simple Script:**
```
🚀 Starting TLAirways Development Servers...
🔍 Cleaning up existing processes...
🔧 Starting backend on port 3001...
🎨 Starting frontend on port 3002...

✅ Servers started successfully!
🔧 Backend: http://localhost:3001
🎨 Frontend: http://localhost:3002

💡 Press Ctrl+C to stop all servers
```

## 🛠️ **Troubleshooting**

### **Port Already in Use:**
```bash
# Scripts automatically handle this, but if you need manual cleanup:
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### **Dependencies Not Installed:**
```bash
# Scripts automatically install, but manual installation:
cd backend && npm install
cd frontend && npm install
```

### **Permission Denied:**
```bash
# Make scripts executable:
chmod +x start-dev.sh start-simple.sh
```

### **Node.js Not Found:**
```bash
# Install Node.js from https://nodejs.org/
# Verify installation:
node --version
npm --version
```

## 🔧 **Customization**

### **Change Ports:**
Edit the script files and modify these variables:
```bash
FRONTEND_PORT=3002  # Change to desired port
BACKEND_PORT=3001   # Change to desired port
```

### **Add Environment Variables:**
```bash
# Add to the start commands:
PORT=3002 REACT_APP_API_URL=http://localhost:3001 npm start
```

### **Modify Health Check Endpoint:**
```bash
# Change the health check URL in start-dev.sh:
curl -s http://localhost:$BACKEND_PORT/api/health
```

## 📋 **Development Workflow**

1. **Start Development Environment:**
   ```bash
   ./start-dev.sh
   ```

2. **Open Browser:**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001/api/health

3. **Make Changes:**
   - Frontend changes auto-reload
   - Backend changes require restart (Ctrl+C and run script again)

4. **Stop Servers:**
   - Press `Ctrl+C` in the terminal
   - Or close the terminal window

## 🎯 **Features Included**

- ✅ **Automatic Port Management**
- ✅ **Dependency Installation**
- ✅ **Health Checks**
- ✅ **Process Cleanup**
- ✅ **Cross-Platform Support**
- ✅ **Error Handling**
- ✅ **Colored Output**
- ✅ **PID Management**
- ✅ **Graceful Shutdown**

## 🚀 **Next Steps**

After starting the servers:

1. **Open the application** at http://localhost:3002
2. **Test the API** at http://localhost:3001/api/health
3. **Check Adobe Analytics** data layer in browser console
4. **Start developing** your features!

---

**Happy Coding! 🎉**
