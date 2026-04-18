export type CoordsDTO = {
  latitude: number;
  longitude: number;
};

export const mapCoordsToDTO = (latitude: number, longitude: number): CoordsDTO => ({
  latitude,
  longitude,
});
