# Production Deployment Guide

## 🚨 Critical Issues Fixed

### 1. **CORS Configuration Enhanced**
- Added dynamic CORS origin checking
- Added localhost:5000 for local development
- Added proper error logging for blocked origins

### 2. **Port Standardization**
- Fly.io uses port 3000 (configured in fly.toml)
- Local development uses port 5000 (to avoid conflicts)
- Frontend API automatically switches based on environment

## 🔧 Pre-Deployment Checklist

### Environment Variables Setup

**For Fly.io deployment:**
```bash
# Set these secrets in Fly.io
fly secrets set DATABASE_URL="your-postgresql-connection-string"
fly secrets set DIRECT_URL="your-direct-connection-string"
fly secrets set JWT_SECRET="your-secure-jwt-secret"
fly secrets set NODE_ENV="production"
```

**Generate secure JWT secret:**
```bash
# Generate a secure 32-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Setup
```bash
# Run migrations before deployment
cd server
npx prisma migrate deploy
npx prisma generate
```

## 🚀 Deployment Steps

### Option 1: Fly.io (Recommended)

1. **Install Fly CLI:**
   ```bash
   # Windows
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login and deploy:**
   ```bash
   fly auth login
   cd server
   fly deploy
   ```

3. **Check deployment:**
   ```bash
   fly status
   fly logs
   fly open
   ```

### Option 2: Vercel (Frontend Only)

1. **Deploy frontend:**
   ```bash
   cd client
   vercel --prod
   ```

2. **Update API URL in Vercel environment:**
   - Go to Vercel dashboard
   - Set environment variable: `REACT_APP_API_URL=https://academaa.fly.dev/api`

## 🔍 Testing Production Deployment

### 1. Test Backend Endpoints
```bash
# Health check
curl https://academaa.fly.dev/health

# Test endpoint
curl https://academaa.fly.dev/test

# Database connection
curl https://academaa.fly.dev/users
```

### 2. Test Frontend Connection
1. Open browser dev tools
2. Check console for API connection logs
3. Verify CORS headers in Network tab
4. Test login/register functionality

### 3. Test Authentication Flow
```bash
# Register user
curl -X POST https://academaa.fly.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password","confirmPassword":"password"}'

# Login user
curl -X POST https://academaa.fly.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## ⚠️ Common Deployment Issues

### Issue 1: Build Failures
**Problem**: Prisma generation fails
**Solution**: 
```bash
cd server
rm -rf node_modules/.prisma
npx prisma generate
npm run build
```

### Issue 2: CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**: 
- Check CORS origins in server/src/index.ts
- Verify frontend API URL configuration
- Check browser network tab for blocked requests

### Issue 3: Database Connection
**Problem**: Database connection fails
**Solution**:
- Verify DATABASE_URL is correct
- Check if database allows external connections
- Run `npx prisma db push` to sync schema

### Issue 4: Environment Variables
**Problem**: Missing environment variables
**Solution**:
```bash
# Check current secrets
fly secrets list

# Set missing secrets
fly secrets set VARIABLE_NAME="value"
```

## 🔒 Security Best Practices

1. **Never commit `.env` files**
2. **Use strong JWT secrets** (32+ characters)
3. **Enable HTTPS** (automatic with Fly.io)
4. **Set proper CORS origins** (no wildcards in production)
5. **Regular security updates** for dependencies

## 📊 Monitoring

### Fly.io Monitoring
```bash
# View logs
fly logs

# Monitor metrics
fly dashboard

# SSH into container
fly ssh console
```

### Health Checks
- Backend: `GET /health`
- Database: `GET /users` (requires auth)
- API: `GET /test`

## 🔄 CI/CD Pipeline (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Fly.io
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## 📝 Post-Deployment

1. **Update DNS** if using custom domain
2. **Set up monitoring** and alerts
3. **Configure backups** for database
4. **Test all functionality** in production
5. **Update documentation** with production URLs
