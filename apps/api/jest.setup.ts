import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

declare global {
  var prisma: PrismaClient;
}

global.prisma = prisma;

export { prisma };