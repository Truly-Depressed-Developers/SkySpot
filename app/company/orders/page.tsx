'use client';

import { PageHeader } from '@/components/PageHeader';
import { trpc } from '@/trpc/client';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';

export default function CompanyOrdersPage() {
  const { data: session } = useSession();
  const isProvider = session?.user?.role === UserRole.DRONE_PROVIDER;

  const waitingOrdersQuery = trpc.providerOrder.getWaitingToBeTaken.useQuery(undefined, {
    enabled: isProvider,
  });
  const acceptedOrdersQuery = trpc.providerOrder.getAccepted.useQuery(undefined, {
    enabled: isProvider,
  });
  const myDeliveriesQuery = trpc.delivery.getAll.useQuery(undefined, {
    enabled: isProvider,
  });
  const myDroneStatusesQuery = trpc.droneStatus.getAllMine.useQuery(undefined, {
    enabled: isProvider,
  });

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Zlecenia firmy" />
      <main className="flex-1 p-4 space-y-4">
        {!isProvider && (
          <p className="text-sm text-muted-foreground">Ta podstrona jest dostępna tylko dla providera dronów.</p>
        )}

        {isProvider && (
          <>
            <section className="rounded-lg border p-4">
              <h2 className="font-semibold">Zlecenia oczekujące</h2>
              <p className="text-sm text-muted-foreground">Do wzięcia: {waitingOrdersQuery.data?.length ?? 0}</p>
            </section>

            <section className="rounded-lg border p-4">
              <h2 className="font-semibold">Zlecenia przyjęte przeze mnie</h2>
              <p className="text-sm text-muted-foreground">Liczba przyjętych: {acceptedOrdersQuery.data?.length ?? 0}</p>
            </section>

            <section className="rounded-lg border p-4">
              <h2 className="font-semibold">Moje dostawy i drony</h2>
              <p className="text-sm text-muted-foreground">Dostawy: {myDeliveriesQuery.data?.length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Statusy dronów: {myDroneStatusesQuery.data?.length ?? 0}</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
