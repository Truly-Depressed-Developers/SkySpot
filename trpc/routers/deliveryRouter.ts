import { prisma } from '@/prisma/prisma';
import { mapDeliveryToDTO } from '@/types/dtos';
import { protectedProcedure, router } from '../init';
import { UserRole } from '@prisma/client';

export const deliveryRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const where =
      ctx.user.role === UserRole.USER
        ? { order: { userId: ctx.user.id } }
        : ctx.user.role === UserRole.DRONE_PROVIDER
          ? { droneProviderId: ctx.user.id }
          : {};

    const deliveries = await prisma.delivery.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return deliveries.map(mapDeliveryToDTO);
  }),
});
