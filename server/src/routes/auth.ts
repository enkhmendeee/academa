import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { PrismaClient } from '../generated/prisma';
import { body } from "express-validator";
import { validateRequest } from "../middleware/validateRequest";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('username').isString().notEmpty(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    const { email, password, username } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
        },
      });
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );
      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          motto: user.motto,
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: 'User registration failed' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        motto: user.motto,
      },
    });
  }
);

router.patch(
  '/profile',
  [
    authenticateToken,
    body('motto').optional().isString(),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    console.log('Profile update endpoint called');
    console.log('User from token:', req.user);
    console.log('Request body:', req.body);
    
    const userId = req.user && req.user.id;
    const { motto } = req.body;

    console.log('User ID:', userId);
    console.log('Motto to update:', motto);

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { motto },
        select: {
          id: true,
          username: true,
          email: true,
          motto: true,
        },
      });

      console.log('Updated user:', updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

export default router;