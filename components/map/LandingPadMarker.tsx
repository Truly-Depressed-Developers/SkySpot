'use client';

import { MapMarker, MapPopup } from '@/components/ui/map';
import { LandingPadDetailsDTO } from '@/types/dtos';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPinIcon } from 'lucide-react';
import { LandingPadStatus, LandingPadType } from '@prisma/client';

const typeLabels: Record<LandingPadType, string> = {
  DRIVEWAY: 'Podjazd',
  SQUARE: 'Plac',
  PARCEL_LOCKER_ROOF: 'Dach paczkomatu',
  HOUSE_ROOF: 'Dach domu',
  OTHER: 'Inne',
};

const statusColors: Record<LandingPadStatus, string> = {
  ACCEPTED: 'bg-green-500',
  WAITING_FOR_REVIEW: 'bg-yellow-500',
  REJECTED: 'bg-red-500',
};

interface LandingPadMarkerProps {
  pad: LandingPadDetailsDTO;
}

export function LandingPadMarker({ pad }: LandingPadMarkerProps) {
  return (
    <MapMarker
      position={pad.coords}
      icon={<MapPinIcon className="size-6 text-primary fill-primary/20" />}
    >
      <MapPopup>
        <div className="flex flex-col gap-2">
          {pad.imageUrl && (
            <img 
              src={pad.imageUrl} 
              alt={pad.name} 
              className="w-full h-32 object-cover rounded-md mb-2" 
            />
          )}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{pad.name}</h3>
            <Badge className={statusColors[pad.status]}>
              {pad.status === 'ACCEPTED' ? 'Aktywne' : 'Weryfikacja'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Typ: {typeLabels[pad.type]}
          </p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" className="w-full">Zamów tutaj</Button>
          </div>
        </div>
      </MapPopup>
    </MapMarker>
  );
}
