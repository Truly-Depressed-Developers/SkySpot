'use client';

import { useEffect } from 'react';
import { Map, MapMarker, MapPolyline, MapTileLayer } from '@/components/ui/map';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { DroneStatusDTO, UserOrderDTO } from '@/types/dtos';
import { CaretLeftIcon } from '@phosphor-icons/react';
import type { LatLngBoundsExpression } from 'leaflet';
import { NavigationIcon, BatteryIcon, PackageIcon, MapPinIcon } from 'lucide-react';
import { useMap } from 'react-leaflet';

type Props = {
  order: UserOrderDTO;
  droneStatus?: DroneStatusDTO | undefined;
};

const packageSizeBadgeClasses = {
  Mała: 'border-slate-200 bg-slate-100 text-slate-700',
  Średnia: 'border-blue-200 bg-blue-100 text-blue-700',
  Duża: 'border-amber-200 bg-amber-100 text-amber-700',
} as const;

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatWeight(weight: number) {
  return `${weight.toFixed(1).replace('.', ',')} kg`;
}

function formatCoords(lat: number, lng: number) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function calculateBearing(startLat: number, startLng: number, destLat: number, destLng: number): number {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

function MapBoundsFitter({ points }: { points: Array<{ lat: number; lng: number }> }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return;
    }

    const bounds: LatLngBoundsExpression = points.map((point) => [point.lat, point.lng]);
    map.fitBounds(bounds, {
      padding: [32, 32],
      maxZoom: 16,
      animate: false,
    });
  }, [map, points]);

  return null;
}

