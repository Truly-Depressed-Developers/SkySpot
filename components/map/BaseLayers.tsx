'use client';

import { MapTileLayer } from '@/components/ui/map';

export function BaseLayers() {
  return (
    <>
      <MapTileLayer
        name="Jasna"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <MapTileLayer
        name="Satelita"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri"
      />
    </>
  );
}
