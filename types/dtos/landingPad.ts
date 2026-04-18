import type { LandingPadAvailability, LandingPadStatus, LandingPadType } from '@prisma/client';
import type { Delivery, LandingPad } from '@prisma/client';
import type { CoordsDTO } from './common';
import { mapCoordsToDTO } from './common';

export type LandingPadDetailsDTO = {
  id: string;
  name: string;
  description: string;
  rejectionReason: string;
  ownerId: string | null;
  coords: CoordsDTO;
  imageUrl: string;
  type: LandingPadType;
  availability: LandingPadAvailability;
  status: LandingPadStatus;
  reservations: LandingPadReservationDTO[];
};

export type LandingPadWithDistanceDTO = {
  id: string;
  name: string;
  coords: CoordsDTO;
  distance: number;
};

export type CreateLandingPadDTO = {
  name: string;
  description: string;
  imageUrl: string;
  coords: CoordsDTO;
  type: LandingPadType;
  availability: LandingPadAvailability;
};

export type LandingPadReservationDTO = {
  id: string;
  landingPadId: string;
  droneProviderId: string;
  droneId: string;
  reservedFrom: Date;
  reservedTo: Date;
};

type LandingPadWithDeliveries = LandingPad & {
  ownerId?: string | null;
  deliveries: Delivery[];
};

export const mapDeliveryToLandingPadReservationDTO = (
  delivery: Delivery,
): LandingPadReservationDTO => ({
  id: delivery.id,
  landingPadId: delivery.landingPadId,
  droneProviderId: delivery.droneProviderId,
  droneId: delivery.droneId,
  reservedFrom: delivery.reservedFrom,
  reservedTo: delivery.reservedTo,
});

export const mapLandingPadToDetailsDTO = (
  landingPad: LandingPadWithDeliveries,
): LandingPadDetailsDTO => ({
  id: landingPad.id,
  name: landingPad.name,
  description: landingPad.description,
  rejectionReason: landingPad.rejectionReason ?? '',
  ownerId: landingPad.ownerId ?? null,
  coords: mapCoordsToDTO(landingPad.latitude, landingPad.longitude),
  imageUrl: landingPad.imageUrl,
  type: landingPad.type,
  availability: landingPad.availability,
  status: landingPad.status,
  reservations: landingPad.deliveries.map(mapDeliveryToLandingPadReservationDTO),
});

export const mapLandingPadToWithDistanceDTO = (
  landingPad: LandingPad,
  distance: number,
): LandingPadWithDistanceDTO => ({
  id: landingPad.id,
  name: landingPad.name,
  coords: mapCoordsToDTO(landingPad.latitude, landingPad.longitude),
  distance,
});
