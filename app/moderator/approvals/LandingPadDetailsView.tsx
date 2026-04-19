'use client';

import { useState } from 'react';
import { LandingPadAvailability, LandingPadStatus, LandingPadType } from '@prisma/client';
import { toast } from 'sonner';

import { LandingPadDetailsDTO } from '@/types/dtos';
import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { PageHeaderWithBack } from '@/components/FormHeader';

import { LandingPadEditForm, LandingPadFormData } from './components/LandingPadEditForm';

const landingPadTypeLabels: Record<LandingPadType, string> = {
  [LandingPadType.DRIVEWAY]: 'Podjazd',
  [LandingPadType.SQUARE]: 'Plac',
  [LandingPadType.PARCEL_LOCKER_ROOF]: 'Dach paczkomatu',
  [LandingPadType.HOUSE_ROOF]: 'Dach budynku',
  [LandingPadType.OTHER]: 'Inne',
};

const accessOptions = [
  {
    value: LandingPadAvailability.PRIVATE,
    label: 'Prywatny, dostępny tylko dla Ciebie',
  },
  {
    value: LandingPadAvailability.PUBLIC,
    label: 'Publiczny, dostępny dla wszystkich',
  },
] as const;

type LandingPadDetailsViewProps = {
  pad: LandingPadDetailsDTO;
  onBack: () => void;
  onSaveSuccess: (pad: LandingPadDetailsDTO) => void;
  onStatusSuccess: () => void;
};

export function LandingPadDetailsView({
  pad,
  onBack,
  onSaveSuccess,
  onStatusSuccess,
}: LandingPadDetailsViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isWaitingForReview = pad.status === LandingPadStatus.WAITING_FOR_REVIEW;

  const updateStatusMutation = trpc.landingPad.updateStatus.useMutation();
  const updateMutation = trpc.landingPad.update.useMutation();

  const handleStatusUpdate = async (status: LandingPadStatus) => {
    if (!isWaitingForReview) {
      toast.error('Status zgłoszenia został już rozpatrzony');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({ id: pad.id, status });
      toast.success(`Punkt został ${status === LandingPadStatus.ACCEPTED ? 'zaakceptowany' : 'odrzucony'}`);
      onStatusSuccess();
    } catch {
      toast.error('Wystąpił błąd podczas zmiany statusu');
    }
  };

  const handleSave = async (values: LandingPadFormData) => {
    if (!isWaitingForReview) {
      toast.error('Można edytować tylko zgłoszenia oczekujące na weryfikację');
      return;
    }

    try {
      const updatedPad = await updateMutation.mutateAsync({
        id: pad.id,
        ...values,
      });
      toast.success('Zmiany zostały zapisane');
      setIsEditing(false);
      onSaveSuccess(updatedPad);
    } catch {
      toast.error('Błąd podczas zapisywania zmian');
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-32">
      <PageHeaderWithBack
        title={isEditing ? "Edycja punktu" : "Szczegóły punktu"}
        onBack={isEditing ? () => setIsEditing(false) : onBack}
        action={isWaitingForReview ? (
          <button
            onClick={() => {
              if (isEditing) {
                document.getElementById('hidden-submit-btn')?.click();
              } else {
                setIsEditing(true);
              }
            }}
            className="text-blue-600 font-medium px-2"
          >
            {isEditing ? "Zapisz" : "Edytuj"}
          </button>
        ) : null}
      />

      {isEditing ? (
        <LandingPadEditForm
          pad={pad}
          onSubmit={handleSave}
          typeLabels={landingPadTypeLabels}
          accessOptions={accessOptions}
        />
      ) : (
        <>
          <LandingPadEditForm
            pad={pad}
            typeLabels={landingPadTypeLabels}
            accessOptions={accessOptions}
            readonly
          />

          {isWaitingForReview && (
            <footer className="fixed bottom-12.5 left-0 right-0 p-4 bg-background border-t flex flex-col gap-3 z-50 md:max-w-md md:mx-auto">
              <Button
                className="w-full h-14 rounded-full bg-black text-white hover:bg-black/90 text-lg font-semibold"
                onClick={() => handleStatusUpdate(LandingPadStatus.ACCEPTED)}
                disabled={updateStatusMutation.isPending}
              >
                Zaakceptuj punkt
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 rounded-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 text-lg font-semibold"
                onClick={() => handleStatusUpdate(LandingPadStatus.REJECTED)}
                disabled={updateStatusMutation.isPending}
              >
                Odrzuć punkt
              </Button>
            </footer>
          )}
        </>
      )}
    </div>
  );
}
