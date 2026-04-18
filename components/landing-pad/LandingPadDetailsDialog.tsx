'use client';

import { LandingPadAvailability, LandingPadStatus, LandingPadType } from '@prisma/client';
import { CaretLeftIcon } from '@phosphor-icons/react';

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
import type { LandingPadDetailsDTO } from '@/types/dtos';

type Props = {
  landingPad: LandingPadDetailsDTO;
};

const statusLabels: Record<LandingPadStatus, string> = {
  [LandingPadStatus.WAITING_FOR_REVIEW]: 'Oczekujące',
  [LandingPadStatus.REJECTED]: 'Odrzucone',
  [LandingPadStatus.ACCEPTED]: 'Zaakceptowane',
};

const statusBadgeClasses: Record<LandingPadStatus, string> = {
  [LandingPadStatus.WAITING_FOR_REVIEW]: 'border-yellow-200 bg-yellow-100 text-yellow-700',
  [LandingPadStatus.REJECTED]: 'border-red-200 bg-red-100 text-red-700',
  [LandingPadStatus.ACCEPTED]: 'border-green-200 bg-green-100 text-green-700',
};

const availabilityLabels: Record<LandingPadAvailability, string> = {
  [LandingPadAvailability.PRIVATE]: 'Prywatny, dostępny tylko dla Ciebie',
  [LandingPadAvailability.PUBLIC]: 'Publiczny, dostępny dla wszystkich użytkowników',
};

const typeLabels: Record<LandingPadType, string> = {
  [LandingPadType.DRIVEWAY]: 'Podjazd',
  [LandingPadType.SQUARE]: 'Plac',
  [LandingPadType.PARCEL_LOCKER_ROOF]: 'Dach paczkomatu',
  [LandingPadType.HOUSE_ROOF]: 'Dach budynku',
  [LandingPadType.OTHER]: 'Inne',
};

function formatPointAddress(lat: number, lng: number) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function LandingPadDetailsDialog({ landingPad }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 text-sm font-medium text-blue-600 hover:text-blue-700">
          Pokaż więcej
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-1.5rem)] max-w-3xl rounded-xl p-0 sm:w-[calc(100%-3rem)] gap-0"
      >
        <DialogHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">Szczegóły punktu</DialogTitle>
            <Badge variant="outline" className={statusBadgeClasses[landingPad.status]}>
              {statusLabels[landingPad.status]}
            </Badge>
          </div>
          <DialogDescription className="sr-only">Szczegółowe informacje o zgłoszonym lądowisku.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(92dvh-61px)] overflow-y-auto p-4">
          <div className="mx-auto w-full max-w-2xl space-y-4">
            {landingPad.imageUrl && (
              <img
                src={landingPad.imageUrl}
                alt={landingPad.name}
                className="h-44 w-full rounded-md object-cover"
              />
            )}

            <div className="space-y-2">
              <p className="text-base font-semibold">{landingPad.name}</p>
              <p className="text-sm text-muted-foreground">{landingPad.description}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Typ punktu</p>
                <p>{typeLabels[landingPad.type]}</p>
              </div>

              {landingPad.status === LandingPadStatus.REJECTED && landingPad.rejectionReason && (
                <div>
                  <p className="text-xs text-muted-foreground">Powód odrzucenia</p>
                  <p className="text-red-700">{landingPad.rejectionReason}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground">Adres punktu</p>
                <p>{formatPointAddress(landingPad.coords.lat, landingPad.coords.lng)}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Dostęp do punktu</p>
                <p>{availabilityLabels[landingPad.availability]}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Liczba rezerwacji</p>
                <p>{landingPad.reservations.length}</p>
              </div>
            </div>

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
