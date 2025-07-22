import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/dashboard', authenticateToken, (req, res) => {
  const payload = req.user as jwt.JwtPayload;
  const userId = payload.userId;
  res.json({ message: `Welcome, user ${userId}` });
});

export default router;
