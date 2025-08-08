import express, { Request, Response } from 'express';
import { body } from "express-validator";
import { validateRequest } from "../middleware/validateRequest";
import { authenticateToken } from "../middleware/authMiddleware";
import prisma from "../config/prisma";

const router = express.Router();

// Get all exams for the authenticated user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user && req.user.id;
    const exams = await prisma.exam.findMany({
      where: { userId },
      include: {
        course: true,
      },
      orderBy: { examDate: 'asc' },
    });
    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Create a new exam
router.post('/', [
  authenticateToken,
  body('title').isString().notEmpty(),
  body('examDate').isISO8601(),
  body('courseId').isInt(),
  body('examType').optional().isString(),
  body('location').optional().isString(),
  body('duration').optional().isInt(),
  body('semester').optional().isString(),
  validateRequest,
], async (req: Request, res: Response) => {
  try {
    const userId = req.user && req.user.id;
    const { title, examDate, courseId, examType, location, duration, semester } = req.body;

    const exam = await prisma.exam.create({
      data: {
        title,
        examDate: new Date(examDate),
        courseId: parseInt(courseId),
        userId,
        examType,
        location,
        duration: duration ? parseInt(duration) : null,
        semester,
      },
      include: {
        course: true,
      },
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

// Update an exam
router.patch('/:id', [
  authenticateToken,
  body('title').optional().isString(),
  body('examDate').optional().isISO8601(),
  body('courseId').optional().isInt(),
  body('examType').optional().isString(),
  body('location').optional().isString(),
  body('duration').optional().isInt(),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']),
  body('grade').optional().isInt({ min: 0, max: 100 }),
  validateRequest,
], async (req: Request, res: Response) => {
  try {
    const userId = req.user && req.user.id;
    const examId = parseInt(req.params.id);
    const updateData = req.body;

    // Convert examDate to Date object if provided
    if (updateData.examDate) {
      updateData.examDate = new Date(updateData.examDate);
    }

    // Convert courseId to number if provided
    if (updateData.courseId) {
      updateData.courseId = parseInt(updateData.courseId);
    }

    // Convert duration to number if provided
    if (updateData.duration) {
      updateData.duration = parseInt(updateData.duration);
    }

    // Convert grade to number if provided
    if (updateData.grade) {
      updateData.grade = parseInt(updateData.grade);
    }

    const exam = await prisma.exam.update({
      where: { 
        id: examId,
        userId, // Ensure user can only update their own exams
      },
      data: updateData,
      include: {
        course: true,
      },
    });

    res.json(exam);
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ error: 'Failed to update exam' });
  }
});

// Delete an exam
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user && req.user.id;
    const examId = parseInt(req.params.id);

    await prisma.exam.delete({
      where: { 
        id: examId,
        userId, // Ensure user can only delete their own exams
      },
    });

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

export default router; 