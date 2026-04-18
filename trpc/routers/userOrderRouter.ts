import { prisma } from '@/prisma/prisma';
import { mapOrderToUserOrderDTO } from '@/types/dtos';
import { router, userProcedure } from '../init';

export const userOrderRouter = router({
  getMine: userProcedure.query(async ({ ctx }) => {
    const orders = await prisma.order.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        delivery: true,
      },
    });

    return orders.map(mapOrderToUserOrderDTO);
  }),
});
