import type { Prisma } from '@prisma/client';

declare module '@prisma/client' {
  interface PrismaClient {
    companyApiKey: Prisma.CompanyApiKeyDelegate;
  }
}