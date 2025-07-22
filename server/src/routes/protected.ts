import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/dashboard', authenticateToken, (req, res) => {
  const user = req.user as { userId: number }; // type-safe
  res.json({ message: `Welcome, user ${user.userId}` });
});

export default router;
