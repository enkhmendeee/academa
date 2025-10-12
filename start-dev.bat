@echo off
echo Starting Academa Development Environment...

echo.
echo Setting up environment variables...
set PORT=5000

echo.
echo Starting backend server on port 5000...
start "Backend Server" cmd /k "cd server && set PORT=5000 && npm run dev"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting frontend on port 3000...
start "Frontend Client" cmd /k "cd client && npm start"

echo.
echo Development environment started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
