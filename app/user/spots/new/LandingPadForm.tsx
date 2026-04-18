'use client';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LandingPadAvailability, LandingPadType, UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import { z } from 'zod';
import { MapPinIcon, UploadSimpleIcon } from '@phosphor-icons/react';

import { PageHeaderWithBack } from '@/components/FormHeader';
import { BaseLayers } from '@/components/map/BaseLayers';
import { LandingPadMarker } from '@/components/map/LandingPadMarker';
import { KRAKOW_COORDINATES } from '@/components/map/mapConfig';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Map, MapLayerGroup, MapLayers, MapLayersControl, MapMarker, MapZoomControl } from '@/components/ui/map';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/trpc/client';
import type { CoordsDTO, LandingPadDetailsDTO } from '@/types/dtos';

const landingPadTypeLabels: Record<LandingPadType, string> = {
  [LandingPadType.DRIVEWAY]: 'Podjazd',
  [LandingPadType.SQUARE]: 'Plac',
  [LandingPadType.PARCEL_LOCKER_ROOF]: 'Dach paczkomatu',
  [LandingPadType.HOUSE_ROOF]: 'Dach budynku',
  [LandingPadType.OTHER]: 'Inne',
};

const landingPadTypes = Object.values(LandingPadType).map((value) => ({
  value,
  label: landingPadTypeLabels[value],
}));

const accessOptions = [
  {
    value: LandingPadAvailability.PRIVATE,
    label: 'Prywatny, dostępny tylko dla Ciebie',
  },
  {
    value: LandingPadAvailability.PUBLIC,
    label: 'Publiczny, dostępny dla wszystkich użytkowników',
  },
] as const;


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

type LandingPadFormData = z.infer<typeof landingPadFormSchema>;

function getFieldErrorMessage(field: 'type' | 'availability' | 'coords', message: string | undefined) {
  if (!message) {
    return undefined;
  }

  if (field === 'type' && message.startsWith('Invalid option')) {
    return 'Typ punktu jest wymagany';
  }

  if (field === 'availability' && message.startsWith('Invalid option')) {
    return 'Dostęp do punktu jest wymagany';
  }

  if (field === 'coords' && message.includes('expected object')) {
    return 'Koordynaty punktu są wymagane';
  }

  return message;
}

function formatCoords(coords: CoordsDTO | undefined) {
  if (!coords) {
    return '';
  }

  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
}

