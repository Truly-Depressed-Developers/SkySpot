'use client';

import { LandingPadStatus, LandingPadAvailability } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LandingPadDetailsDTO } from '@/types/dtos';
import { Badge } from '@/components/ui/badge';

interface ApprovalsListProps {
  landingPads: LandingPadDetailsDTO[];
  onSelect: (pad: LandingPadDetailsDTO) => void;
}

const statusLabels: Record<LandingPadStatus, string> = {
  WAITING_FOR_REVIEW: 'Oczekujące',
  ACCEPTED: 'Zaakceptowane',
  REJECTED: 'Odrzucone',
};

const statusBadgeClasses: Record<LandingPadStatus, string> = {
  WAITING_FOR_REVIEW: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  ACCEPTED: 'bg-green-100 text-green-800 hover:bg-green-100',
  REJECTED: 'bg-red-100 text-red-800 hover:bg-red-100',
};

const availabilityLabels: Record<LandingPadAvailability, string> = {
  PRIVATE: 'Prywatny, dostępny tylko dla Ciebie',
  PUBLIC: 'Publiczny, dostępny dla wszystkich',
};

export function ApprovalsList({ landingPads, onSelect }: ApprovalsListProps) {
  const renderList = (status: LandingPadStatus) => {
    const filtered = landingPads.filter((pad) => pad.status === status);

    if (filtered.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          Brak punktów w tej kategorii.
        </div>
      );
    }

    return (
      <div className="space-y-4 pt-4">
        {filtered.map((pad) => (
          <div
            key={pad.id}
            className="rounded-3xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-medium">{pad.name}</h3>
              <Badge
                variant="secondary"
                className={`rounded-full px-4 py-1 ${statusBadgeClasses[pad.status]}`}
              >
                {statusLabels[pad.status]}
              </Badge>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Adres punktu</p>
                <p className="font-medium">
                  {pad.coords.lat.toFixed(6)}, {pad.coords.lng.toFixed(6)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Dostęp do punktu</p>
                <p className="font-medium">{availabilityLabels[pad.availability]}</p>
              </div>

              <button
                onClick={() => onSelect(pad)}
                className="text-blue-600 font-medium hover:underline pt-2 block"
              >
                Pokaż więcej
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="WAITING_FOR_REVIEW" className="w-full">
      <TabsList className="w-full justify-between bg-transparent h-auto p-0 gap-2">
        <TabsTrigger
          value="WAITING_FOR_REVIEW"
          className="flex-1 rounded-full py-2 px-4 data-active:bg-blue-600 data-active:text-white"
        >
          Oczekujące
        </TabsTrigger>
        <TabsTrigger
          value="REJECTED"
          className="flex-1 rounded-full py-2 px-4 data-active:bg-blue-600 data-active:text-white"
        >
          Odrzucone
        </TabsTrigger>
        <TabsTrigger
          value="ACCEPTED"
          className="flex-1 rounded-full py-2 px-4 data-active:bg-blue-600 data-active:text-white"
        >
          Zaakceptowane
        </TabsTrigger>
      </TabsList>

      <TabsContent value="WAITING_FOR_REVIEW">
        {renderList('WAITING_FOR_REVIEW')}
      </TabsContent>
      <TabsContent value="REJECTED">
        {renderList('REJECTED')}
      </TabsContent>
      <TabsContent value="ACCEPTED">
        {renderList('ACCEPTED')}
      </TabsContent>
    </Tabs>
  );
}
