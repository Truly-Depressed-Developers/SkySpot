'use client';

import { LandingPadStatus, LandingPadType, UserRole } from '@prisma/client';
import { BatteryIcon, PackageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { DroneStatusDTO, LandingPadDetailsDTO } from '@/types/dtos';

type SelectedMarker =
  | { type: 'landing-pad'; pad: LandingPadDetailsDTO }
  | { type: 'drone'; drone: DroneStatusDTO }
  | null;

type Props = {
  selectedMarker: SelectedMarker;
  onClose: () => void;
};

const typeLabels: Record<LandingPadType, string> = {
  DRIVEWAY: 'Podjazd',
  SQUARE: 'Plac',
  PARCEL_LOCKER_ROOF: 'Dach paczkomatu',
  HOUSE_ROOF: 'Dach domu',
  OTHER: 'Inne',
};

const statusLabelByLandingPadStatus: Record<LandingPadStatus, string> = {
  ACCEPTED: 'Aktywne',
  WAITING_FOR_REVIEW: 'Weryfikacja',
  REJECTED: 'Odrzucone',
};

const statusColorByLandingPadStatus: Record<LandingPadStatus, string> = {
  ACCEPTED: 'bg-green-500',
  WAITING_FOR_REVIEW: 'bg-yellow-500 text-black',
  REJECTED: 'bg-red-500',
};

function getOrdersRoute(role: UserRole | undefined) {
  if (role === UserRole.USER) {
    return '/user/orders';
  }

  if (role === UserRole.DRONE_PROVIDER) {
    return '/company/orders';
  }

  return '/auth/signin';
}

function formatCoords(lat: number, lng: number) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function MapBottomSheet({ selectedMarker, onClose }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isUser = role === UserRole.USER;

  if (!selectedMarker) {
    return null;
  }

  return (
    <Drawer
      open={!!selectedMarker}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DrawerContent className="mx-auto w-full md:max-w-xl">
        <DrawerHeader className="border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DrawerTitle>
                {selectedMarker.type === 'landing-pad' ? 'Szczegóły punktu' : 'Status lotu'}
              </DrawerTitle>
              <DrawerDescription>
                {selectedMarker.type === 'landing-pad'
                  ? 'Podgląd lądowiska i możliwość rozpoczęcia zamówienia'
                  : 'Bieżący status aktywnego lotu'}
              </DrawerDescription>
            </div>

            <DrawerClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Zamknij">
                <span className="text-lg leading-none">×</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="max-h-[calc(92dvh-5rem)] overflow-y-auto p-4 pb-0">
          {selectedMarker.type === 'landing-pad' ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">{selectedMarker.pad.name}</h3>
                  <p className="text-sm text-muted-foreground">Typ: {typeLabels[selectedMarker.pad.type]}</p>
                </div>
                {/* <Badge className={statusColorByLandingPadStatus[selectedMarker.pad.status]}>
                  {statusLabelByLandingPadStatus[selectedMarker.pad.status]}
                </Badge> */}
              </div>

              <p className="text-sm text-muted-foreground">{selectedMarker.pad.description || 'Brak opisu.'}</p>

              <div className="rounded-lg border p-3 text-sm">
                <span className="text-muted-foreground">Koordynaty:</span>{' '}
                <span className="font-mono">
                  {formatCoords(selectedMarker.pad.coords.lat, selectedMarker.pad.coords.lng)}
                </span>
              </div>

              {selectedMarker.pad.imageUrl ? (
                <img
                  src={selectedMarker.pad.imageUrl}
                  alt={selectedMarker.pad.name}
                  className="h-44 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-44 w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                  Brak zdjęcia punktu
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <PackageIcon className="size-5 text-blue-500" />
                <h3 className="text-xl font-semibold">Dron: {selectedMarker.drone.droneId}</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {!isUser && (
                  <div className="rounded-lg border p-2">
                    <span className="text-muted-foreground">Bateria</span>
                    <div className="mt-1 flex items-center gap-1 font-semibold">
                      <BatteryIcon
                        className={`size-4 ${selectedMarker.drone.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`}
                      />
                      <span>{selectedMarker.drone.batteryLevel}%</span>
                    </div>
                  </div>
                )}

                <div className={`rounded-lg border p-2 ${isUser ? 'col-span-2' : ''}`}>
                  <span className="text-muted-foreground">Status</span>
                  <p className="mt-1 font-semibold">W locie</p>
                </div>
              </div>

              <div className="rounded-lg border p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">ID zamówienia:</span>{' '}
                  <span className="font-mono">{selectedMarker.drone.orderId}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <DrawerFooter className="border-t">
          {selectedMarker.type === 'landing-pad' ? (
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                onClose();
                router.push(getOrdersRoute(role));
              }}
            >
              Zamów tutaj
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                onClose();
                router.push(getOrdersRoute(role));
              }}
            >
              Szczegóły dostawy
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export type { SelectedMarker };
