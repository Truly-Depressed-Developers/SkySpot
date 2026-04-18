'use client';

import { PageHeader } from '@/components/PageHeader';
import { Map, MapLayers, MapLayersControl, MapTileLayer, MapZoomControl } from "@/components/ui/map"
import { LatLngExpression } from 'leaflet';

const KRAKOW_COORDINATES = [50.065406, 19.937587] satisfies LatLngExpression


export default function MapPage() {
  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Mapa lądowisk" />
      <main className="flex-1 flex items-center flex-col justify-center border-2 border-dashed rounded-lg mt-4">
        <Map center={KRAKOW_COORDINATES}>
          <MapLayers defaultTileLayer="Jasna">
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
            <MapLayersControl position="bottom-1 left-1" />
          </MapLayers>
          <MapZoomControl position="top-1 right-1" />
        </Map>
      </main>
    </div>
  );
}
