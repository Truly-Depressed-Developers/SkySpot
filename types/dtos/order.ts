import type { Delivery, Order, OrderStatus, OrderType } from '@prisma/client';
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

export type OrderPackageSizeLabel = 'Mała' | 'Średnia' | 'Duża';

export type UserOrderDTO = {
  orderId: string;
  status: OrderStatus;
  packageName: string;
  packageSize: OrderPackageSizeLabel;
  trackingNumber: string;
  deliveryAt: Date;
  etaMinutes: number | null;
};

type OrderWithDelivery = Order & {
  delivery: Delivery | null;
};

function getPackageSizeLabel(weight: number): OrderPackageSizeLabel {
  if (weight <= 0.8) {
    return 'Mała';
  }

  if (weight <= 3) {
    return 'Średnia';
  }

  return 'Duża';
}

function getEstimatedMinutes(weight: number) {
  if (weight <= 0.8) {
    return 30;
  }

  if (weight <= 3) {
    return 60;
  }

  return 90;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export const mapOrderToUserOrderDTO = (order: OrderWithDelivery): UserOrderDTO => {
  const deliveryAt =
    order.status === 'DELIVERED'
      ? (order.delivery?.reservedTo ?? order.updatedAt)
      : (order.delivery?.reservedTo ??
        addMinutes(order.createdAt, getEstimatedMinutes(order.weight)));
  const etaMinutes =
    order.status === 'DELIVERED'
      ? null
      : Math.max(0, Math.ceil((deliveryAt.getTime() - Date.now()) / 60_000));

  return {
    orderId: order.orderId,
    status: order.status,
    packageName: order.description,
    packageSize: getPackageSizeLabel(order.weight),
    trackingNumber: order.orderId,
    deliveryAt,
    etaMinutes,
  };
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
