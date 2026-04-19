import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { z } from 'zod';

import { authenticateDroneProviderRequest } from '@/lib/droneProviderApi';
import { prisma } from '@/prisma/prisma';

const confirmSchema = z.object({
  isDelivered: z.boolean(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteParams) {
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

  const parsed = confirmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Nieprawidłowy payload potwierdzenia', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;

  const delivery = await prisma.delivery.findFirst({
    where: {
      id,
      droneProviderId: auth.userId,
    },
    include: {
      order: true,
    },
  });

  if (!delivery) {
    return NextResponse.json({ success: false, error: 'Nie znaleziono dostawy' }, { status: 404 });
  }

  const status = parsed.data.isDelivered ? OrderStatus.DELIVERED : OrderStatus.CANCELLED;

  await prisma.order.update({
    where: { orderId: delivery.orderId },
    data: { status },
  });

  return NextResponse.json({ success: true, data: { deliveryId: delivery.id, orderStatus: status } });
}