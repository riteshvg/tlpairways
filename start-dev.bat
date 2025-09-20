@echo off
REM TLAirways Development Server Startup Script for Windows
REM This script starts both frontend and backend servers on specified ports

echo 🚀 TLAirways Development Server Startup
echo =====================================
echo.

REM Configuration
set FRONTEND_PORT=3002
set BACKEND_PORT=3001

REM Function to check if a port is in use
echo 🔍 Checking ports...

REM Kill any existing processes on our ports
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":3002" ^| find "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo ✅ Ports cleared
echo.

REM Start backend server
echo 🔧 Starting Backend Server on port %BACKEND_PORT%...
cd backend
start "Backend Server" cmd /k "set PORT=%BACKEND_PORT% && npm start"
cd ..

REM Start frontend server
echo 🎨 Starting Frontend Server on port %FRONTEND_PORT%...
cd frontend
start "Frontend Server" cmd /k "set PORT=%FRONTEND_PORT% && npm start"
cd ..

echo.
echo ✅ Servers started successfully!
echo 🔧 Backend: http://localhost:%BACKEND_PORT%
echo 🎨 Frontend: http://localhost:%FRONTEND_PORT%
echo.
echo 💡 Close the terminal windows to stop the servers
echo 🚀 Ready to develop! Open http://localhost:%FRONTEND_PORT% in your browser
echo.
pause
