import prisma from '../config/prisma';

export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Homework", "Exam", "Course", "UserSemester", "User" RESTART IDENTITY CASCADE',
  );
}

export async function disconnect() {
  await prisma.$disconnect();
}