function MapClickHandler({ onSelect }: { onSelect: (coords: CoordsDTO) => void }) {
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

function CoordinatesPicker({
  value,
  onChange,
  landingPads,
}: {
  value: CoordsDTO | undefined;
  onChange: (coords: CoordsDTO) => void;
  landingPads: LandingPadDetailsDTO[];
}) {
  const [open, setOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<CoordsDTO>(KRAKOW_COORDINATES);
  const [draft, setDraft] = useState<CoordsDTO | undefined>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setMapCenter(value ?? KRAKOW_COORDINATES);
    }
  }, [open, value]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <MapPinIcon />
        </InputGroupAddon>
        <InputGroupInput readOnly value={formatCoords(value)} />
        <InputGroupButton onClick={() => setOpen(true)}>Wybierz z mapy</InputGroupButton>
      </InputGroup>

      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Wybierz koordynaty punktu</DialogTitle>
          <DialogDescription>Kliknij w mapę, aby ustawić dokładną lokalizację nowego punktu odbioru.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="h-80 overflow-hidden rounded-lg border">
            <Map center={mapCenter}>
              <MapLayers defaultTileLayer="Jasna" defaultLayerGroups={[]}>
                <BaseLayers />

                <MapLayerGroup name="Istniejące lądowiska">
                  {landingPads.map((landingPad) => (
                    <LandingPadMarker key={landingPad.id} pad={landingPad} />
                  ))}
                </MapLayerGroup>

                <MapClickHandler
                  onSelect={(coords) => {
                    setDraft(coords);
                    setMapCenter(coords);
                  }}
                />
                {draft && <MapMarker position={draft} />}
                <MapLayersControl
                  position="top-1 left-1"
                  tileLayersLabel="Widok mapy"
                  layerGroupsLabel="Warstwy"
                />
              </MapLayers>
              <MapZoomControl position="top-1 right-1" />
            </Map>
          </div>

          <p className="text-sm text-muted-foreground">
            Wybrany punkt: {draft ? formatCoords(draft) : 'Nie wybrano'}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button
            disabled={!draft}
            onClick={() => {
              if (draft) {
                onChange(draft);
              }
              setOpen(false);
            }}
          >
            Zapisz współrzędne
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LandingPadForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const isUser = session?.user?.role === UserRole.USER;
  const createLandingPadMutation = trpc.landingPad.create.useMutation();
  const landingPadsQuery = trpc.landingPad.getAll.useQuery(undefined, {
    enabled: isUser,
  });

  const form = useForm<LandingPadFormData>({
    resolver: zodResolver(landingPadFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: undefined,
      availability: LandingPadAvailability.PUBLIC,
      coords: undefined,
      imageUrl: '',
    },
  });

  const coords = form.watch('coords');
  const imageUrl = form.watch('imageUrl');

  const onSubmit = form.handleSubmit(async (values) => {
    if (!values.type) {
      form.setError('type', { message: 'Typ punktu jest wymagany' });
      return;
    }

    if (!values.availability) {
      form.setError('availability', { message: 'Dostęp do punktu jest wymagany' });
      return;
    }

    if (!values.coords) {
      form.setError('coords', { message: 'Koordynaty punktu są wymagane' });
      return;
    }

    try {
      await createLandingPadMutation.mutateAsync({
        ...values,
        type: values.type,
        availability: values.availability,
        coords: values.coords,
      });
      toast.success('Punkt został zgłoszony');
      router.push('/user/spots');
    } catch {
      toast.error('Nie udało się zgłosić punktu');
    }
  });

  if (!isUser) {
    return (
      <div className="flex min-h-full flex-col bg-background p-4 pt-0">
        <PageHeaderWithBack title="Szczegóły" />
        <main className="flex-1 p-4">
          <p className="text-sm text-muted-foreground">Ta podstrona jest dostępna tylko dla zwykłego użytkownika.</p>
        </main>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-full flex-col bg-background">
      <PageHeaderWithBack
        title="Szczegóły"
        action={
          <Button type="submit" disabled={createLandingPadMutation.isPending || form.formState.isSubmitting}>
            {createLandingPadMutation.isPending || form.formState.isSubmitting ? 'Zapisywanie...' : 'Gotowe'}
          </Button>
        }
      />

      <main className="flex-1 space-y-8 p-4 pb-6">
        <section className="space-y-2">
          <h2 className="text-3xl font-medium tracking-tight">Dodaj nowy punkt odbioru</h2>
        </section>

            <Field>
              <FieldLabel htmlFor="name">Nazwa punktu</FieldLabel>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <>
                    <Input id={field.name} placeholder="Wpisz nazwę" {...field} aria-invalid={fieldState.invalid} />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </>
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Opis punktu</FieldLabel>
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <>
                    <Textarea
                      id={field.name}
                      placeholder="Wpisz opis"
                      rows={4}
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </>
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="type">Typ punktu</FieldLabel>
              <Controller
                control={form.control}
                name="type"
                render={({ field, fieldState }) => (
                  <>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} className="w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Wybierz typ" />
                      </SelectTrigger>
                      <SelectContent>
                        {landingPadTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError>{getFieldErrorMessage('type', fieldState.error?.message)}</FieldError>
                  </>
                )}
              />
            </Field>

            <Field>
              <FieldLabel>Koordynaty punktu</FieldLabel>
              <FieldDescription>Kliknij na mapie, aby dokładnie wskazać położenie punktu.</FieldDescription>
              <Controller
                control={form.control}
                name="coords"
                render={({ field, fieldState }) => (
                  <>
                    <CoordinatesPicker
                      value={field.value}
                      onChange={field.onChange}
                      landingPads={landingPadsQuery.data ?? []}
                    />
                    <FieldError>{getFieldErrorMessage('coords', fieldState.error?.message)}</FieldError>
                  </>
                )}
              />
            </Field>

            <Field>
              <FieldLabel>Dostęp do punktu</FieldLabel>
              <Controller
                control={form.control}
                name="availability"
                render={({ field, fieldState }) => (
                  <>
                    <div className="space-y-2">
                      {accessOptions.map((option) => {
                        const isSelected = field.value === option.value;
                        const optionId = `availability-${option.value.toLowerCase()}`;

                        return (
                          <label
                            key={option.value}
                            htmlFor={optionId}
                            className={`block cursor-pointer rounded-xl border p-3 transition-colors ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 text-blue-800'
                                : 'border-border bg-background text-foreground hover:bg-muted/30'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                id={optionId}
                                type="radio"
                                name={field.name}
                                value={option.value}
                                checked={isSelected}
                                onChange={() => field.onChange(option.value)}
                                className="mt-1 size-4 accent-blue-600"
                              />
                              <span className="text-sm">{option.label}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <FieldError>{getFieldErrorMessage('availability', fieldState.error?.message)}</FieldError>
                  </>
                )}
              />
            </Field>

            <Field>
              <FieldLabel>Zdjęcie punktu</FieldLabel>
              <FieldDescription>Dodaj zdjęcie, aby moderator mógł szybciej zweryfikować zgłoszenie.</FieldDescription>
              <Controller
                control={form.control}
                name="imageUrl"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Podgląd zdjęcia punktu" className="max-h-40 w-full rounded-md object-cover" />
                      ) : (
                        <UploadSimpleIcon className="size-10 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">{imageUrl ? 'Zmień zdjęcie punktu' : 'Prześlij zdjęcie punktu'}</span>
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
            </Field>
      </main>
    </form>
  );
}