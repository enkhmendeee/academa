import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/dashboard', authenticateToken, (req, res) => {
  const user = req.user;

  res.json({ message: `Welcome, user ${user?.id}` });
});

export default router;
