'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/trpc/client';
import { OrderStatus, UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { CopyIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';

const activeStatuses = new Set<OrderStatus>([
  OrderStatus.ORDERED,
  OrderStatus.PREPARING,
  OrderStatus.IN_TRANSIT,
]);

const packageSizeBadgeClasses = {
  Mała: 'border-slate-200 bg-slate-100 text-slate-700',
  Średnia: 'border-blue-200 bg-blue-100 text-blue-700',
  Duża: 'border-amber-200 bg-amber-100 text-amber-700',
} as const;

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

async function copyTrackingNumber(trackingNumber: string) {
  try {
    await navigator.clipboard.writeText(trackingNumber);
    toast.success('Numer śledzenia skopiowany');
  } catch {
    toast.error('Nie udało się skopiować numeru śledzenia');
  }
}

export default function UserOrdersPage() {
  const { data: session } = useSession();
  const isUser = session?.user?.role === UserRole.USER;

  const myOrdersQuery = trpc.userOrder.getMine.useQuery(undefined, {
    enabled: isUser,
  });

  const activeOrders = useMemo(
    () => myOrdersQuery.data?.filter((order) => activeStatuses.has(order.status)) ?? [],
    [myOrdersQuery.data],
  );
  const deliveredOrders = useMemo(
    () => myOrdersQuery.data?.filter((order) => order.status === OrderStatus.DELIVERED) ?? [],
    [myOrdersQuery.data],
  );

  const renderOrderCard = (order: (typeof activeOrders)[number]) => {
    const isDelivered = order.status === OrderStatus.DELIVERED;

    return (
      <Card key={order.orderId} className='gap-0'>
        <CardHeader className="flex flex-row items-start justify-between border-b">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              {isDelivered ? 'Dostarczone' : 'W trakcie'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{order.packageName}</p>
          </div>
          <Badge variant="outline" className={packageSizeBadgeClasses[order.packageSize]}>
            {order.packageSize}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Nazwa paczki</p>
            <p className="text-sm font-medium">{order.packageName}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Numer śledzenia</p>
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-sm">{order.trackingNumber}</p>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => void copyTrackingNumber(order.trackingNumber)}
                aria-label="Kopiuj numer śledzenia"
              >
                <CopyIcon size={16} className="text-blue-600" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              {isDelivered ? 'Czas dostawy' : 'Przewidywany czas dostawy'}
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm">{formatDateTime(order.deliveryAt)}</p>
              {order.etaMinutes !== null && (
                <p className="text-xs text-green-600">za {order.etaMinutes} min</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Moje zamówienia" />
      <main className="flex-1 space-y-4 px-4 pb-6">
        {!isUser && (
          <p className="text-sm text-muted-foreground">Ta podstrona jest dostępna tylko dla zwykłego użytkownika.</p>
        )}

        {isUser && (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
              <TabsTrigger value="active" className="data-active:bg-primary data-active:text-primary-foreground">
                Aktywne
              </TabsTrigger>
              <TabsTrigger value="delivered" className="data-active:bg-primary data-active:text-primary-foreground">
                Dostarczone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak aktywnych zamówień.</p>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map(renderOrderCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="delivered" className="space-y-4">
              {deliveredOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak dostarczonych zamówień.</p>
              ) : (
                <div className="space-y-4">
                  {deliveredOrders.map(renderOrderCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
