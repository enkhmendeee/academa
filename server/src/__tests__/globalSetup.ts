import * as path from 'path';
import * as dotenv from 'dotenv';

export default async function globalSetup() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env.test'), override: true });

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.$connect();
  await prisma.$disconnect();
}
