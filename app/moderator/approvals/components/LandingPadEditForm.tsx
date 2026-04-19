'use client';

import { useState } from 'react';
import { LandingPadAvailability, LandingPadType } from '@prisma/client';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPinIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { useMapEvents } from 'react-leaflet';

import { LandingPadDetailsDTO, CoordsDTO } from '@/types/dtos';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Map, MapLayers, MapMarker } from '@/components/ui/map';
import { BaseLayers } from '@/components/map/BaseLayers';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';

const landingPadFormSchema = z.object({
  name: z.string().min(1, 'Nazwa punktu jest wymagana'),
  description: z.string().min(1, 'Opis punktu jest wymagany'),
  type: z.enum(LandingPadType),
  availability: z.enum(LandingPadAvailability),
  coords: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  imageUrl: z.string().min(1, 'Zdjęcie punktu jest wymagane'),
});

export type LandingPadFormData = z.infer<typeof landingPadFormSchema>;

type Props = {
  pad: LandingPadDetailsDTO;
  onSubmit?: (values: LandingPadFormData) => void;
  typeLabels: Record<LandingPadType, string>;
  accessOptions: readonly { value: LandingPadAvailability; label: string }[];
  readonly?: boolean;
};

type MapClickHandlerProps = {
  onSelect: (coords: CoordsDTO) => void;
};

function MapClickHandler({ onSelect }: MapClickHandlerProps) {
  useMapEvents({
    click: (event) => {
      onSelect({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Nie udało się odczytać pliku'));
    };

    reader.onerror = () => reject(new Error('Nie udało się odczytać pliku'));
    reader.readAsDataURL(file);
  });
}

export function LandingPadEditForm({
  pad,
  onSubmit,
  typeLabels,
  accessOptions,
  readonly = false,
}: Props) {
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);

  const form = useForm<LandingPadFormData>({
    resolver: zodResolver(landingPadFormSchema),
    defaultValues: {
      name: pad.name,
      description: pad.description,
      type: pad.type,
      availability: pad.availability,
      coords: { lat: pad.coords.lat, lng: pad.coords.lng },
      imageUrl: pad.imageUrl,
    },
  });

  const imageUrl = form.watch('imageUrl');

  return (
    <main
      className={`flex-1 space-y-6 p-4 ${readonly ? 'rounded-2xl border border-border/60 bg-muted/20 text-muted-foreground' : ''}`}
      id="edit-form"
    >
      <Field>
        <FieldLabel>Nazwa punktu</FieldLabel>
        <Input {...form.register('name')} readOnly={readonly} />
        {!readonly && <FieldError>{form.formState.errors.name?.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel>Opis punktu</FieldLabel>
        <Textarea {...form.register('description')} rows={4} readOnly={readonly} />
        {!readonly && <FieldError>{form.formState.errors.description?.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel>Typ punktu</FieldLabel>
        <Controller
          control={form.control}
          name="type"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                if (!readonly) {
                  field.onChange(value);
                }
              }}
              disabled={readonly}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(LandingPadType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {typeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field>
        <FieldLabel>Koordynaty punktu</FieldLabel>
        <Controller
          control={form.control}
          name="coords"
          render={({ field }) => (
            <div className="space-y-4">
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <MapPinIcon />
                </InputGroupAddon>
                <InputGroupInput
                  readOnly
                  value={`${field.value.lat.toFixed(6)}, ${field.value.lng.toFixed(6)}`}
                />
                <InputGroupButton onClick={() => setIsMapDialogOpen(true)} disabled={readonly}>
                  Wybierz z mapy
                </InputGroupButton>
              </InputGroup>
              <div className="h-48 rounded-xl border overflow-hidden">
                <Map center={field.value} zoom={15} className="h-full min-h-0!">
                  <MapLayers defaultTileLayer="Jasna">
                    <BaseLayers />
                    <MapMarker position={field.value} />
                  </MapLayers>
                </Map>
              </div>
            </div>
          )}
        />
      </Field>

      {!readonly && (
        <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Wybierz koordynaty</DialogTitle>
              <DialogDescription>Kliknij w mapę, aby zmienić lokalizację.</DialogDescription>
            </DialogHeader>
            <div className="h-96 rounded-lg border overflow-hidden">
              <Map center={form.getValues('coords')} className="h-full min-h-0!">
                <MapLayers defaultTileLayer="Jasna">
                  <BaseLayers />
                  <MapClickHandler onSelect={(coords) => form.setValue('coords', coords)} />
                  <MapMarker position={form.watch('coords')} />
                </MapLayers>
              </Map>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsMapDialogOpen(false)}>Gotowe</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Field>
        <FieldLabel>Dostęp do punktu</FieldLabel>
        <Controller
          control={form.control}
          name="availability"
          render={({ field }) => (
            <div className="space-y-2">
              {accessOptions.map((option) => (
                <label
                  key={option.value}
                  className={`block cursor-pointer rounded-xl border p-4 ${field.value === option.value
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-border'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={field.value === option.value}
                      onChange={() => field.onChange(option.value)}
                      disabled={readonly}
                      className="size-4 accent-blue-600"
                    />
                    <span className="text-sm">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        />
      </Field>

      <Field>
        <FieldLabel>Zdjęcie punktu</FieldLabel>
        {!readonly && (
          <Controller
            control={form.control}
            name="imageUrl"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Podgląd zdjęcia punktu"
                      className="max-h-40 w-full rounded-md object-cover"
                    />
                  ) : (
                    <UploadSimpleIcon className="size-10 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {imageUrl ? 'Zmień zdjęcie punktu' : 'Prześlij zdjęcie punktu'}
                  </span>
                  <span className="text-xs text-muted-foreground">PNG, JPG, WEBP</span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];

                      if (!file) {
                        field.onChange('');
                        return;
                      }

                      const dataUrl = await readFileAsDataUrl(file);
                      field.onChange(dataUrl);
                    }}
                  />
                </label>
                <FieldError>{fieldState.error?.message}</FieldError>
              </div>
            )}
          />
        )}
      </Field>

      {readonly && (
        <div className="rounded-2xl border overflow-hidden bg-muted/30">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={form.watch('name')}
              className="w-full aspect-video object-cover"
            />
          ) : (
            <div className="aspect-video flex items-center justify-center text-muted-foreground">
              Brak zdjęcia
            </div>
          )}
        </div>
      )}

      {!readonly && onSubmit && (
        <button
          type="submit"
          className="hidden"
          onClick={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }}
          id="hidden-submit-btn"
        />
      )}
    </main>
  );
}
