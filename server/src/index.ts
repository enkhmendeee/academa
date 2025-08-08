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
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://academa-9tytvwwd5-enkhmendeees-projects.vercel.app', 'http://localhost:5174'] 
    : 'http://localhost:5174',
  credentials: true,
}));
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/homeworks', homeworkRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exams', examRoutes);

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
