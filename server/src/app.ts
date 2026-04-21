import express from 'express';
import cors from 'cors';
import prisma from './config/prisma';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import homeworkRoutes from './routes/homeworkRoutes';
import courseRoutes from './routes/courseRoutes';
import examRoutes from './routes/examRoutes';
import userSemesterRoutes from './routes/userSemesterRoutes';
import { generalLimiter } from './middleware/rateLimiters';

/// <reference path="../types/express.d.ts" />

const app = express();
app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://academa-kei.vercel.app',
  'https://academaa.fly.dev',
];

app.use(
  cors({
    origin: (origin, callback) => {
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
    optionsSuccessStatus: 200,
  }),
);

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api', generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/homeworks', homeworkRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/semesters', userSemesterRoutes);

app.get('/test', (_req, res) => {
  res.json({ message: 'Server is working!' });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

export default app;