export function OrderDetailsDialog({ order, droneStatus }: Props) {
  const isDelivered = order.status === 'DELIVERED';
  const routePoints = droneStatus
    ? isDelivered
      ? [droneStatus.origin, droneStatus.destination]
      : [droneStatus.origin, droneStatus.currentPosition, droneStatus.destination]
    : [];

  const rotationAngle = droneStatus
    ? calculateBearing(
        droneStatus.currentPosition.lat,
        droneStatus.currentPosition.lng,
        droneStatus.destination.lat,
        droneStatus.destination.lng,
      )
    : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Szczegóły
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-1.5rem)] max-w-3xl rounded-xl p-0 sm:w-[calc(100%-3rem)] gap-0"
      >
        <DialogHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-base font-semibold">Szczegóły zamówienia</DialogTitle>
            <Badge variant="outline" className={packageSizeBadgeClasses[order.packageSize]}>
              {order.packageSize}
            </Badge>
          </div>
          <DialogDescription className="sr-only">Szczegóły przesyłki, waga oraz trasa drona.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(92dvh-61px)] overflow-y-auto p-4 pb-24">
          <div className="mx-auto w-full max-w-2xl space-y-4">
            <div className="space-y-2">
              <p className="text-base font-semibold">{order.packageName}</p>
              <p className="text-sm text-muted-foreground">Numer śledzenia: {order.trackingNumber}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Waga przesyłki</p>
                <p className="text-sm font-medium">{formatWeight(order.weight)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">
                  {order.etaMinutes === null ? 'Czas dostawy' : 'Przewidywany czas dostawy'}
                </p>
                <p className="text-sm font-medium">{formatDateTime(order.deliveryAt)}</p>
                {order.etaMinutes !== null && <p className="text-xs text-green-600">za {order.etaMinutes} min</p>}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <PackageIcon className="size-5 text-blue-500" />
                <p className="text-sm font-semibold">Trasa drona</p>
              </div>

              {droneStatus ? (
                <>
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                    <div className="rounded-md border p-2">
                      <p className="text-xs text-muted-foreground">Dron</p>
                      <p className="font-mono text-sm">{droneStatus.droneId}</p>
                    </div>
                    {isDelivered ? (
                      <>
                        <div className="rounded-md border p-2">
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="text-sm text-green-600">Dostarczone</p>
                        </div>
                        <div className="rounded-md border p-2">
                          <p className="text-xs text-muted-foreground">Trasa</p>
                          <p className="text-sm">Zakończona</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-md border p-2">
                          <p className="text-xs text-muted-foreground">Bateria</p>
                          <p className="text-sm">{droneStatus.batteryLevel}%</p>
                        </div>
                        <div className="rounded-md border p-2">
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="text-sm">W locie</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative h-56 overflow-hidden rounded-md border">
                    <Map
                      center={
                        droneStatus
                          ? droneStatus.currentPosition
                          : { lat: 50.0614, lng: 19.9372 }
                      }
                      zoom={15}
                      className="h-full min-h-0! rounded-none"
                    >
                      {droneStatus && <MapBoundsFitter points={routePoints} />}
                      <MapTileLayer
                        name="Jasna"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      {isDelivered ? (
                        <MapPolyline
                          positions={[droneStatus.origin, droneStatus.destination]}
                          pathOptions={{
                            color: 'hsl(var(--primary))',
                            weight: 3,
                            opacity: 0.8,
                          }}
                        />
                      ) : (
                        <>
                          <MapPolyline
                            positions={[droneStatus.origin, droneStatus.currentPosition]}
                            pathOptions={{
                              color: 'hsl(var(--primary))',
                              weight: 3,
                              opacity: 0.35,
                            }}
                          />
                          <MapPolyline
                            positions={[droneStatus.currentPosition, droneStatus.destination]}
                            pathOptions={{
                              color: 'hsl(var(--primary))',
                              weight: 3,
                              dashArray: '6, 8',
                              opacity: 0.85,
                            }}
                          />
                        </>
                      )}
                      <MapMarker
                        position={droneStatus.origin}
                        icon={<MapPinIcon className="size-6 text-emerald-500 fill-emerald-500/20" />}
                      />
                      <MapMarker
                        position={droneStatus.destination}
                        icon={<MapPinIcon className="size-6 text-amber-500 fill-amber-500/20" />}
                      />
                      {!isDelivered && (
                        <MapMarker
                          position={droneStatus.currentPosition}
                          icon={
                            <div className="relative">
                              <NavigationIcon
                                className="size-8 text-blue-500 fill-blue-500/20"
                                style={{ transform: `rotate(${rotationAngle - 45}deg)` }}
                              />
                              <div className="absolute -top-2 -right-2 flex items-center gap-0.5 rounded-full border bg-background px-1 py-0.5 text-[8px] font-bold">
                                <BatteryIcon
                                  className={`size-2 ${droneStatus.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`}
                                />
                                {droneStatus.batteryLevel}%
                              </div>
                            </div>
                          }
                        />
                      )}
                    </Map>
                  </div>

                  {isDelivered ? (
                    <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div className="rounded-md bg-muted/40 p-2">
                        <p className="text-xs text-muted-foreground">Skąd wystartował</p>
                        <p>{formatCoords(droneStatus.origin.lat, droneStatus.origin.lng)}</p>
                      </div>
                      <div className="rounded-md bg-muted/40 p-2">
                        <p className="text-xs text-muted-foreground">Dokąd dostarczono</p>
                        <p>{formatCoords(droneStatus.destination.lat, droneStatus.destination.lng)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                      <div className="rounded-md bg-muted/40 p-2">
                        <p className="text-xs text-muted-foreground">Skąd leci</p>
                        <p>{formatCoords(droneStatus.origin.lat, droneStatus.origin.lng)}</p>
                      </div>
                      <div className="rounded-md bg-muted/40 p-2">
                        <p className="text-xs text-muted-foreground">Aktualnie</p>
                        <p>{formatCoords(droneStatus.currentPosition.lat, droneStatus.currentPosition.lng)}</p>
                      </div>
                      <div className="rounded-md bg-muted/40 p-2">
                        <p className="text-xs text-muted-foreground">Dokąd leci</p>
                        <p>{formatCoords(droneStatus.destination.lat, droneStatus.destination.lng)}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Brak danych o trasie drona dla tego zamówienia.</p>
              )}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-1000 p-4">
          <div className="pointer-events-auto mx-auto w-full max-w-2xl rounded-lg border bg-background/95 p-2 shadow-lg backdrop-blur-sm">
            <DialogClose asChild>
              <Button variant="outline" className="w-full">
                <CaretLeftIcon size={16} />
                Zamknij szczegóły
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
