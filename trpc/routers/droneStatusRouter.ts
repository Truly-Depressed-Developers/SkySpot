import { prisma } from '@/prisma/prisma';
import { mapDroneStatusToDTO } from '@/types/dtos';
import { providerProcedure, publicProcedure, router } from '../init';

export const droneStatusRouter = router({
  getAll: publicProcedure.query(async () => {
    const droneStatuses = await prisma.droneStatus.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return droneStatuses.map(mapDroneStatusToDTO);
  }),
  getAllMine: providerProcedure.query(async ({ ctx }) => {
    const droneStatuses = await prisma.droneStatus.findMany({
      where: {
        order: {
          delivery: {
            is: {
              droneProviderId: ctx.user.id,
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return droneStatuses.map(mapDroneStatusToDTO);
  }),
});
