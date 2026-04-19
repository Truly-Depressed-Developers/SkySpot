'use client';

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

const DRONE_MAP_REFETCH_INTERVAL_MS = 1000;

export default function MapPage() {
  const { data: landingPads, isLoading: isLoadingPads } = trpc.landingPad.getAll.useQuery();
  const { data: drones, isLoading: isLoadingDrones } = trpc.droneStatus.getAllMine.useQuery(undefined, {
    refetchInterval: DRONE_MAP_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  const isLoading = isLoadingPads || isLoadingDrones;

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
                <LandingPadMarker key={pad.id} pad={pad} />
              ))}
            </MapLayerGroup>

            <MapLayerGroup name="Aktywne Drony">
              {drones?.map((drone) => (
                <DroneMarker key={drone.droneId} drone={drone} />
              ))}
            </MapLayerGroup>

            <MapLayersControl position="bottom-1 left-1" />
          </MapLayers>
          <MapZoomControl position="top-1 right-1" />
        </Map>
      </main>
    </div>
  );
}
