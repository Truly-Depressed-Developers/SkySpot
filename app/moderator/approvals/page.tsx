'use client';

import { PageHeader } from '@/components/PageHeader';
import { trpc } from '@/trpc/client';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';

export default function ModeratorApprovalsPage() {
  const { data: session } = useSession();
  const isModerator = session?.user?.role === UserRole.MODERATOR;
  const landingPadsQuery = trpc.landingPad.getAll.useQuery(undefined, {
    enabled: isModerator,
  });

  const pendingLandingPads =
    landingPadsQuery.data?.filter((landingPad) => landingPad.status === 'WAITING_FOR_REVIEW') ?? [];

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Akceptacja lądowisk" />
      <main className="flex-1 p-4 space-y-4">
        {!isModerator && (
          <p className="text-sm text-muted-foreground">Ta podstrona jest dostępna tylko dla moderatora.</p>
        )}

        {isModerator && (
          <section className="rounded-lg border p-4">
            <h2 className="font-semibold">Kolejka zgłoszeń</h2>
            <p className="text-sm text-muted-foreground">Do akceptacji: {pendingLandingPads.length}</p>
            <ul className="mt-2 text-sm space-y-1">
              {pendingLandingPads.slice(0, 20).map((landingPad) => (
                <li key={landingPad.id}>
                  {landingPad.id} | {landingPad.name}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
