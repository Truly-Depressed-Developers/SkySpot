import type { CoordsDTO } from './common';

export type DroneStatusDTO = {
  droneId: string;
  currentPosition: CoordsDTO;
  batteryLevel: number;
  origin: CoordsDTO;
  destination: CoordsDTO;
  orderId: string;
};
