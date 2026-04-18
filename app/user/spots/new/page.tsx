'use client';

import { PageHeader } from '@/components/PageHeader';
import { trpc } from '@/trpc/client';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';

export default function NewSpotPage() {
  const { data: session } = useSession();
  const isUser = session?.user?.role === UserRole.USER;
  const landingPadsQuery = trpc.landingPad.getAll.useQuery(undefined, {
    enabled: isUser,
  });

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Dodaj lądowisko" />
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {!isUser && (
          <p className="mb-6 text-sm text-muted-foreground">Ta podstrona jest dostępna tylko dla zwykłego użytkownika.</p>
        )}

        {isUser && (
          <p className="mb-6 text-muted-foreground">Liczba obecnych lądowisk: {landingPadsQuery.data?.length ?? 0}</p>
        )}

        <div className="space-y-4 opacity-50">
          <div className="h-10 bg-muted rounded animate-pulse" />
          <div className="h-40 bg-muted rounded animate-pulse" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </div>
      </main>
    </div>
  );
}
