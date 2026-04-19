import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';

import { authenticateDroneProviderRequest } from '@/lib/droneProviderApi';
import { prisma } from '@/prisma/prisma';
import { mapDeliveryToDTO, mapOrderToDTO } from '@/types/dtos';

export async function GET(request: Request) {
  const auth = await authenticateDroneProviderRequest(request);

  if (!auth) {
    return NextResponse.json({ success: false, error: 'Brak autoryzacji' }, { status: 401 });
  }

  const deliveries = await prisma.delivery.findMany({
    where: {
      droneProviderId: auth.userId,
      order: {
        status: {
          in: [OrderStatus.ORDERED, OrderStatus.PREPARING, OrderStatus.IN_TRANSIT],
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      order: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: deliveries.map((delivery) => ({
      delivery: mapDeliveryToDTO(delivery),
      order: mapOrderToDTO(delivery.order),
    })),
  });
}