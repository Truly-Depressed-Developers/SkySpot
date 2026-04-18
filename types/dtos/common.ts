import type { LatLngLiteral } from 'leaflet';

export type CoordsDTO = LatLngLiteral;

export const mapCoordsToDTO = (latitude: number, longitude: number): CoordsDTO => ({
  lat: latitude,
  lng: longitude,
});
