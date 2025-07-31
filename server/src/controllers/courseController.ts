import { Request, Response } from "express";
import prisma from "../config/prisma";;

export const createCourse = async (req: Request, res: Response) => {
  const { name} = req.body;
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const course = await prisma.course.create({
      data: { name, userId },
    });

    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create course" });
  }
};

export const getCourses = async (req: Request, res: Response) => {
  const userId = req.user.id;

  const courses = await prisma.course.findMany({
    where: { userId },
    include: { homeworks: true }, // optional
  });

  res.json(courses);
};

export const getCourseById = async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.id);
  const userId = req.user.id;

  const course = await prisma.course.findFirst({
    where: { id: courseId, userId },
    include: { homeworks: true },
  });

  if (!course) return res.status(404).json({ error: "Course not found" });

  res.json(course);
};

export const deleteCourse = async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.id);

  try {
    await prisma.course.delete({
      where: {
        id: courseId,
        // optional: enforce userId check in application logic
      },
    });

    res.sendStatus(204);
  } catch {
    res.status(404).json({ error: "Course not found or not yours" });
  }
};
