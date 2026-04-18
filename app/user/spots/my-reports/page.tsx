'use client';

import { PageHeader } from '@/components/PageHeader';
import { trpc } from '@/trpc/client';
import { LandingPadStatus, UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';

const landingPadStatusLabels: Record<LandingPadStatus, string> = {
  [LandingPadStatus.WAITING_FOR_REVIEW]: 'Oczekuje na weryfikację',
  [LandingPadStatus.ACCEPTED]: 'Zaakceptowane',
  [LandingPadStatus.REJECTED]: 'Odrzucone',
};

export default function MyReportsPage() {
  const { data: session } = useSession();
  const isUser = session?.user?.role === UserRole.USER;
  const landingPadsQuery = trpc.landingPad.getAll.useQuery(undefined, {
    enabled: isUser,
  });

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Moje zgłoszenia" />
      <main className="flex-1 p-4 space-y-4">
        {!isUser && (
          <p className="text-sm text-muted-foreground">Ta podstrona jest dostępna tylko dla zwykłego użytkownika.</p>
        )}

        {isUser && (
          <section className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Liczba zgłoszonych punktów: {landingPadsQuery.data?.length ?? 0}
            </p>

            <ul className="space-y-3">
              {landingPadsQuery.data?.map((landingPad) => (
                <li key={landingPad.id} className="rounded-lg border p-4 text-sm">
                  <p className="font-medium">{landingPad.name}</p>
                  <p className="text-muted-foreground">Status: {landingPadStatusLabels[landingPad.status]}</p>
                  <p className="text-muted-foreground">Opis: {landingPad.description}</p>
                </li>
              ))}
            </ul>

            {!landingPadsQuery.data?.length && (
              <p className="text-sm text-muted-foreground">Brak zgłoszeń do wyświetlenia.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
