'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { trpc } from '@/trpc/client';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { ApprovalsList } from './ApprovalsList';
import { LandingPadDetailsView } from './LandingPadDetailsView';
import { LandingPadDetailsDTO } from '@/types/dtos';

export default function ModeratorApprovalsPage() {
  const { data: session } = useSession();
  const [selectedPad, setSelectedPad] = useState<LandingPadDetailsDTO | null>(null);

  const isModerator = session?.user?.role === UserRole.MODERATOR;
  const landingPadsQuery = trpc.landingPad.getAll.useQuery(undefined, {
    enabled: isModerator,
  });

  if (!isModerator) {
    return (
      <div className="flex min-h-full flex-col bg-background p-4 pt-0">
        <PageHeader title="Akceptacja lądowisk" />
        <main className="flex-1 p-4">
          <p className="text-sm text-muted-foreground">Ta podstrona jest dostępna tylko dla moderatora.</p>
        </main>
      </div>
    );
  }

  if (selectedPad) {
    return (
      <LandingPadDetailsView
        pad={selectedPad}
        onBack={() => setSelectedPad(null)}
        onSaveSuccess={(updatedPad) => {
          setSelectedPad(updatedPad);
          landingPadsQuery.refetch();
        }}
        onStatusSuccess={() => {
          setSelectedPad(null);
          landingPadsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <PageHeader title="Zgłoszone punkty" />
      <main className="flex-1 p-4">
        {landingPadsQuery.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <ApprovalsList
            landingPads={landingPadsQuery.data ?? []}
            onSelect={setSelectedPad}
          />
        )}
      </main>
    </div>
  );
}
