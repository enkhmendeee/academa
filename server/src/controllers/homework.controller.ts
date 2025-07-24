import { Request, Response } from "express";
import prisma from "../config/prisma"; // Adjust the import path as necessary

export const getHomeworks = async (req: Request, res: Response) => {
  const homeworks = await prisma.homework.findMany({
    where: { userId: req.user.id },
    include: { course: true },
    orderBy: { dueDate: "asc" },
  });
  res.json(homeworks);
};

export const createHomework = async (req: Request, res: Response) => {
  const { title, description, dueDate, courseId, status, grade } = req.body;
  const userId = req.user.id;

  const homework = await prisma.homework.create({
    data: {
      title,
      description,
      dueDate: new Date(dueDate),
      courseId,
      userId,
      status,
      grade,
    },
  });

  res.status(201).json(homework);
};

export const updateHomework = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { title, description, dueDate, status, grade } = req.body;

  const updated = await prisma.homework.update({
    where: { id },
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status,
      grade,
    },
  });

  res.json(updated);
};

export const deleteHomework = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await prisma.homework.delete({ where: { id } });
  res.status(204).send();
};
