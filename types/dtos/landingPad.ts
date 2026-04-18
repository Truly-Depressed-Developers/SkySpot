import type { LandingPadAvailability, LandingPadStatus, LandingPadType } from '@prisma/client';
import type { CoordsDTO } from './common';

export type LandingPadDetailsDTO = {
  id: string;
  name: string;
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
