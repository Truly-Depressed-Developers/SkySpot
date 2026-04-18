import type { OrderStatus, OrderType } from '@prisma/client';
import type { Order } from '@prisma/client';
import type { CoordsDTO } from './common';
import { mapCoordsToDTO } from './common';

export type OrderDTO = {
  orderId: string;
  userId: string;
  landingPadId: string;
  type: OrderType;
  weight: number;
  status: OrderStatus;
  destination: CoordsDTO;
  description: string;
};

export const mapOrderToDTO = (order: Order): OrderDTO => ({
  orderId: order.orderId,
  userId: order.userId,
  landingPadId: order.landingPadId,
  type: order.type,
  weight: order.weight,
  status: order.status,
  destination: mapCoordsToDTO(order.destinationLatitude, order.destinationLongitude),
  description: order.description,
});
