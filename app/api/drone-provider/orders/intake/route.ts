import { NextResponse } from 'next/server';
import { LandingPadStatus, OrderStatus, OrderType, UserRole } from '@prisma/client';
import { z } from 'zod';

import { authenticateDroneProviderRequest } from '@/lib/droneProviderApi';
import { prisma } from '@/prisma/prisma';
import { mapOrderToDTO } from '@/types/dtos';

const intakeSchema = z.object({
  userId: z.string().min(1).optional(),
  landingPadId: z.string().min(1),
  type: z.enum(OrderType),
  weight: z.number().positive(),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  description: z.string().min(1),
});

export async function POST(request: Request) {
  const auth = await authenticateDroneProviderRequest(request);

  if (!auth) {
    return NextResponse.json({ success: false, error: 'Brak autoryzacji' }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Nieprawidłowe dane JSON' }, { status: 400 });
  }

  const parsed = intakeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Nieprawidłowy payload zlecenia', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = parsed.data.userId
    ? await prisma.user.findFirst({
        where: {
          id: parsed.data.userId,
          role: UserRole.USER,
        },
        select: {
          id: true,
        },
      })
    : await prisma.user.findFirst({
        where: {
          role: UserRole.USER,
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
        },
      });

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.data.userId
          ? 'Nie znaleziono użytkownika końcowego o podanym id'
          : 'Brak użytkowników końcowych do przypisania zamówienia',
      },
      { status: 404 },
    );
  }

  const landingPad = await prisma.landingPad.findFirst({
    where: {
      id: parsed.data.landingPadId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!landingPad) {
    return NextResponse.json({ success: false, error: 'Nie znaleziono lądowiska' }, { status: 404 });
  }

  if (landingPad.status !== LandingPadStatus.ACCEPTED) {
    return NextResponse.json({ success: false, error: 'Lądowisko nie jest zaakceptowane' }, { status: 409 });
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      landingPadId: landingPad.id,
      type: parsed.data.type,
      status: OrderStatus.ORDERED,
      weight: parsed.data.weight,
      destinationLatitude: parsed.data.destination.lat,
      destinationLongitude: parsed.data.destination.lng,
      description: parsed.data.description,
    },
  });

  return NextResponse.json({ success: true, data: mapOrderToDTO(order) });
}