import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { body, validationResult } from 'express-validator';

// Get all exams for a user
export const getExams = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const exams = await prisma.exam.findMany({
      where: {
        userId: userId
      },
      include: {
        course: true
      },
      orderBy: {
        examDate: 'asc'
      }
    });

    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

// Create a new exam
export const createExam = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = (req as any).user.id;
    const { title, description, examDate, courseId, semester, examType, location, duration } = req.body;

    // Verify the course belongs to the user
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        userId: userId
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        examDate: new Date(examDate),
        courseId,
        userId,
        semester,
        examType,
        location,
        duration: duration ? parseInt(duration) : null
      },
      include: {
        course: true
      }
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};

// Update an exam
export const updateExam = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = (req as any).user.id;
    const examId = parseInt(req.params.id);
    const updateData = req.body;

    // Verify the exam belongs to the user
    const existingExam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: userId
      }
    });

    if (!existingExam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // If courseId is being updated, verify the course belongs to the user
    if (updateData.courseId) {
      const course = await prisma.course.findFirst({
        where: {
          id: updateData.courseId,
          userId: userId
        }
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
    }

    // Convert examDate to Date if provided
    if (updateData.examDate) {
      updateData.examDate = new Date(updateData.examDate);
    }

    // Convert duration to number if provided
    if (updateData.duration) {
      updateData.duration = parseInt(updateData.duration);
    }

    const exam = await prisma.exam.update({
      where: {
        id: examId
      },
      data: updateData,
      include: {
        course: true
      }
    });

    res.json(exam);
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ error: 'Failed to update exam' });
  }
};

// Delete an exam
export const deleteExam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const examId = parseInt(req.params.id);

    // Verify the exam belongs to the user
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: userId
      }
    });

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    await prisma.exam.delete({
      where: {
        id: examId
      }
    });

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
};

// Get a single exam
export const getExam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const examId = parseInt(req.params.id);

    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: userId
      },
      include: {
        course: true
      }
    });

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
};

// Validation rules for exam creation
export const validateCreateExam = [
  body('title').notEmpty().withMessage('Title is required'),
  body('examDate').isISO8601().withMessage('Valid exam date is required'),
  body('courseId').isInt().withMessage('Valid course ID is required'),
  body('semester').optional().isString().withMessage('Semester must be a string'),
  body('examType').optional().isString().withMessage('Exam type must be a string'),
  body('location').optional().isString().withMessage('Location must be a string'),
  body('duration').optional().isInt().withMessage('Duration must be a number'),
  body('description').optional().isString().withMessage('Description must be a string')
];

// Validation rules for exam update
export const validateUpdateExam = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('examDate').optional().isISO8601().withMessage('Valid exam date is required'),
  body('courseId').optional().isInt().withMessage('Valid course ID is required'),
  body('semester').optional().isString().withMessage('Semester must be a string'),
  body('examType').optional().isString().withMessage('Exam type must be a string'),
  body('location').optional().isString().withMessage('Location must be a string'),
  body('duration').optional().isInt().withMessage('Duration must be a number'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).withMessage('Invalid status'),
  body('grade').optional().isInt({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100')
]; 