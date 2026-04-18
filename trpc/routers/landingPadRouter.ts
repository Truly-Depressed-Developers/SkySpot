import { LandingPadAvailability, LandingPadStatus, LandingPadType } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '@/prisma/prisma';
import { mapLandingPadToDetailsDTO } from '@/types/dtos';

import { moderatorProcedure, publicProcedure, router, userProcedure } from '../init';

const createLandingPadSchema = z.object({
  name: z.string().min(1, 'Nazwa punktu jest wymagana'),
  description: z.string().min(1, 'Opis punktu jest wymagany'),
  imageUrl: z.string().min(1, 'Zdjęcie punktu jest wymagane'),
  coords: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  type: z.enum(LandingPadType),
  availability: z.enum(LandingPadAvailability),
});

const updateLandingPadSchema = createLandingPadSchema.extend({
  id: z.string(),
});

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

  create: userProcedure.input(createLandingPadSchema).mutation(async ({ input }) => {
    const landingPad = await prisma.landingPad.create({
      data: {
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        latitude: input.coords.lat,
        longitude: input.coords.lng,
        type: input.type,
        availability: input.availability,
      },
      include: {
        deliveries: true,
      },
    });

    return mapLandingPadToDetailsDTO(landingPad);
  }),

  updateStatus: moderatorProcedure
    .input(z.object({ id: z.string(), status: z.enum(LandingPadStatus) }))
    .mutation(async ({ input }) => {
      const landingPad = await prisma.landingPad.update({
        where: { id: input.id },
        data: { status: input.status },
        include: { deliveries: true },
      });
      return mapLandingPadToDetailsDTO(landingPad);
    }),

  update: moderatorProcedure.input(updateLandingPadSchema).mutation(async ({ input }) => {
    const landingPad = await prisma.landingPad.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        latitude: input.coords.lat,
        longitude: input.coords.lng,
        type: input.type,
        availability: input.availability,
      },
      include: {
        deliveries: true,
      },
    });
    return mapLandingPadToDetailsDTO(landingPad);
  }),
});
