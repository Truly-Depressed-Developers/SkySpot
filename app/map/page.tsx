'use client';

import { PageHeader } from '@/components/PageHeader';
import { trpc } from '@/trpc/client';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MapPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role;

  useEffect(() => {
    if (role === UserRole.MODERATOR) {
      router.replace('/moderator/approvals');
    }
  }, [role, router]);

  const canUseMap = role === UserRole.USER || role === UserRole.DRONE_PROVIDER;

  const landingPadsQuery = trpc.landingPad.getAll.useQuery(undefined, {
    enabled: canUseMap,
  });
  const userOrdersQuery = trpc.userOrder.getMine.useQuery(undefined, {
    enabled: role === UserRole.USER,
  });
  const userDeliveriesQuery = trpc.delivery.getAll.useQuery(undefined, {
    enabled: role === UserRole.USER,
  });
  const providerWaitingQuery = trpc.providerOrder.getWaitingToBeTaken.useQuery(undefined, {
    enabled: role === UserRole.DRONE_PROVIDER,
  });
  const providerAcceptedQuery = trpc.providerOrder.getAccepted.useQuery(undefined, {
    enabled: role === UserRole.DRONE_PROVIDER,
  });
  const providerDroneStatusesQuery = trpc.droneStatus.getAllMine.useQuery(undefined, {
    enabled: role === UserRole.DRONE_PROVIDER,
  });

  if (role === UserRole.MODERATOR) {
    return (
      <div className="flex min-h-full flex-col bg-background p-4 pt-0">
        <PageHeader title="Mapa lądowisk" />
        <main className="flex-1 mt-4 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Moderator nie ma dostępu do mapy. Trwa przekierowanie...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Mapa lądowisk" />
      <main className="flex-1 mt-4 space-y-4">
        <section className="rounded-lg border p-4">
          <h2 className="font-semibold">Wersja mapy</h2>
          <p className="text-sm text-muted-foreground">Rola: {role ?? 'brak roli'}</p>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="font-semibold">Lądowiska</h2>
          {landingPadsQuery.isLoading && <p className="text-sm text-muted-foreground">Ładowanie lądowisk...</p>}
          {!landingPadsQuery.isLoading && (landingPadsQuery.data?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">Brak lądowisk do wyświetlenia.</p>
          )}
          <ul className="mt-2 text-sm space-y-1">
            {(landingPadsQuery.data ?? []).map((landingPad) => (
              <li key={landingPad.id}>
                {landingPad.name} | {landingPad.type} | {landingPad.status} | {landingPad.coords.latitude},{' '}
                {landingPad.coords.longitude}
              </li>
            ))}
          </ul>
        </section>

        {role === UserRole.USER && (
          <section className="rounded-lg border p-4 space-y-1">
            <h2 className="font-semibold">Mapa użytkownika</h2>
            <p className="text-sm text-muted-foreground">Moje zamówienia:</p>
            <ul className="text-sm space-y-1">
              {(userOrdersQuery.data ?? []).map((order) => (
                <li key={order.orderId}>
                  {order.orderId} | {order.status} | {order.type} | {order.description}
                </li>
              ))}
            </ul>

            <p className="pt-2 text-sm text-muted-foreground">Moje dostawy:</p>
            <ul className="text-sm space-y-1">
              {(userDeliveriesQuery.data ?? []).map((delivery) => (
                <li key={delivery.id}>
                  {delivery.id} | {delivery.droneId} | od {delivery.reservedFrom.toLocaleString()} do{' '}
                  {delivery.reservedTo.toLocaleString()}
                </li>
              ))}
            </ul>
          </section>
        )}

        {role === UserRole.DRONE_PROVIDER && (
          <section className="rounded-lg border p-4 space-y-1">
            <h2 className="font-semibold">Mapa providera</h2>
            <p className="text-sm text-muted-foreground">Zlecenia do wzięcia:</p>
            <ul className="text-sm space-y-1">
              {(providerWaitingQuery.data ?? []).map((order) => (
                <li key={order.orderId}>
                  {order.orderId} | {order.status} | {order.type} | {order.description}
                </li>
              ))}
            </ul>

            <p className="pt-2 text-sm text-muted-foreground">Zlecenia przyjęte:</p>
            <ul className="text-sm space-y-1">
              {(providerAcceptedQuery.data ?? []).map((order) => (
                <li key={order.orderId}>
                  {order.orderId} | {order.status} | {order.type} | {order.description}
                </li>
              ))}
            </ul>

            <p className="pt-2 text-sm text-muted-foreground">Statusy moich dronów:</p>
            <ul className="text-sm space-y-1">
              {(providerDroneStatusesQuery.data ?? []).map((droneStatus) => (
                <li key={droneStatus.droneId}>
                  {droneStatus.droneId} | bateria {droneStatus.batteryLevel}% | pozycja{' '}
                  {droneStatus.currentPosition.latitude}, {droneStatus.currentPosition.longitude}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
