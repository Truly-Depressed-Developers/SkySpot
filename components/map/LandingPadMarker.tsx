'use client';

import { MapMarker } from '@/components/ui/map';
import { LandingPadDetailsDTO } from '@/types/dtos';
import { MapPinIcon } from 'lucide-react';
type Props = {
  pad: LandingPadDetailsDTO;
  onSelect?: (pad: LandingPadDetailsDTO) => void;
};

export function LandingPadMarker({ pad, onSelect }: Props) {
  return (
    <MapMarker
      position={pad.coords}
      eventHandlers={{
        click: () => {
          onSelect?.(pad);
        },
      }}
      icon={<MapPinIcon className="size-6 text-primary fill-primary/20" />}
    />
  );
}
