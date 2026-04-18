'use client';

import { PageHeader } from '@/components/PageHeader';
import { trpc } from '@/trpc/client';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';

export default function UserOrdersPage() {
  const { data: session } = useSession();
  const isUser = session?.user?.role === UserRole.USER;

  const myOrdersQuery = trpc.userOrder.getMine.useQuery(undefined, {
    enabled: isUser,
  });
  const myDeliveriesQuery = trpc.delivery.getAll.useQuery(undefined, {
    enabled: isUser,
  });

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Moje zamówienia" />
      <main className="flex-1 p-4 space-y-4">
        {!isUser && (
          <p className="text-sm text-muted-foreground">Ta podstrona jest dostępna tylko dla zwykłego użytkownika.</p>
        )}

        {isUser && (
          <>
            <section className="rounded-lg border p-4">
              <h2 className="font-semibold">Zamówienia</h2>
              <p className="text-sm text-muted-foreground">Liczba moich zamówień: {myOrdersQuery.data?.length ?? 0}</p>
              <ul className="mt-2 text-sm space-y-1">
                {(myOrdersQuery.data ?? []).slice(0, 10).map((order) => (
                  <li key={order.orderId}>
                    {order.orderId} | {order.status} | {order.type}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border p-4">
              <h2 className="font-semibold">Dostawy do mnie</h2>
              <p className="text-sm text-muted-foreground">Liczba moich dostaw: {myDeliveriesQuery.data?.length ?? 0}</p>
              <ul className="mt-2 text-sm space-y-1">
                {(myDeliveriesQuery.data ?? []).slice(0, 10).map((delivery) => (
                  <li key={delivery.id}>
                    {delivery.id} | {delivery.droneId} | {delivery.reservedFrom.toLocaleString()}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
