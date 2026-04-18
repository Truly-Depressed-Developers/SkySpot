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
