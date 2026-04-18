import type { CoordsDTO } from './common';
import type { DroneStatus } from '@prisma/client';
import { mapCoordsToDTO } from './common';

export type DroneStatusDTO = {
  droneId: string;
  currentPosition: CoordsDTO;
  batteryLevel: number;
  origin: CoordsDTO;
  destination: CoordsDTO;
  orderId: string;
};

export const mapDroneStatusToDTO = (droneStatus: DroneStatus): DroneStatusDTO => ({
  droneId: droneStatus.droneId,
  currentPosition: mapCoordsToDTO(droneStatus.currentLatitude, droneStatus.currentLongitude),
  batteryLevel: droneStatus.batteryLevel,
  origin: mapCoordsToDTO(droneStatus.originLatitude, droneStatus.originLongitude),
  destination: mapCoordsToDTO(droneStatus.destinationLatitude, droneStatus.destinationLongitude),
  orderId: droneStatus.orderId,
});
