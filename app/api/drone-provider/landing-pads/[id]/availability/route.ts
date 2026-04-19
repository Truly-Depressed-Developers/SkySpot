import { NextResponse } from 'next/server';
import { LandingPadStatus, OrderStatus } from '@prisma/client';
import { z } from 'zod';

import { authenticateDroneProviderRequest } from '@/lib/droneProviderApi';
import { prisma } from '@/prisma/prisma';
import { mapDeliveryToLandingPadReservationDTO } from '@/types/dtos';

const searchSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

const activeOrderStatuses = [OrderStatus.ORDERED, OrderStatus.PREPARING, OrderStatus.IN_TRANSIT];

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await authenticateDroneProviderRequest(request);

  if (!auth) {
    return NextResponse.json({ success: false, error: 'Brak autoryzacji' }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsed = searchSchema.safeParse({
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Nieprawidłowe parametry zapytania', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.from >= parsed.data.to) {
    return NextResponse.json(
      { success: false, error: 'Zakres czasu jest nieprawidłowy' },
      { status: 400 },
    );
  }

  const { id } = await params;

  const landingPad = await prisma.landingPad.findUnique({
    where: { id },
  });

  if (!landingPad) {
    return NextResponse.json({ success: false, error: 'Nie znaleziono lądowiska' }, { status: 404 });
  }

  const conflicts = await prisma.delivery.findMany({
    where: {
      landingPadId: landingPad.id,
      order: {
        status: {
          in: activeOrderStatuses,
        },
      },
      reservedFrom: {
        lt: parsed.data.to,
      },
      reservedTo: {
        gt: parsed.data.from,
      },
    },
  });

  const available = landingPad.status === LandingPadStatus.ACCEPTED && conflicts.length === 0;

  return NextResponse.json({
    success: true,
    data: {
      landingPadId: landingPad.id,
      available,
      landingPadStatus: landingPad.status,
      conflictingReservations: conflicts.map(mapDeliveryToLandingPadReservationDTO),
    },
  });
}