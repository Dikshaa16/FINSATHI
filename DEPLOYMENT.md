# Gen Z Fintech - Deployment Guide

This guide covers deploying the Gen Z Fintech application with a proper database backend.

## Architecture

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + PostgreSQL
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens
- **Deployment**: Docker + Docker Compose

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### 1. Database Setup

#### Option A: Using Docker
```bash
# Start PostgreSQL with Docker
docker run --name fintech-postgres \
  -e POSTGRES_DB=fintech_db \
  -e POSTGRES_USER=fintech_user \
  -e POSTGRES_PASSWORD=fintech_password \
  -p 5432:5432 \
  -d postgres:15-alpine
```

#### Option B: Local PostgreSQL
```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE fintech_db;
CREATE USER fintech_user WITH PASSWORD 'fintech_password';
GRANT ALL PRIVILEGES ON DATABASE fintech_db TO fintech_user;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://fintech_user:fintech_password@localhost:5432/fintech_db

# Start the backend server
npm run dev
```

The backend will be available at `http://localhost:3001`

### 3. Frontend Setup

```bash
# From project root
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API URL
# VITE_API_URL=http://localhost:3001/api

# Start the frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Production Deployment

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd fintech-app

# Copy and configure environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit environment files with production values
# IMPORTANT: Change JWT_SECRET and database passwords!

# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

Services will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

### Manual Production Setup

#### 1. Database Setup
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE fintech_db;
CREATE USER fintech_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE fintech_db TO fintech_user;
\q
```

#### 2. Backend Deployment
```bash
cd backend

# Install dependencies
npm ci --only=production

# Set environment variables
export NODE_ENV=production
export DATABASE_URL=postgresql://fintech_user:your_secure_password@localhost:5432/fintech_db
export JWT_SECRET=your_very_long_and_random_jwt_secret
export PORT=3001

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name fintech-backend

# Or start directly
npm start
```

#### 3. Frontend Deployment
```bash
# Build the frontend
npm run build

# Serve with nginx or any static file server
# Copy dist/ folder to your web server
```

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fintech_db
DB_USER=fintech_user
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_very_long_random_secret_key
NODE_ENV=production

# Server
PORT=3001
CORS_ORIGINS=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=Gen Z Fintech
VITE_NODE_ENV=production
```

## Cloud Deployment Options

### 1. Vercel + Railway
- **Frontend**: Deploy to Vercel
- **Backend + Database**: Deploy to Railway

### 2. Netlify + Heroku
- **Frontend**: Deploy to Netlify
- **Backend**: Deploy to Heroku with Heroku Postgres

### 3. AWS
- **Frontend**: S3 + CloudFront
- **Backend**: EC2 or ECS
- **Database**: RDS PostgreSQL

### 4. DigitalOcean
- **Full Stack**: App Platform
- **Database**: Managed PostgreSQL

## Database Migrations

The app uses Sequelize ORM with automatic migrations in development:

```bash
# In development, models sync automatically
# In production, run migrations manually:

cd backend
npm run migrate
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Features
- `POST /api/affordability/analyze` - Analyze purchase affordability
- `POST /api/simulation/run` - Run Monte Carlo simulation
- `GET /api/autoflow/status` - Get auto flow status
- `POST /api/autoflow/toggle` - Enable/disable auto flow

### Data Management
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create goal

## Security Considerations

1. **Change default passwords** in production
2. **Use strong JWT secrets** (64+ characters)
3. **Enable HTTPS** in production
4. **Configure CORS** properly
5. **Set up rate limiting**
6. **Use environment variables** for secrets
7. **Regular security updates**

## Monitoring & Logging

### Health Checks
- Backend: `GET /health`
- Database: Connection status in logs

### Logging
- Backend logs to console (configure log aggregation)
- Frontend errors to browser console
- Database query logs (disable in production)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify connection string
   - Check firewall settings

2. **CORS Errors**
   - Update CORS_ORIGINS in backend .env
   - Ensure frontend URL is included

3. **JWT Token Issues**
   - Check JWT_SECRET is set
   - Verify token expiration
   - Clear browser localStorage

4. **Build Failures**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Check environment variables

### Logs
```bash
# Docker logs
docker-compose logs backend
docker-compose logs frontend

# PM2 logs
pm2 logs fintech-backend

# Database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

## Performance Optimization

1. **Database Indexing**: Indexes on userId, transactionDate, category
2. **API Caching**: Redis for session storage
3. **Frontend Optimization**: Code splitting, lazy loading
4. **CDN**: Use CDN for static assets
5. **Compression**: Gzip enabled in nginx

## Backup Strategy

1. **Database Backups**: Daily automated backups
2. **Code Backups**: Git repository with tags
3. **Environment Configs**: Secure backup of .env files

This deployment setup provides a production-ready fintech application with proper database persistence, security, and scalability.