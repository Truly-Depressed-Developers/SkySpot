import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/prisma/prisma';
import { authenticateDroneProviderRequest } from '@/lib/droneProviderApi';

const telemetrySchema = z.object({
  droneId: z.string().min(1),
  orderId: z.string().min(1),
  currentPosition: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  batteryLevel: z.number().int().min(0).max(100),
  origin: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
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

  const parsed = telemetrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Nieprawidłowy payload telemetrii', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const telemetry = parsed.data;

  const delivery = await prisma.delivery.findFirst({
    where: {
      orderId: telemetry.orderId,
      droneProviderId: auth.userId,
    },
    select: {
      id: true,
    },
  });

  if (!delivery) {
    return NextResponse.json({ success: false, error: 'Nie znaleziono dostawy' }, { status: 404 });
  }

  const createData = {
    droneId: telemetry.droneId,
    orderId: telemetry.orderId,
    currentLatitude: telemetry.currentPosition.lat,
    currentLongitude: telemetry.currentPosition.lng,
    batteryLevel: telemetry.batteryLevel,
    originLatitude: telemetry.origin.lat,
    originLongitude: telemetry.origin.lng,
    destinationLatitude: telemetry.destination.lat,
    destinationLongitude: telemetry.destination.lng,
  };

  const updateData = {
    orderId: telemetry.orderId,
    currentLatitude: telemetry.currentPosition.lat,
    currentLongitude: telemetry.currentPosition.lng,
    batteryLevel: telemetry.batteryLevel,
    originLatitude: telemetry.origin.lat,
    originLongitude: telemetry.origin.lng,
    destinationLatitude: telemetry.destination.lat,
    destinationLongitude: telemetry.destination.lng,
  };

  const droneStatus = await prisma.$transaction(async (tx) => {
    const possiblyConflictingStatus = await tx.droneStatus.findFirst({
      where: {
        OR: [{ droneId: telemetry.droneId }, { orderId: telemetry.orderId }],
      },
      select: {
        droneId: true,
        orderId: true,
      },
    });

    if (
      possiblyConflictingStatus &&
      (possiblyConflictingStatus.droneId !== telemetry.droneId ||
        possiblyConflictingStatus.orderId !== telemetry.orderId)
    ) {
      await tx.droneStatus.deleteMany({
        where: {
          OR: [{ droneId: telemetry.droneId }, { orderId: telemetry.orderId }],
        },
      });

      return tx.droneStatus.create({
        data: createData,
      });
    }

    return tx.droneStatus.upsert({
      where: { droneId: telemetry.droneId },
      create: createData,
      update: updateData,
    });
  });

  return NextResponse.json({ success: true, droneId: droneStatus.droneId });
}