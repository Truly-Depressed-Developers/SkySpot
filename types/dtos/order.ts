import type { OrderStatus, OrderType } from '@prisma/client';
import type { CoordsDTO } from './common';

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
