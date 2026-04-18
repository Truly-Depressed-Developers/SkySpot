import { prisma } from '@/prisma/prisma';
import { mapLandingPadToDetailsDTO } from '@/types/dtos';
import { publicProcedure, router } from '../init';

export const landingPadRouter = router({
  getAll: publicProcedure.query(async () => {
    const landingPads = await prisma.landingPad.findMany({
      include: {
        deliveries: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return landingPads.map(mapLandingPadToDetailsDTO);
  }),
});
