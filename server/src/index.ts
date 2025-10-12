import express from 'express';
import prisma from './config/prisma';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import homeworkRoutes from './routes/homework.route';
import courseRoutes from './routes/courseRoutes';
import examRoutes from './routes/examRoutes';
import userSemesterRoutes from './routes/userSemesterRoutes';
import cors from "cors";

// Import type declarations
/// <reference path="../types/express.d.ts" />

const app = express();
app.use(express.json());
const allowedOrigins = [
  'http://localhost:3000',  // React dev server
  'http://localhost:5000',  // Local development
  'https://academa-kei.vercel.app',  // Vercel frontend
  'https://academaa.fly.dev'  // Fly.io backend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
// Add debugging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/homeworks', homeworkRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/semesters', userSemesterRoutes);

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Add error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server with proper error handling
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on ${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database URL configured: ${!!process.env.DATABASE_URL}`);
  console.log(`🔗 Health check available at: http://${HOST}:${PORT}/health`);
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});
