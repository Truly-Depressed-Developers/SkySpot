'use client';

import { LandingPadAvailability, LandingPadType } from '@prisma/client';
import { Map, MapLayers, MapMarker } from '@/components/ui/map';
import { BaseLayers } from '@/components/map/BaseLayers';
import { LandingPadDetailsDTO } from '@/types/dtos';
import { DetailSection } from './DetailSection';

interface LandingPadInfoProps {
  pad: LandingPadDetailsDTO;
  typeLabels: Record<LandingPadType, string>;
  accessOptions: readonly { value: LandingPadAvailability; label: string }[];
}

export function LandingPadInfo({ pad, typeLabels, accessOptions }: LandingPadInfoProps) {
  return (
    <main className="flex-1 space-y-8 p-6">
      <DetailSection label="Nazwa punktu">
        <div className="p-4 bg-muted/30 rounded-2xl border text-lg font-medium">
          {pad.name}
        </div>
      </DetailSection>

      <DetailSection label="Opis punktu">
        <div className="p-4 bg-muted/30 rounded-2xl border text-sm leading-relaxed text-muted-foreground">
          {pad.description || 'Brak opisu.'}
        </div>
      </DetailSection>

      <DetailSection label="Typ punktu">
        <div className="p-4 bg-muted/30 rounded-2xl border font-medium">
          {typeLabels[pad.type]}
        </div>
      </DetailSection>

      <DetailSection label="Położenie punktu">
        <div className="p-2 bg-muted/30 rounded-2xl border space-y-2">
          <div className="px-2 py-1 text-sm font-mono text-center opacity-70">
            {pad.coords.lat.toFixed(6)}, {pad.coords.lng.toFixed(6)}
          </div>
          <div className="h-48 rounded-xl overflow-hidden border">
            <Map center={pad.coords} zoom={15} className="h-full min-h-0!">
              <MapLayers defaultTileLayer="Jasna">
                <BaseLayers />
                <MapMarker position={pad.coords} />
              </MapLayers>
            </Map>
          </div>
        </div>
      </DetailSection>

      <DetailSection label="Dostęp do punktu">
        <div className="space-y-3">
          {accessOptions.map((option) => (
            <div
              key={option.value}
              className={`p-4 rounded-xl border flex items-center gap-3 ${
                pad.availability === option.value
                  ? 'bg-muted border-foreground/20'
                  : 'opacity-40 border-border'
              }`}
            >
              <div
                className={`size-4 rounded-full border-2 flex items-center justify-center ${
                  pad.availability === option.value ? 'border-foreground' : 'border-muted-foreground'
                }`}
              >
                {pad.availability === option.value && (
                  <div className="size-2 bg-foreground rounded-full" />
                )}
              </div>
              <span className="text-sm font-medium">{option.label}</span>
            </div>
          ))}
        </div>
      </DetailSection>

      <DetailSection label="Zdjęcie punktu">
        <div className="rounded-2xl border overflow-hidden bg-muted/30">
          {pad.imageUrl ? (
            <img src={pad.imageUrl} alt={pad.name} className="w-full aspect-video object-cover" />
          ) : (
            <div className="aspect-video flex items-center justify-center text-muted-foreground">
              Brak zdjęcia
            </div>
          )}
        </div>
      </DetailSection>
    </main>
  );
}
