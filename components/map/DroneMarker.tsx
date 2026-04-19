'use client';

import { MapMarker, MapPopup, MapPolyline } from '@/components/ui/map';
import { DroneStatusDTO } from '@/types/dtos';
import { NavigationIcon, BatteryIcon, PackageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { LatLngLiteral } from 'leaflet';

interface DroneMarkerProps {
  drone: DroneStatusDTO;
}

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

export function DroneMarker({ drone }: DroneMarkerProps) {
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
      >
        <MapPopup>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <PackageIcon className="size-5 text-blue-500" />
              <h3 className="font-bold">Dron: {drone.droneId}</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {!isUser && (
                <div className="flex flex-col border rounded p-1">
                  <span className="text-muted-foreground">Bateria</span>
                  <span className={`font-bold ${drone.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`}>
                    {drone.batteryLevel}%
                  </span>
                </div>
              )}
              <div className={`flex flex-col border rounded p-1 ${isUser ? 'col-span-2' : ''}`}>
                <span className="text-muted-foreground">Status</span>
                <span className="font-bold">W LOCIE</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ID Zamówienia: <span className="font-mono">{drone.orderId}</span>
            </p>
            <Button size="sm" variant="outline" className="mt-2 w-full">Szczegóły dostawy</Button>
          </div>
        </MapPopup>
      </MapMarker>
    </>
  );
}
