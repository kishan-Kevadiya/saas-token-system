import { PrismaClient } from '@prisma/client';
import logger from '../src/lib/logger';
import { dummyData } from './dummudata.seed';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  let isError: boolean = false;
  try {
    // await seed();
    await dummyData();
  } catch (e) {
    isError = true;
    logger.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit(isError ? 1 : 0);
  }
}

void main();
