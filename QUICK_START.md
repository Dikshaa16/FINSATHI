# 🚀 FINSATHI - Quick Start Guide

## What is FINSATHI?
FINSATHI is a Gen Z fintech application with AI-powered financial intelligence. It features:
- 💰 **Can I Afford This?** - AI affordability engine
- 🔮 **Future Money Simulation** - Monte Carlo predictions
- 🤖 **Auto Money Flow** - Intelligent income allocation
- 🎯 **Financial Personality Score** - Behavioral analysis
- 📱 **SMS Transaction Extraction** - Real-time transaction tracking

## Demo Credentials
```
Email: demo@finsathi.com
Password: Demo123!
```

## Quick Start (3 Steps)

### 1. Start Backend
```bash
cd FINSATHI/backend
npm start
```
✅ Backend running on http://localhost:3001

### 2. Start Web App
```bash
cd FINSATHI
npm run dev
```
✅ Web app running on http://localhost:5173

### 3. Login
- Open http://localhost:5173
- Use demo credentials
- Explore all features!

## Optional: Mobile App

### Start Mobile App
```bash
cd FINSATHI/mobile
npm start
```
- Scan QR code with Expo Go app
- Login with demo credentials
- Test SMS extraction

## Features to Try

### 1. Can I Afford This? 💰
- Navigate to "Affordability" screen
- Enter item name and price
- Get AI-powered affordability analysis
- See risk level and recommendations

### 2. Future Money Simulation 🔮
- Navigate to "Simulation" screen
- Set your financial goals
- Run Monte Carlo simulation
- See probability of success

### 3. Auto Money Flow 🤖
- Navigate to "Auto Flow" screen
- Enable automatic allocation
- Set Needs/Wants/Savings percentages
- Let AI manage your money

### 4. Financial Personality 🎯
- Navigate to "Personality" screen
- Take the financial personality quiz
- Get your personality type
- See personalized recommendations

### 5. SMS Extraction (Mobile) 📱
- Open mobile app
- Login with demo credentials
- Load test SMS messages
- Process and extract transactions
- View stats and patterns

## Project Structure

```
FINSATHI/
├── backend/                 # Node.js + Express backend
│   ├── routes/             # API endpoints
│   ├── models/             # Database models
│   ├── services/           # Business logic
│   └── server.js           # Main server file
│
├── src/                    # React web app
│   ├── app/
│   │   ├── components/     # UI components
│   │   │   ├── Auth/       # Login/Register
│   │   │   ├── screens/    # Feature screens
│   │   │   └── ui/         # Reusable UI components
│   │   └── App.tsx         # Main app component
│   └── services/           # API services
│
├── mobile/                 # React Native mobile app
│   ├── App.js              # Main mobile app
│   └── services/           # Mobile services
│
└── docs/                   # Documentation
    ├── AUTHENTICATION_GUIDE.md
    ├── AUTHENTICATION_FIXED.md
    └── QUICK_START.md (this file)
```

## Tech Stack

### Backend
- Node.js + Express
- SQLite (development) / PostgreSQL (production)
- Sequelize ORM
- JWT authentication
- bcrypt password hashing

### Frontend (Web)
- React + TypeScript
- Vite
- TailwindCSS
- shadcn/ui components
- Recharts for visualizations

### Mobile
- React Native
- Expo
- AsyncStorage
- expo-sms for SMS extraction

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Features
- `POST /api/affordability/check` - Check affordability
- `POST /api/simulation/run` - Run future simulation
- `POST /api/autoflow/configure` - Configure auto flow
- `POST /api/personality/calculate` - Calculate personality
- `POST /api/sms/process` - Process SMS batch

### Transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details

### Goals
- `GET /api/goals` - Get goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here
DB_DIALECT=sqlite
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill process if needed
taskkill /F /PID <process_id>

# Restart backend
cd backend
npm start
```

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Login fails
```bash
# Recreate demo user
cd backend
node seedDemoUser.js
```

### Database errors
```bash
# Delete and recreate database
cd backend
rm database.sqlite
npm start  # Will recreate database
node seedDemoUser.js  # Create demo user
```

## Development Tips

### Hot Reload
- Backend: Uses nodemon (auto-restart on file changes)
- Frontend: Vite HMR (instant updates)
- Mobile: Expo Fast Refresh

### Debugging
- Backend logs: Check terminal where backend is running
- Frontend: Open browser DevTools (F12)
- Mobile: Shake device for Expo menu

### Testing
```bash
# Test backend health
curl http://localhost:3001/health

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@finsathi.com","password":"Demo123!"}'
```

## Next Steps

### For Development
1. Explore the codebase
2. Try all features
3. Check the intelligence engine (`backend/services/intelligenceEngine.js`)
4. Test SMS processing (`backend/services/smsProcessor.js`)
5. Customize UI components

### For Production
1. Change JWT_SECRET to a strong random string
2. Switch to PostgreSQL database
3. Set up proper environment variables
4. Enable HTTPS
5. Add email verification
6. Implement password reset
7. Set up monitoring and logging
8. Deploy to cloud (AWS, Heroku, Vercel)

## Resources

### Documentation
- `AUTHENTICATION_GUIDE.md` - Complete auth documentation
- `AUTHENTICATION_FIXED.md` - Authentication fix details
- `COMPLETE_SYSTEM_GUIDE.md` - Full system documentation
- `INTELLIGENCE_SYSTEM_COMPLETE.md` - AI intelligence details
- `SMS_SIMULATOR_GUIDE.md` - SMS processing guide

### Code Examples
- `backend/services/intelligenceEngine.js` - AI logic
- `backend/services/smsProcessor.js` - SMS parsing
- `src/app/components/screens/` - Feature implementations

## Support

### Common Issues
1. **Port already in use**: Kill the process and restart
2. **Database errors**: Delete database.sqlite and restart
3. **Login fails**: Run seedDemoUser.js
4. **CORS errors**: Check CORS_ORIGINS in backend .env
5. **Mobile app won't connect**: Use computer's IP address, not localhost

### Getting Help
1. Check backend logs
2. Check browser console
3. Check Expo logs (mobile)
4. Read documentation files
5. Test API endpoints manually

---

**Version**: 1.0.0
**Last Updated**: April 20, 2026

🎉 **Happy coding!**
