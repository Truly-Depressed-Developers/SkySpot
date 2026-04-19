import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/prisma/prisma';
import { authenticateDroneProviderRequest } from '@/lib/droneProviderApi';

const coordsSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const telemetryPatchSchema = z.object({
  droneId: z.string().min(1),
  orderId: z.string().min(1).optional(),
  currentPosition: coordsSchema.optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
  origin: coordsSchema.optional(),
  destination: coordsSchema.optional(),
});

const telemetryBatchSchema = z.object({
  updates: z.array(telemetryPatchSchema).min(1),
});

const telemetryRequestSchema = z.union([telemetryPatchSchema, telemetryBatchSchema]);

type TelemetryPatch = z.infer<typeof telemetryPatchSchema>;

type ResolvedTelemetry = {
  droneId: string;
  orderId: string;
  currentPosition: {
    lat: number;
    lng: number;
  };
  batteryLevel: number;
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
};

type ExistingDroneStatus = {
  droneId: string;
  orderId: string;
  currentLatitude: number;
  currentLongitude: number;
  batteryLevel: number;
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
};

function normalizeTelemetryPatches(
  input: z.infer<typeof telemetryRequestSchema>,
): TelemetryPatch[] {
  if ('updates' in input) {
    return input.updates;
  }

  return [input];
}

function resolveTelemetryPatch(
  patch: TelemetryPatch,
  previous: ExistingDroneStatus | null,
): { resolved: ResolvedTelemetry | null; missingFields: string[] } {
  const resolved: ResolvedTelemetry = {
    droneId: patch.droneId,
    orderId: patch.orderId ?? previous?.orderId ?? '',
    currentPosition: {
      lat: patch.currentPosition?.lat ?? previous?.currentLatitude ?? Number.NaN,
      lng: patch.currentPosition?.lng ?? previous?.currentLongitude ?? Number.NaN,
    },
    batteryLevel: patch.batteryLevel ?? previous?.batteryLevel ?? Number.NaN,
    origin: {
      lat: patch.origin?.lat ?? previous?.originLatitude ?? Number.NaN,
      lng: patch.origin?.lng ?? previous?.originLongitude ?? Number.NaN,
    },
    destination: {
      lat: patch.destination?.lat ?? previous?.destinationLatitude ?? Number.NaN,
      lng: patch.destination?.lng ?? previous?.destinationLongitude ?? Number.NaN,
    },
  };

  const missingFields: string[] = [];

  if (!resolved.orderId) {
    missingFields.push('orderId');
  }

  if (
    !Number.isFinite(resolved.currentPosition.lat) ||
    !Number.isFinite(resolved.currentPosition.lng)
  ) {
    missingFields.push('currentPosition');
  }

  if (!Number.isFinite(resolved.batteryLevel)) {
    missingFields.push('batteryLevel');
  }

  if (!Number.isFinite(resolved.origin.lat) || !Number.isFinite(resolved.origin.lng)) {
    missingFields.push('origin');
  }

  if (!Number.isFinite(resolved.destination.lat) || !Number.isFinite(resolved.destination.lng)) {
    missingFields.push('destination');
  }

  if (missingFields.length > 0) {
    return {
      resolved: null,
      missingFields,
    };
  }

  return {
    resolved,
    missingFields,
  };
}

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

  const parsed = telemetryRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Nieprawidłowy payload telemetrii', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const telemetryPatches = normalizeTelemetryPatches(parsed.data);
  const seenDroneIds = new Set<string>();

  for (const telemetryPatch of telemetryPatches) {
    if (seenDroneIds.has(telemetryPatch.droneId)) {
      return NextResponse.json(
        {
          success: false,
          error: `Duplikat droneId w payloadzie: ${telemetryPatch.droneId}`,
        },
        { status: 400 },
      );
    }

    seenDroneIds.add(telemetryPatch.droneId);
  }

  const existingStatuses = await prisma.droneStatus.findMany({
    where: {
      droneId: {
        in: telemetryPatches.map((telemetryPatch) => telemetryPatch.droneId),
      },
    },
    select: {
      droneId: true,
      orderId: true,
      currentLatitude: true,
      currentLongitude: true,
      batteryLevel: true,
      originLatitude: true,
      originLongitude: true,
      destinationLatitude: true,
      destinationLongitude: true,
    },
  });
  const existingStatusByDroneId = new Map(
    existingStatuses.map((status) => [status.droneId, status]),
  );

  const resolvedTelemetryUpdates: ResolvedTelemetry[] = [];

  for (const telemetryPatch of telemetryPatches) {
    const previousStatus = existingStatusByDroneId.get(telemetryPatch.droneId) ?? null;
    const { resolved, missingFields } = resolveTelemetryPatch(telemetryPatch, previousStatus);

    if (!resolved) {
      return NextResponse.json(
        {
          success: false,
          error: `Brak wymaganych pól dla drona ${telemetryPatch.droneId}`,
          missingFields,
        },
        { status: 400 },
      );
    }

    resolvedTelemetryUpdates.push(resolved);
  }

  const uniqueOrderIds = Array.from(
    new Set(resolvedTelemetryUpdates.map((telemetry) => telemetry.orderId)),
  );
  const deliveries = await prisma.delivery.findMany({
    where: {
      orderId: {
        in: uniqueOrderIds,
      },
      droneProviderId: auth.userId,
    },
    select: {
      orderId: true,
    },
  });
  const allowedOrderIds = new Set(deliveries.map((delivery) => delivery.orderId));

  for (const telemetry of resolvedTelemetryUpdates) {
    if (!allowedOrderIds.has(telemetry.orderId)) {
      return NextResponse.json(
        {
          success: false,
          error: `Nie znaleziono dostawy dla orderId ${telemetry.orderId}`,
        },
        { status: 404 },
      );
    }
  }

  const updatedStatuses = await prisma.$transaction(async (tx) => {
    const results = [];

    for (const telemetry of resolvedTelemetryUpdates) {
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

        const createdStatus = await tx.droneStatus.create({
          data: createData,
        });

        results.push(createdStatus);
        continue;
      }

      const upsertedStatus = await tx.droneStatus.upsert({
        where: { droneId: telemetry.droneId },
        create: createData,
        update: updateData,
      });

      results.push(upsertedStatus);
    }

    return results;
  });

  return NextResponse.json({
    success: true,
    data: {
      processed: updatedStatuses.length,
      droneIds: updatedStatuses.map((status) => status.droneId),
    },
  });
}
