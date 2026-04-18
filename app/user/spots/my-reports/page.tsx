'use client';

import { PageHeader } from '@/components/PageHeader';
import { trpc } from '@/trpc/client';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';

export default function MyReportsPage() {
  const { data: session } = useSession();
  const isUser = session?.user?.role === UserRole.USER;
  const myOrdersQuery = trpc.userOrder.getMine.useQuery(undefined, {
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
          <section className="rounded-lg border p-4">
            <h2 className="font-semibold">Podgląd danych użytkownika</h2>
            <p className="text-sm text-muted-foreground">Liczba moich zamówień: {myOrdersQuery.data?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Docelowo tutaj trafią zgłoszenia lądowisk użytkownika po dodaniu dedykowanego endpointu.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
