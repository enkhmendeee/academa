import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getExams = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const exams = await prisma.exam.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { examDate: 'asc' },
    });

    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

export const getExam = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const examId = parseInt(req.params.id);

    const exam = await prisma.exam.findFirst({
      where: { id: examId, userId },
      include: { course: true },
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

export const createExam = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { title, description, examDate, courseId, semester, examType, location, duration } = req.body;

    const course = await prisma.course.findFirst({
      where: { id: courseId, userId },
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
        duration: duration ? parseInt(duration) : null,
      },
      include: { course: true },
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};

export const updateExam = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const examId = parseInt(req.params.id);
    const updateData = { ...req.body };

    const existingExam = await prisma.exam.findFirst({
      where: { id: examId, userId },
    });

    if (!existingExam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    if (updateData.courseId) {
      const course = await prisma.course.findFirst({
        where: { id: updateData.courseId, userId },
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
    }

    if (updateData.examDate) {
      updateData.examDate = new Date(updateData.examDate);
    }

    if (updateData.duration) {
      updateData.duration = parseInt(updateData.duration);
    }

    const exam = await prisma.exam.update({
      where: { id: examId },
      data: updateData,
      include: { course: true },
    });

    res.json(exam);
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ error: 'Failed to update exam' });
  }
};

export const deleteExam = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const examId = parseInt(req.params.id);

    const exam = await prisma.exam.findFirst({
      where: { id: examId, userId },
    });

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    await prisma.exam.delete({
      where: { id: examId },
    });

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
};
