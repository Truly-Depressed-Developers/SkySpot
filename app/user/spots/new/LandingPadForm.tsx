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
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Map, MapLayers, MapMarker, MapTileLayer, MapZoomControl } from '@/components/ui/map';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/trpc/client';
import type { CoordsDTO } from '@/types/dtos';

const KRAKOW_COORDINATES: CoordsDTO = { lat: 50.065406, lng: 19.937587 };

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

const accessOptionLabels: Record<LandingPadAvailability, string> = {
  [LandingPadAvailability.PUBLIC]: 'Publiczny',
  [LandingPadAvailability.PRIVATE]: 'Prywatny',
};

const accessOptions = Object.values(LandingPadAvailability).map((value) => ({
  value,
  label: accessOptionLabels[value],
}));

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

function formatCoords(coords: CoordsDTO) {
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
}: {
  value: CoordsDTO;
  onChange: (coords: CoordsDTO) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CoordsDTO>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
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
            <Map center={draft}>
              <MapLayers defaultTileLayer="Jasna">
                <MapTileLayer
                  name="Jasna"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <MapTileLayer
                  name="Satelita"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri"
                />
                <MapClickHandler onSelect={setDraft} />
                <MapMarker position={draft} />
              </MapLayers>
              <MapZoomControl position="top-1 right-1" />
            </Map>
          </div>

          <p className="text-sm text-muted-foreground">Wybrany punkt: {formatCoords(draft)}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button
            onClick={() => {
              onChange(draft);
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

  const form = useForm<LandingPadFormData>({
    resolver: zodResolver(landingPadFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: LandingPadType.SQUARE,
      availability: LandingPadAvailability.PUBLIC,
      coords: KRAKOW_COORDINATES,
      imageUrl: '',
    },
  });

  const coords = form.watch('coords');
  const imageUrl = form.watch('imageUrl');

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createLandingPadMutation.mutateAsync(values);
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
          <h2 className="text-3xl font-semibold tracking-tight">Dodaj nowy punkt odbioru</h2>
          <p className="text-sm text-muted-foreground">Wypełnij formularz, wybierz punkt na mapie i dołącz zdjęcie miejsca.</p>
        </section>

        <Card>
          <CardContent className="space-y-6 p-4">
            <Field>
              <FieldLabel htmlFor="name">Nazwa punktu</FieldLabel>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <>
                    <Input id={field.name} placeholder="Np. Punkt przy rynku" {...field} aria-invalid={fieldState.invalid} />
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
                      placeholder="Opisz charakter miejsca, dojazd lub ograniczenia dostępu"
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} className="w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Wybierz typ punktu" />
                      </SelectTrigger>
                      <SelectContent>
                        {landingPadTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
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
                render={({ field }) => <CoordinatesPicker value={field.value} onChange={field.onChange} />}
              />
            </Field>

            <Field>
              <FieldLabel>Dostęp do punktu</FieldLabel>
              <Controller
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <ButtonGroup className="w-full">
                    {accessOptions.map((option) => {
                      const selected = field.value === option.value;
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          className="flex-1"
                          variant={selected ? 'default' : 'secondary'}
                          onClick={() => field.onChange(option.value)}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
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

            <p className="text-sm text-muted-foreground">Wybrane współrzędne: {formatCoords(coords)}</p>
          </CardContent>
        </Card>
      </main>
    </form>
  );
}