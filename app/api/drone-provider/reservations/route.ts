import { NextResponse } from 'next/server';
import { LandingPadStatus, OrderStatus } from '@prisma/client';
import { z } from 'zod';

import { authenticateDroneProviderRequest } from '@/lib/droneProviderApi';
import { invalidateLandingPadAvailability } from '@/lib/landingPadAvailabilityCache';
import { prisma } from '@/prisma/prisma';
import { mapDeliveryToDTO } from '@/types/dtos';

const activeOrderStatuses = [OrderStatus.ORDERED, OrderStatus.PREPARING, OrderStatus.IN_TRANSIT];

const createReservationSchema = z.object({
  orderId: z.string().min(1),
  droneId: z.string().min(1),
  reservedFrom: z.coerce.date(),
  reservedTo: z.coerce.date(),
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

  const parsed = createReservationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Nieprawidłowy payload rezerwacji', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.reservedFrom >= parsed.data.reservedTo) {
    return NextResponse.json(
      { success: false, error: 'Zakres czasu jest nieprawidłowy' },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderId: parsed.data.orderId },
    include: {
      delivery: true,
      landingPad: true,
    },
  });

  if (!order) {
    return NextResponse.json(
      { success: false, error: 'Nie znaleziono zamówienia' },
      { status: 404 },
    );
  }

  if (order.landingPad.status !== LandingPadStatus.ACCEPTED) {
    return NextResponse.json(
      { success: false, error: 'Lądowisko nie jest zaakceptowane' },
      { status: 409 },
    );
  }

  if (order.delivery) {
    return NextResponse.json(
      { success: false, error: 'Zamówienie ma już przypisaną rezerwację' },
      { status: 409 },
    );
  }

  if (order.status !== OrderStatus.ORDERED) {
    return NextResponse.json(
      { success: false, error: 'Zamówienie nie może być już rezerwowane' },
      { status: 409 },
    );
  }

  const conflictingDelivery = await prisma.delivery.findFirst({
    where: {
      landingPadId: order.landingPadId,
      order: {
        status: {
          in: activeOrderStatuses,
        },
      },
      reservedFrom: {
        lt: parsed.data.reservedTo,
      },
      reservedTo: {
        gt: parsed.data.reservedFrom,
      },
    },
    select: {
      id: true,
    },
  });

  if (conflictingDelivery) {
    return NextResponse.json(
      { success: false, error: 'Lądowisko jest zajęte w tym terminie' },
      { status: 409 },
    );
  }

  const delivery = await prisma.delivery.create({
    data: {
      orderId: order.orderId,
      droneProviderId: auth.userId,
      landingPadId: order.landingPadId,
      droneId: parsed.data.droneId,
      reservedFrom: parsed.data.reservedFrom,
      reservedTo: parsed.data.reservedTo,
    },
  });

  await prisma.order.update({
    where: { orderId: order.orderId },
    data: { status: OrderStatus.PREPARING },
  });

  invalidateLandingPadAvailability(order.landingPadId);

  return NextResponse.json({ success: true, data: mapDeliveryToDTO(delivery) });
}
