'use client';

import { useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, MapMarker, MapPolyline, MapTileLayer } from '@/components/ui/map';
import { trpc } from '@/trpc/client';
import type { ProviderDroneListItemDTO } from '@/types/dtos/providerDrone';
import { LandingPadAvailability, LandingPadType, UserRole } from '@prisma/client';
import { CopyIcon } from '@phosphor-icons/react';
import { BatteryIcon, MapPinIcon, NavigationIcon } from 'lucide-react';
import type { LatLngBoundsExpression } from 'leaflet';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useMap } from 'react-leaflet';

type Props = {
  drone: ProviderDroneListItemDTO;
};

const landingPadTypeLabels: Record<LandingPadType, string> = {
  DRIVEWAY: 'Podjazd',
  SQUARE: 'Plac',
  PARCEL_LOCKER_ROOF: 'Dach paczkomatu',
  HOUSE_ROOF: 'Dach domu',
  OTHER: 'Inny',
};

const availabilityLabels: Record<LandingPadAvailability, string> = {
  PRIVATE: 'Prywatny',
  PUBLIC: 'Publiczny',
};

const packageSizeBadgeClasses = {
  Mała: 'border-slate-200 bg-slate-100 text-slate-700',
  Średnia: 'border-blue-200 bg-blue-100 text-blue-700',
  Duża: 'border-amber-200 bg-amber-100 text-amber-700',
} as const;

function formatDateTime(date: Date | null) {
  if (!date) {
    return 'Brak danych';
  }

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

function getBatteryBadgeClasses(drone: ProviderDroneListItemDTO) {
  if (!drone.isActive || drone.batteryLevel === null) {
    return 'bg-slate-100 text-slate-600';
  }

  if (drone.batteryLevel >= 60) {
    return 'bg-green-100 text-green-700';
  }

  if (drone.batteryLevel >= 30) {
    return 'bg-amber-100 text-amber-700';
  }

  return 'bg-red-100 text-red-700';
}

async function copyText(value: string, successText: string, errorText: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successText);
  } catch {
    toast.error(errorText);
  }
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

