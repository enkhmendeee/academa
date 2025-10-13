import { PrismaClient } from '@prisma/client';

// Configure Prisma for Supabase connection pooling (pgBouncer on port 6543)
// This prevents "prepared statement already exists" errors with multiple instances
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?pgbouncer=true&connection_limit=1',
    },
  },
});

// Graceful shutdown to clean up connections
const cleanup = async () => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting Prisma:', error);
  }
};

process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

process.on('beforeExit', async () => {
  await cleanup();
});

export default prisma;


