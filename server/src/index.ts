import express from 'express';
import prisma from './config/prisma';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import homeworkRoutes from './routes/homework.route';
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5174', // Adjust this to your client URL
  credentials: true,
}));
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/homeworks', homeworkRoutes);

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
