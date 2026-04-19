import { NextResponse } from 'next/server';

import { prisma } from '@/prisma/prisma';
import { mapDroneStatusToDTO } from '@/types/dtos';
import { authenticateDroneProviderRequest } from '@/lib/droneProviderApi';

export async function GET(request: Request) {
  const auth = await authenticateDroneProviderRequest(request);

  if (!auth) {
    return NextResponse.json({ success: false, error: 'Brak autoryzacji' }, { status: 401 });
  }

  const droneStatuses = await prisma.droneStatus.findMany({
    where: {
      order: {
        delivery: {
          is: {
            droneProviderId: auth.userId,
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: droneStatuses.map(mapDroneStatusToDTO) });
}