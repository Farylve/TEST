import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

// Global test setup
beforeAll(async () => {
  // Reset database before tests
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "User", "RefreshToken", "Post", "Category", "Tag", "PostCategory", "PostTag", "Comment", "Like", "Project", "Contact", "Setting" RESTART IDENTITY CASCADE`;
  } catch (error) {
    console.warn('Could not truncate tables, they might not exist yet');
  }
});

// Global test teardown
afterAll(async () => {
  await prisma.$disconnect();
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>(
    Prisma.sql`SELECT tablename FROM pg_tables WHERE schemaname='public'`
  );

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(30000);

export { prisma };