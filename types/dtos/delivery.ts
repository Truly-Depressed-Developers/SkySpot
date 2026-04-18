import type { Delivery } from '@prisma/client';

export type DeliveryRatingDTO = {
  deliveryId: string;
  isSuccess: boolean;
  comment: string;
};

export type DeliveryDTO = {
  id: string;
  orderId: string;
  droneProviderId: string;
  landingPadId: string;
  droneId: string;
  reservedFrom: Date;
  reservedTo: Date;
};

export type DeliveryDeclarationDTO = Omit<DeliveryDTO, 'id'>;

export const mapDeliveryToDTO = (delivery: Delivery): DeliveryDTO => ({
  id: delivery.id,
  orderId: delivery.orderId,
  droneProviderId: delivery.droneProviderId,
  landingPadId: delivery.landingPadId,
  droneId: delivery.droneId,
  reservedFrom: delivery.reservedFrom,
  reservedTo: delivery.reservedTo,
});
