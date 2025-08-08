import express from 'express';
import prisma from './config/prisma';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import homeworkRoutes from './routes/homework.route';
import courseRoutes from './routes/courseRoutes';
import examRoutes from './routes/examRoutes';
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://academa-qxzhu4ot2-enkhmendeees-projects.vercel.app',
    'https://academa-kei.vercel.app'
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

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
