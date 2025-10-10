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
import '../types/express';

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://academa-qxzhu4ot2-enkhmendeees-projects.vercel.app',
    'https://academa-kei.vercel.app',
    'https://academa-gl5b.onrender.com',
    'https://academaa.fly.dev'
  ],
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

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database URL configured: ${!!process.env.DATABASE_URL}`);
});
