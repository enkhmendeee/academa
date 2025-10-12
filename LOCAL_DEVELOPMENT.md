# Local Development Setup

This guide will help you set up the Academa application for local development.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (or use the existing Supabase connection)

## Quick Start

### Option 1: Using the Development Scripts

**Windows:**
```bash
# Run the batch script
start-dev.bat
```

**Linux/Mac:**
```bash
# Run the shell script
./start-dev.sh
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd server && npm install
   
   # Install frontend dependencies
   cd ../client && npm install
   ```

2. **Set up environment variables:**
   
   Create or update `server/.env`:
   ```env
   DATABASE_URL=postgresql://postgres.immcwfbcinwndsnhzpxd:Dontforget67!@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
   DIRECT_URL=postgresql://postgres:Dontforget67!@db.immcwfbcinwndsnhzpxd.supabase.co:5432/postgres
   JWT_SECRET=88108895
   PORT=5000
   ```

3. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```
   The backend will run on http://localhost:5000

4. **Start the frontend (in a new terminal):**
   ```bash
   cd client
   npm start
   ```
   The frontend will run on http://localhost:3000

### Option 3: Using npm scripts

```bash
# Install concurrently for running both servers
npm install

# Start both frontend and backend
npm run dev
```

## Port Configuration

- **Frontend**: http://localhost:3000 (React development server)
- **Backend**: http://localhost:5000 (Express server with API endpoints)

The frontend is configured to make API calls to `http://localhost:5000/api` when running locally.

## API Endpoints

When running locally, the backend provides these endpoints:

- `GET /test` - Test endpoint
- `GET /health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/homeworks` - Get homeworks
- `POST /api/homeworks` - Create homework
- `GET /api/courses` - Get courses
- `POST /api/courses` - Create course
- And more...

## Troubleshooting

### Server Crash Issues

If the server crashes with "Cannot find module '../types/express'" error:
- This has been fixed by updating the type reference in `server/src/index.ts`
- The server now uses `/// <reference path="../types/express.d.ts" />` instead of import

### Port Already in Use
If you get "port already in use" errors:

1. **Backend (port 5000):**
   ```bash
   # Kill process using port 5000
   npx kill-port 5000
   ```

2. **Frontend (port 3000):**
   ```bash
   # Kill process using port 3000
   npx kill-port 3000
   ```

3. **Windows - Kill specific process:**
   ```cmd
   # Find process using port
   netstat -ano | findstr :3000
   
   # Kill process by PID (replace XXXX with actual PID)
   taskkill /PID XXXX /F
   ```

### Database Connection Issues
- Ensure the DATABASE_URL in `server/.env` is correct
- Check if the Supabase database is accessible
- Run `cd server && npx prisma db push` to sync schema

### CORS Issues
The backend is configured to accept requests from:
- http://localhost:3000 (React dev server)
- http://localhost:3001
- http://localhost:5173 (Vite dev server)
- Production URLs

## Development Commands

```bash
# Run backend only
npm run dev:server

# Run frontend only  
npm run dev:client

# Run both (requires concurrently)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## File Structure

```
academa/
├── client/          # React frontend
│   ├── src/
│   │   ├── services/    # API service files
│   │   └── ...
│   └── package.json
├── server/          # Express backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route handlers
│   │   └── ...
│   ├── prisma/      # Database schema
│   └── package.json
└── package.json     # Root package.json with dev scripts
```
