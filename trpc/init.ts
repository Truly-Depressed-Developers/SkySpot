import { initTRPC, TRPCError } from '@trpc/server';
import { UserRole } from '@prisma/client';
import superjson from 'superjson';
import { Context } from './context';

const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.authorized) throw new TRPCError({ code: 'UNAUTHORIZED' });

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

const roleProcedure = (allowedRoles: UserRole[]) =>
  protectedProcedure.use(async (opts) => {
    const { ctx, next } = opts;

    if (!allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return next({
      ctx: {
        user: ctx.user,
      },
    });
  });

export const userProcedure = roleProcedure([UserRole.USER]);
export const providerProcedure = roleProcedure([UserRole.DRONE_PROVIDER]);
export const moderatorProcedure = roleProcedure([UserRole.MODERATOR]);
