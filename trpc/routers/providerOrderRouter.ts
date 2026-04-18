import { prisma } from '@/prisma/prisma';
import { mapOrderToDTO } from '@/types/dtos';
import { OrderStatus } from '@prisma/client';
import { providerProcedure, router } from '../init';

export const providerOrderRouter = router({
  getWaitingToBeTaken: providerProcedure.query(async () => {
    const orders = await prisma.order.findMany({
      where: {
        delivery: null,
        status: {
          in: [OrderStatus.ORDERED],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(mapOrderToDTO);
  }),

  getAccepted: providerProcedure.query(async ({ ctx }) => {
    const orders = await prisma.order.findMany({
      where: {
        delivery: {
          is: {
            droneProviderId: ctx.user.id,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(mapOrderToDTO);
  }),
});
