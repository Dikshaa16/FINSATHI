# 🔐 Authentication System Guide

## Overview
FINSATHI uses JWT (JSON Web Token) based authentication with bcrypt password hashing for secure user authentication across both web and mobile applications.

## Demo Credentials
```
Email: demo@finsathi.com
Password: Demo123!
```

## Architecture

### Backend (Node.js + Express + Sequelize)
- **Location**: `backend/routes/auth.js`
- **Database**: SQLite (development) / PostgreSQL (production)
- **Password Hashing**: bcrypt with 12 rounds
- **Token**: JWT with 7-day expiration

### Frontend (React Web App)
- **Location**: `src/app/components/Auth/AuthScreen.tsx`
- **Features**:
  - Beautiful gradient UI with animated elements
  - Toggle between Login and Register
  - Form validation and error handling
  - Loading states
  - Demo credentials display

### Mobile (React Native + Expo)
- **Location**: `mobile/App.js`
- **Features**:
  - Native mobile login screen
  - Token persistence with AsyncStorage
  - Demo credentials display
  - Connection testing

## API Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+91 9876543210",
  "dateOfBirth": "1995-01-15"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    ...
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "demo@finsathi.com",
  "password": "Demo123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "demo@finsathi.com",
    "firstName": "Demo",
    "lastName": "User",
    "financialProfile": {
      "monthlyIncome": 50000,
      "currentBalance": 25000,
      ...
    }
  },
  "token": "jwt_token_here"
}
```

### GET /api/auth/verify
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "demo@finsathi.com",
    ...
  }
}
```

## Security Features

### Password Security
- **Hashing Algorithm**: bcrypt
- **Salt Rounds**: 12 (provides strong security)
- **Automatic Hashing**: Passwords are automatically hashed before saving using Sequelize hooks
- **Comparison**: Secure password comparison using bcrypt.compare()

### Token Security
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 7 days
- **Secret**: Stored in environment variable (JWT_SECRET)
- **Storage**: 
  - Web: localStorage
  - Mobile: AsyncStorage

### API Security
- **Helmet**: Security headers
- **CORS**: Configured origins
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Email format, required fields

## Database Models

### User Model
```javascript
{
  id: UUID (Primary Key),
  email: STRING (Unique, Required),
  password: STRING (Hashed, Required),
  firstName: STRING (Required),
  lastName: STRING (Required),
  phoneNumber: STRING,
  dateOfBirth: DATE,
  profilePicture: STRING,
  isActive: BOOLEAN (Default: true),
  lastLoginAt: DATE,
  createdAt: DATE,
  updatedAt: DATE
}
```

### Financial Profile Model
```javascript
{
  id: UUID (Primary Key),
  userId: UUID (Foreign Key -> User),
  monthlyIncome: DECIMAL,
  currentBalance: DECIMAL,
  fixedExpenses: DECIMAL,
  averageDailySpending: DECIMAL,
  spendingConsistency: DECIMAL,
  impulsiveness: DECIMAL,
  savingsGoalAdherence: DECIMAL,
  needsDiscipline: DECIMAL,
  wantsDiscipline: DECIMAL,
  savingsDiscipline: DECIMAL,
  autoFlowEnabled: BOOLEAN,
  needsPercentage: INTEGER,
  wantsPercentage: INTEGER,
  savingsPercentage: INTEGER,
  personalityScore: INTEGER,
  personalityType: STRING,
  createdAt: DATE,
  updatedAt: DATE
}
```

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install

# Create .env file with:
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
DB_DIALECT=sqlite
```

### 2. Create Demo User
```bash
cd backend
node seedDemoUser.js
```

### 3. Start Backend
```bash
cd backend
npm start
```

### 4. Start Web App
```bash
cd FINSATHI
npm run dev
```

### 5. Start Mobile App
```bash
cd mobile
npm start
```

## Testing Authentication

### Web App
1. Open http://localhost:5173
2. You'll see the login screen
3. Use demo credentials or register a new account
4. After login, you'll see the main dashboard

### Mobile App
1. Start Expo: `npm start` in mobile folder
2. Scan QR code with Expo Go app
3. Use demo credentials to login
4. Test SMS extraction features

### API Testing (curl)
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@finsathi.com","password":"Demo123!"}'

# Verify Token
curl -X GET http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### "Invalid credentials" Error
**Cause**: Password hash mismatch or user doesn't exist

**Solution**:
1. Delete and recreate demo user:
   ```bash
   cd backend
   node seedDemoUser.js
   ```
2. Make sure backend is running
3. Check backend logs for errors

### Database Sync Errors
**Cause**: Foreign key constraints or schema changes

**Solution**:
1. Temporarily change sync mode in `backend/server.js`:
   ```javascript
   await sequelize.sync({ force: true }); // WARNING: Deletes all data
   ```
2. Restart backend
3. Run seed script
4. Change back to `{ alter: true }`

### Token Not Persisting
**Web App**: Check browser localStorage
**Mobile App**: Check AsyncStorage implementation

### CORS Errors
Update `backend/.env`:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:19006
```

## Best Practices

### For Development
- Use demo account for testing
- Keep JWT_SECRET in .env file
- Use SQLite for local development
- Enable detailed error logging

### For Production
- Change JWT_SECRET to a strong random string
- Use PostgreSQL database
- Enable HTTPS only
- Implement refresh tokens
- Add email verification
- Add password reset functionality
- Implement 2FA (Two-Factor Authentication)
- Add rate limiting per user
- Log authentication attempts
- Implement account lockout after failed attempts

## Future Enhancements

### Planned Features
- [ ] Email verification on registration
- [ ] Password reset via email
- [ ] Two-Factor Authentication (2FA)
- [ ] Social login (Google, Facebook)
- [ ] Refresh token rotation
- [ ] Session management
- [ ] Device tracking
- [ ] Login history
- [ ] Account security settings
- [ ] Biometric authentication (mobile)

## Files Reference

### Backend
- `backend/routes/auth.js` - Authentication routes
- `backend/models/User.js` - User model with password hashing
- `backend/models/FinancialProfile.js` - Financial profile model
- `backend/middleware/auth.js` - JWT verification middleware
- `backend/seedDemoUser.js` - Demo user creation script

### Frontend (Web)
- `src/app/components/Auth/AuthScreen.tsx` - Login/Register UI
- `src/app/Root.tsx` - Authentication flow and protected routes
- `src/app/components/Layout/DesktopSidebar.tsx` - Logout button
- `src/services/api.ts` - API service with token management

### Mobile
- `mobile/App.js` - Login screen and authentication flow
- `mobile/services/apiService.js` - API service with token management

## Support

For issues or questions:
1. Check backend logs: `cd backend && npm start`
2. Check browser console (web app)
3. Check Expo logs (mobile app)
4. Verify demo credentials are correct
5. Test API connection manually

---

**Last Updated**: April 20, 2026
**Version**: 1.0.0
