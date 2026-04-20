# 📱 Mobile App Login Fix

## Problem
The mobile app couldn't connect to the backend because it was using `localhost:3001`, which doesn't work on mobile devices.

## Solution Applied

### 1. Updated API URL
Changed the API base URL in `mobile/services/apiService.js` from:
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

To your computer's IP address:
```javascript
const API_BASE_URL = 'http://10.107.61.226:3001/api';
```

### 2. Updated Backend CORS
Added mobile app origins to `backend/.env`:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://10.107.61.226:8082,http://10.107.61.226:19006
```

### 3. Recreated Database
- Deleted old database
- Restarted backend
- Created demo user

## How to Test

### Step 1: Reload Mobile App
In the Expo terminal, press **`r`** to reload the app, or shake your device and tap "Reload".

### Step 2: Test Connection
1. On the login screen, tap "Test Connection"
2. You should see "Connection OK" message
3. If it works, proceed to login

### Step 3: Login
1. Enter credentials:
   - Email: `demo@finsathi.com`
   - Password: `Demo123!`
2. Tap "Login"
3. ✅ You should be logged in!

## Troubleshooting

### Still Getting Network Error?

**Option 1: Reload the App**
- In Expo terminal, press `r` to reload
- Or shake your device and tap "Reload"

**Option 2: Restart Expo**
```bash
# Stop the current process (Ctrl+C)
# Then restart:
cd mobile
npm start
```

**Option 3: Clear Cache**
```bash
cd mobile
npm start -- --clear
```

### IP Address Changed?
If your computer's IP address changes (e.g., you connect to a different WiFi), you need to:

1. Find your new IP:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (usually starts with 192.168.x.x or 10.x.x.x)

2. Update `mobile/services/apiService.js`:
   ```javascript
   const API_BASE_URL = 'http://YOUR_NEW_IP:3001/api';
   ```

3. Update `backend/.env` CORS_ORIGINS with new IP

4. Restart backend and mobile app

### Backend Not Responding?
```bash
# Check if backend is running
curl http://localhost:3001/health

# If not, restart it:
cd backend
npm start
```

### Demo User Not Found?
```bash
cd backend
node seedDemoUser.js
```

## Current Configuration

**Your Computer's IP**: `10.107.61.226`  
**Backend URL**: `http://10.107.61.226:3001/api`  
**Backend Port**: `3001`  
**Expo Port**: `8082`

**Demo Credentials**:
- Email: `demo@finsathi.com`
- Password: `Demo123!`

## Quick Test Commands

### Test Backend from Computer
```bash
curl http://localhost:3001/health
```

### Test Backend from Network
```bash
curl http://10.107.61.226:3001/health
```

### Test Login API
```bash
curl -X POST http://10.107.61.226:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@finsathi.com","password":"Demo123!"}'
```

## What to Do Now

1. **In the Expo terminal** (where mobile app is running), press **`r`** to reload
2. **On your phone**, the app should reload automatically
3. **Tap "Test Connection"** button on login screen
4. If successful, **login with demo credentials**
5. ✅ **Start testing SMS extraction!**

---

**Status**: ✅ Fixed and Ready  
**Last Updated**: April 20, 2026
