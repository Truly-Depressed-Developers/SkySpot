'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

import { PageHeader } from '@/components/PageHeader';
import {
  Map,
  MapLayers,
  MapLayersControl,
  MapZoomControl,
  MapLayerGroup,
} from '@/components/ui/map';
import { trpc } from '@/trpc/client';
import { Badge } from '@/components/ui/badge';
import { LandingPadMarker } from '@/components/map/LandingPadMarker';
import { DroneMarker } from '@/components/map/DroneMarker';
import { BaseLayers } from '@/components/map/BaseLayers';
import { KRAKOW_COORDINATES } from '@/components/map/mapConfig';
import { MapBottomSheet, type SelectedMarker } from '@/components/map/MapBottomSheet';
import type { CoordsDTO } from '@/types/dtos';

const DRONE_MAP_REFETCH_INTERVAL_MS = 1000;
const MARKER_ZOOM_LEVEL = 16;

type MapAutoZoomProps = {
  target: CoordsDTO | null;
};

function MapAutoZoom({ target }: MapAutoZoomProps) {
  const map = useMap();

  useEffect(() => {
    if (!target) {
      return;
    }

    // map.flyTo(target, MARKER_ZOOM_LEVEL, { duration: 0.35 });
  }, [map, target]);

  return null;
}

export default function MapPage() {
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker>(null);
  const { data: landingPads, isLoading: isLoadingPads } = trpc.landingPad.getAll.useQuery();
  const { data: drones, isLoading: isLoadingDrones } = trpc.droneStatus.getAllMine.useQuery(undefined, {
    refetchInterval: DRONE_MAP_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  const isLoading = isLoadingPads || isLoadingDrones;
  const selectedCoords =
    selectedMarker?.type === 'landing-pad'
      ? selectedMarker.pad.coords
      : selectedMarker?.type === 'drone'
        ? selectedMarker.drone.currentPosition
        : null;

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Mapa lądowisk" />
      <main className="flex-1 flex items-center flex-col justify-center border-2 border-dashed rounded-lg mt-4 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 z-1001 bg-background/50 flex items-center justify-center backdrop-blur-sm">
            <Badge variant="outline" className="animate-pulse">Ładowanie danych mapy...</Badge>
          </div>
        )}

        <Map center={KRAKOW_COORDINATES} zoom={13}>
          <MapLayers defaultTileLayer="Jasna" defaultLayerGroups={['Lądowiska', 'Aktywne Drony']}>
            <BaseLayers />

            <MapLayerGroup name="Lądowiska">
              {landingPads?.map((pad) => (
                <LandingPadMarker
                  key={pad.id}
                  pad={pad}
                  onSelect={(selectedPad) => {
                    setSelectedMarker({ type: 'landing-pad', pad: selectedPad });
                  }}
                />
              ))}
            </MapLayerGroup>

            <MapLayerGroup name="Aktywne Drony">
              {drones?.map((drone) => (
                <DroneMarker
                  key={drone.droneId}
                  drone={drone}
                  onSelect={(selectedDrone) => {
                    setSelectedMarker({ type: 'drone', drone: selectedDrone });
                  }}
                />
              ))}
            </MapLayerGroup>

            <MapLayersControl position="bottom-1 left-1" />
          </MapLayers>
          <MapAutoZoom target={selectedCoords} />
          <MapZoomControl position="top-1 right-1" />
        </Map>
      </main>

      <MapBottomSheet
        selectedMarker={selectedMarker}
        onClose={() => {
          setSelectedMarker(null);
        }}
      />
    </div>
  );
}