function DroneDetailsDialog({ drone }: Props) {
  const mapPoints = drone.currentPosition
    ? [drone.origin, drone.currentPosition, drone.destination]
    : [drone.origin, drone.destination];
  const currentPositionLabel = drone.currentPosition
    ? formatCoords(drone.currentPosition.lat, drone.currentPosition.lng)
    : 'Brak danych';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Pokaż więcej
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-1.5rem)] max-w-3xl rounded-xl p-0 sm:w-[calc(100%-3rem)] gap-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-base font-semibold">Szczegóły drona</DialogTitle>
          <DialogDescription className="sr-only">Szczegóły drona i aktywnej przesyłki.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(92dvh-61px)] overflow-y-auto p-4 pb-24">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Nazwa drona</p>
                <p className="text-sm font-medium">{drone.droneName}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Numer seryjny</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm">{drone.serialNumber}</p>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() =>
                      void copyText(
                        drone.serialNumber,
                        'Numer seryjny skopiowany',
                        'Nie udało się skopiować numeru seryjnego',
                      )
                    }
                    aria-label="Kopiuj numer seryjny"
                  >
                    <CopyIcon size={16} />
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Poziom naładowania</p>
                <div className={`mt-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium ${getBatteryBadgeClasses(drone)}`}>
                  <BatteryIcon className="size-4" />
                  {drone.batteryLevel === null ? 'Brak danych' : `${drone.batteryLevel}%`}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Rozmiar przesyłki</p>
                  <p className="text-sm font-medium">{drone.packageSize}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Waga przesyłki</p>
                  <p className="text-sm font-medium">{formatWeight(drone.packageWeightKg)}</p>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Odbiorca</p>
                <p className="text-sm font-medium">{drone.recipientFirstName} {drone.recipientLastName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Typ punktu</p>
                  <p className="text-sm font-medium">{landingPadTypeLabels[drone.landingPadType]}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Dostęp do punktu</p>
                  <p className="text-sm font-medium">{availabilityLabels[drone.landingPadAvailability]}</p>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Ostatnia aktualizacja</p>
                <p className="text-sm font-medium">{formatDateTime(drone.updatedAt)}</p>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-semibold">Pozycja na mapie</p>
              <p className="text-sm text-muted-foreground">Start: {formatCoords(drone.origin.lat, drone.origin.lng)}</p>
              {drone.currentPosition && (
                <p className="text-sm text-muted-foreground">Aktualnie: {formatCoords(drone.currentPosition.lat, drone.currentPosition.lng)}</p>
              )}
              <p className="text-sm text-muted-foreground">Koniec: {formatCoords(drone.destination.lat, drone.destination.lng)}</p>
              <div className="relative h-64 overflow-hidden rounded-md border">
                <Map center={drone.origin} zoom={13} className="h-full min-h-0! rounded-none">
                  <MapBoundsFitter points={mapPoints} />
                  <MapTileLayer
                    name="Jasna"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {drone.currentPosition ? (
                    <>
                      <MapPolyline
                        positions={[drone.origin, drone.currentPosition]}
                        pathOptions={{
                          color: 'hsl(var(--primary))',
                          weight: 3,
                          opacity: 0.4,
                        }}
                      />
                      <MapPolyline
                        positions={[drone.currentPosition, drone.destination]}
                        pathOptions={{
                          color: 'hsl(var(--primary))',
                          weight: 3,
                          dashArray: '6, 8',
                          opacity: 0.9,
                        }}
                      />
                    </>
                  ) : (
                    <MapPolyline
                      positions={[drone.origin, drone.destination]}
                      pathOptions={{
                        color: 'hsl(var(--primary))',
                        weight: 3,
                        opacity: 0.85,
                      }}
                    />
                  )}
                  <MapMarker
                    position={drone.origin}
                    icon={<MapPinIcon className="size-6 text-emerald-500 fill-emerald-500/20" />}
                  />
                  <MapMarker
                    position={drone.destination}
                    icon={<MapPinIcon className="size-6 text-amber-500 fill-amber-500/20" />}
                  />
                  {drone.currentPosition && (
                    <MapMarker
                      position={drone.currentPosition}
                      icon={<NavigationIcon className="size-7 text-blue-500 fill-blue-500/20" />}
                    />
                  )}
                </Map>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-semibold">Opis punktu</p>
              <p className="text-sm text-muted-foreground">{drone.landingPadDescription}</p>
              <img
                src={drone.landingPadImageUrl}
                alt={`Zdjęcie punktu dla ${drone.droneName}`}
                className="h-56 w-full rounded-md border object-cover"
              />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
          <div className="pointer-events-auto rounded-lg border bg-background/95 p-2 shadow-lg backdrop-blur-sm">
            <DialogClose asChild>
              <Button variant="outline" className="w-full">
                Zamknij szczegóły
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DroneCard({ drone }: Props) {
  return (
    <Card className="gap-0">
      <CardHeader className="flex flex-row items-start justify-between border-b">
        <CardTitle className="text-base font-semibold">{drone.droneName}</CardTitle>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium ${getBatteryBadgeClasses(drone)}`}>
            <BatteryIcon className="size-4" />
            {drone.batteryLevel === null ? 'Brak' : `${drone.batteryLevel}%`}
          </div>
          <div
            className={`rounded-md px-2 py-1 text-sm font-medium ${
              drone.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {drone.isActive ? 'Aktywny' : 'Nieaktywny'}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-4 pb-4">
        <div>
          <p className="text-xs text-muted-foreground">Numer seryjny</p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-sm">{drone.serialNumber}</p>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() =>
                void copyText(
                  drone.serialNumber,
                  'Numer seryjny skopiowany',
                  'Nie udało się skopiować numeru seryjnego',
                )
              }
              aria-label="Kopiuj numer seryjny"
            >
              <CopyIcon size={16} />
            </Button>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Rozmiar przesyłki</p>
          <Badge variant="outline" className={packageSizeBadgeClasses[drone.packageSize]}>
            {drone.packageSize}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <DroneDetailsDialog drone={drone} />
      </CardFooter>
    </Card>
  );
}

export default function CompanyDronesPage() {
  const { data: session } = useSession();
  const isProvider = session?.user?.role === UserRole.DRONE_PROVIDER;

  const providerDronesQuery = trpc.droneStatus.getProviderDroneList.useQuery(undefined, {
    enabled: isProvider,
  });

  const allDrones = providerDronesQuery.data ?? [];
  const activeDrones = useMemo(() => allDrones.filter((drone) => drone.isActive), [allDrones]);
  const inactiveDrones = useMemo(() => allDrones.filter((drone) => !drone.isActive), [allDrones]);

  const renderDroneList = (drones: ProviderDroneListItemDTO[], emptyMessage: string) => {
    if (drones.length === 0) {
      return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
    }

    return (
      <div className="space-y-4">
        {drones.map((drone) => (
          <DroneCard key={drone.droneId} drone={drone} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Drony" />
      <main className="flex-1 space-y-4 px-4 pb-6">
        {!isProvider && (
          <p className="text-sm text-muted-foreground">Ta podstrona jest dostępna tylko dla providera dronów.</p>
        )}

        {isProvider && (
          <Tabs defaultValue="ALL" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted p-1">
              <TabsTrigger value="ALL" className="data-active:bg-primary data-active:text-primary-foreground">
                Wszystkie
              </TabsTrigger>
              <TabsTrigger value="ACTIVE" className="data-active:bg-primary data-active:text-primary-foreground">
                Aktywne
              </TabsTrigger>
              <TabsTrigger value="INACTIVE" className="data-active:bg-primary data-active:text-primary-foreground">
                Nieaktywne
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ALL" className="space-y-4">
              {renderDroneList(allDrones, 'Brak dronów do wyświetlenia.')}
            </TabsContent>

            <TabsContent value="ACTIVE" className="space-y-4">
              {renderDroneList(activeDrones, 'Brak aktywnych dronów.')}
            </TabsContent>

            <TabsContent value="INACTIVE" className="space-y-4">
              {renderDroneList(inactiveDrones, 'Brak nieaktywnych dronów.')}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
