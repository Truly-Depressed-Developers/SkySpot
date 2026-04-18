import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { prisma } from '@/prisma/prisma';
import {
  decryptApiKeySecret,
  encryptApiKeySecret,
  generateApiKeySecret,
  hashApiKeySecret,
} from '@/lib/companyApiKeys';
import { providerProcedure, router } from '../init';

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Nazwa klucza jest wymagana').max(80, 'Nazwa klucza jest za długa'),
});

const idSchema = z.object({
  id: z.string().min(1, 'Identyfikator klucza jest wymagany'),
});

export const companyApiKeyRouter = router({
  getMine: providerProcedure.query(async ({ ctx }) => {
    const apiKeys = await prisma.companyApiKey.findMany({
      where: {
        userId: ctx.user.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiKeys.map((apiKey) => ({
      id: apiKey.id,
      name: apiKey.name,
      secretPrefix: apiKey.secretPrefix,
      secretLast4: apiKey.secretLast4,
      createdAt: apiKey.createdAt,
    }));
  }),

  create: providerProcedure.input(createApiKeySchema).mutation(async ({ ctx, input }) => {
    const secret = generateApiKeySecret();
    const secretHash = hashApiKeySecret(secret);
    const encryptedSecret = encryptApiKeySecret(secret);

    const apiKey = await prisma.companyApiKey.create({
      data: {
        userId: ctx.user.id,
        name: input.name,
        secretHash,
        encryptedSecret,
        secretPrefix: secret.slice(0, 8),
        secretLast4: secret.slice(-4),
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      secretPrefix: apiKey.secretPrefix,
      secretLast4: apiKey.secretLast4,
      createdAt: apiKey.createdAt,
      secret,
    };
  }),

  revealSecret: providerProcedure.input(idSchema).mutation(async ({ ctx, input }) => {
    const apiKey = await prisma.companyApiKey.findFirst({
      where: {
        id: input.id,
        userId: ctx.user.id,
      },
    });

    if (!apiKey) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Nie znaleziono klucza API' });
    }

    return {
      id: apiKey.id,
      secret: decryptApiKeySecret(apiKey.encryptedSecret),
    };
  }),

  delete: providerProcedure.input(idSchema).mutation(async ({ ctx, input }) => {
    const apiKey = await prisma.companyApiKey.findFirst({
      where: {
        id: input.id,
        userId: ctx.user.id,
      },
      select: { id: true },
    });

    if (!apiKey) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Nie znaleziono klucza API' });
    }

    await prisma.companyApiKey.delete({
      where: { id: apiKey.id },
    });

    return { success: true };
  }),
});
