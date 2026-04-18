export type LandingPadType = 'DRIVEWAY' | 'SQUARE' | 'PARCEL_LOCKER_ROOF' | 'HOUSE_ROOF' | 'OTHER';

export type LandingPadAvailability = 'PRIVATE' | 'PUBLIC';

export type LandingPadStatus = 'WAITING_FOR_REVIEW' | 'ACCEPTED' | 'REJECTED';

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
  userId: string;
  droneId: string;
  reservedFrom: Date;
  reservedTo: Date;
};
