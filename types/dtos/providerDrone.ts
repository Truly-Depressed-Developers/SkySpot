import type { LandingPadAvailability, LandingPadType, OrderStatus } from '@prisma/client';
import type { CoordsDTO } from './common';
import type { OrderPackageSizeLabel } from './order';

export type ProviderDroneListItemDTO = {
  droneId: string;
  droneName: string;
  serialNumber: string;
  isActive: boolean;
  batteryLevel: number | null;
  orderId: string;
  orderStatus: OrderStatus;
  packageSize: OrderPackageSizeLabel;
  packageWeightKg: number;
  recipientFirstName: string;
  recipientLastName: string;
  landingPadType: LandingPadType;
  landingPadAvailability: LandingPadAvailability;
  landingPadImageUrl: string;
  landingPadDescription: string;
  landingPadCoords: CoordsDTO;
  origin: CoordsDTO;
  destination: CoordsDTO;
  currentPosition: CoordsDTO | null;
  updatedAt: Date | null;
};
