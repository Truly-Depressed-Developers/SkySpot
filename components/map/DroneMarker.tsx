'use client';

import { MapMarker, MapPolyline } from '@/components/ui/map';
import { DroneStatusDTO } from '@/types/dtos';
import { NavigationIcon, BatteryIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { LatLngLiteral } from 'leaflet';

type Props = {
  drone: DroneStatusDTO;
  onSelect?: (drone: DroneStatusDTO) => void;
};

function calculateBearing(start: LatLngLiteral, dest: LatLngLiteral): number {
  const startLatRad = (start.lat * Math.PI) / 180;
  const startLngRad = (start.lng * Math.PI) / 180;
  const destLatRad = (dest.lat * Math.PI) / 180;
  const destLngRad = (dest.lng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

export function DroneMarker({ drone, onSelect }: Props) {
  const { data: session } = useSession();
  const isUser = session?.user?.role === UserRole.USER;

  const rotationAngle = calculateBearing(drone.currentPosition, drone.destination);

  return (
    <>
      {/* Odcinek przebyty - linia ciągła, lekko przezroczysta */}
      <MapPolyline
        positions={[
          drone.origin,
          drone.currentPosition,
        ]}
        pathOptions={{
          color: 'hsl(var(--primary))',
          weight: 2,
          opacity: 0.3,
        }}
      />

      {/* Odcinek do pokonania - linia przerywana */}
      <MapPolyline
        positions={[
          drone.currentPosition,
          drone.destination,
        ]}
        pathOptions={{
          color: 'hsl(var(--primary))',
          dashArray: '5, 10',
          weight: 2,
          opacity: 0.8,
        }}
      />

      {/* Marker drona */}
      <MapMarker
        position={drone.currentPosition}
        eventHandlers={{
          click: () => {
            onSelect?.(drone);
          },
        }}
        icon={
          <div className="relative">
            <NavigationIcon
              className="size-8 text-blue-500 fill-blue-500/20"
              style={{ transform: `rotate(${rotationAngle - 45}deg)` }}
            />
            {!isUser && (
              <div className="absolute -top-2 -right-2 bg-background border rounded-full px-1 py-0.5 text-[8px] font-bold flex items-center gap-0.5">
                <BatteryIcon className={`size-2 ${drone.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />
                {drone.batteryLevel}%
              </div>
            )}
          </div>
        }
      />
    </>
  );
}
