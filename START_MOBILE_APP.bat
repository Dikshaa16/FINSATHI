@echo off
echo ========================================
echo   FinTech SMS Extractor - Mobile App
echo ========================================
echo.
echo Starting Expo development server...
echo.
echo INSTRUCTIONS:
echo 1. Make sure Expo Go is installed on your phone
echo 2. Scan the QR code that appears
echo 3. Update API_BASE_URL in services/apiService.js with your IP
echo 4. Make sure backend is running (npm start in backend folder)
echo.
echo Press Ctrl+C to stop the server
echo.
cd mobile
npm start
