import { prisma } from '@/prisma/prisma';
import { mapOrderToDTO } from '@/types/dtos';
import { router, userProcedure } from '../init';

export const userOrderRouter = router({
  getMine: userProcedure.query(async ({ ctx }) => {
    const orders = await prisma.order.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(mapOrderToDTO);
  }),
});
