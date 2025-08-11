import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getUserSemesters = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const semesters = await prisma.userSemester.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(semesters.map(s => s.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch semesters" });
  }
};

export const addUserSemester = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: "Semester name is required" });
  }

  try {
    const semester = await prisma.userSemester.create({
      data: {
        name: name.trim(),
        userId
      }
    });

    res.status(201).json({ name: semester.name });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: "Semester already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to add semester" });
  }
};

export const updateUserSemester = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { oldName, newName } = req.body;

  if (!oldName || !newName || typeof oldName !== 'string' || typeof newName !== 'string') {
    return res.status(400).json({ error: "Old and new semester names are required" });
  }

  try {
    const semester = await prisma.userSemester.update({
      where: {
        userId_name: {
          userId,
          name: oldName.trim()
        }
      },
      data: {
        name: newName.trim()
      }
    });

    res.json({ name: semester.name });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Semester not found" });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: "New semester name already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update semester" });
  }
};

export const deleteUserSemester = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { name } = req.params;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: "Semester name is required" });
  }

  try {
    // Check if semester has associated data
    const hasCourses = await prisma.course.findFirst({
      where: { userId, semester: name }
    });

    const hasHomeworks = await prisma.homework.findFirst({
      where: { userId, semester: name }
    });

    const hasExams = await prisma.exam.findFirst({
      where: { userId, semester: name }
    });

    if (hasCourses || hasHomeworks || hasExams) {
      return res.status(400).json({ error: "Cannot delete semester with existing data" });
    }

    await prisma.userSemester.delete({
      where: {
        userId_name: {
          userId,
          name: name.trim()
        }
      }
    });

    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Semester not found" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to delete semester" });
  }
};
