export type DeliveryRatingDTO = {
  orderId: string;
  isSuccess: boolean;
  comment: string;
};

export type DeliveryDeclarationDTO = {
  orderId: string;
  landingPadId: string;
  droneId: string;
  reservedFrom: Date;
  reservedTo: Date;
};
