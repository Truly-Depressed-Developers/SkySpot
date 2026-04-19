import { NextResponse } from 'next/server';
import { LandingPadStatus } from '@prisma/client';
import { distance, point } from '@turf/turf';
import { z } from 'zod';

import { authenticateDroneProviderRequest } from '@/lib/droneProviderApi';
import { prisma } from '@/prisma/prisma';
import { mapLandingPadToWithDistanceDTO } from '@/types/dtos';

const searchSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: Request) {
  const auth = await authenticateDroneProviderRequest(request);

  if (!auth) {
    return NextResponse.json({ success: false, error: 'Brak autoryzacji' }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsed = searchSchema.safeParse({
    lat: url.searchParams.get('lat'),
    lng: url.searchParams.get('lng'),
    limit: url.searchParams.get('limit') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Nieprawidłowe parametry zapytania', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const landingPads = await prisma.landingPad.findMany({
    where: {
      status: LandingPadStatus.ACCEPTED,
    },
  });

  const origin = point([parsed.data.lng, parsed.data.lat]);

  const nearbyLandingPads = landingPads
    .map((landingPad) => ({
      landingPad,
      distanceInKilometers: distance(origin, point([landingPad.longitude, landingPad.latitude]), {
        units: 'kilometers',
      }),
    }))
    .sort((left, right) => left.distanceInKilometers - right.distanceInKilometers)
    .slice(0, parsed.data.limit)
    .map(({ landingPad, distanceInKilometers }) =>
      mapLandingPadToWithDistanceDTO(landingPad, distanceInKilometers),
    );

  return NextResponse.json({ success: true, data: nearbyLandingPads });
}