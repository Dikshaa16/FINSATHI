@echo off
echo ========================================
echo   FINSATHI - Complete System Startup
echo ========================================
echo.
echo Starting all services...
echo.

REM Start Backend
echo [1/3] Starting Backend API...
start "FINSATHI Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

REM Start Web App
echo [2/3] Starting Web Application...
start "FINSATHI Web App" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

REM Start Mobile App (Optional)
echo [3/3] Starting Mobile App (Optional)...
echo.
echo Do you want to start the mobile app? (Y/N)
set /p mobile="Enter choice: "
if /i "%mobile%"=="Y" (
    start "FINSATHI Mobile" cmd /k "cd mobile && npm start"
)

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo Backend API:  http://localhost:3001
echo Web App:      http://localhost:5173
echo.
echo Press any key to exit this window...
pause >nul
