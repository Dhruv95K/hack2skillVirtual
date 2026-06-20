import { PrismaClient } from '@prisma/client';
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  if (process.env.NODE_ENV === 'development') {
    console.info('[prisma] Client initialized (development mode, query logging enabled)');
  }
}