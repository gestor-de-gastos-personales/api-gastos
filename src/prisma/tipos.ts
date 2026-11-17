import { Prisma } from '@prisma/client';

export const prisma = Prisma;
export const errorPrisma = Prisma.PrismaClientKnownRequestError;
export type errorPrisma = Prisma.PrismaClientKnownRequestError;
