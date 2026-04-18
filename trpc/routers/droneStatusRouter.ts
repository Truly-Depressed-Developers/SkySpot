import { prisma } from '@/prisma/prisma';
import { mapDroneStatusToDTO } from '@/types/dtos';
import { UserRole } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, providerProcedure, publicProcedure, router } from '../init';

export const droneStatusRouter = router({
  getAllMine: protectedProcedure.query(async ({ ctx }) => {
    let where;

    switch (ctx.user.role) {
      case UserRole.USER:
        where = {
          order: {
            userId: ctx.user.id,
          },
        };
        break;

      case UserRole.DRONE_PROVIDER:
        where = {
          order: {
            delivery: {
              is: {
                droneProviderId: ctx.user.id,
              },
            },
          },
        };
        break;

      default:
        throw new TRPCError({ code: 'FORBIDDEN' });
    }

    const droneStatuses = await prisma.droneStatus.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return droneStatuses.map(mapDroneStatusToDTO);
  }),
});
