'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/trpc/client';
import { LandingPadStatus, OrderStatus, UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Clock3,
  Gauge,
  LayoutDashboard,
  MapPin,
  Package,
  Route,
  Truck,
  Users,
  XCircle,
} from 'lucide-react';

type DashboardTileProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  className?: string;
};

type DashboardTileLayout = DashboardTileProps & {
  mobileClassName?: string;
};

function DashboardTile({ title, value, icon, className }: DashboardTileProps) {
  return (
    <Card className={cn('rounded-3xl border bg-card shadow-xs', className)}>
      <CardContent className="flex h-full flex-col gap-2 px-4  md:p-5">
        <p className="wrap-break-word text-sm font-medium text-muted-foreground sm:text-sm">{title}</p>
        <div className="mt-auto flex items-end justify-between gap-3">
          <p className="wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">{value}</p>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary md:size-12">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function addMobileFullWidthForLastTile(tiles: DashboardTileLayout[]) {
  let filledColumns = 0;

  return tiles.map((tile, index) => {
    const isLastTile = index === tiles.length - 1;
    const isFullWidthOnMobile = tile.className?.includes('col-span-2') ?? false;
    const tileColumns = isFullWidthOnMobile ? 2 : 1;
    const nextFilledColumns = filledColumns + tileColumns;

    if (isLastTile && filledColumns === 0 && tileColumns === 1) {
      return {
        ...tile,
        mobileClassName: 'col-span-2',
      };
    }

    filledColumns = nextFilledColumns % 2;

    return tile;
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pl-PL').format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isSignedIn = Boolean(role);

  const landingPadsQuery = trpc.landingPad.getAll.useQuery(undefined, {
    enabled: isSignedIn,
  });
  const userOrdersQuery = trpc.userOrder.getMine.useQuery(undefined, {
    enabled: role === UserRole.USER,
  });
  const waitingOrdersQuery = trpc.providerOrder.getWaitingToBeTaken.useQuery(undefined, {
    enabled: role === UserRole.DRONE_PROVIDER,
  });
  const acceptedOrdersQuery = trpc.providerOrder.getAccepted.useQuery(undefined, {
    enabled: role === UserRole.DRONE_PROVIDER,
  });
  const deliveriesQuery = trpc.delivery.getAll.useQuery(undefined, {
    enabled: role === UserRole.DRONE_PROVIDER,
  });
  const droneStatusesQuery = trpc.droneStatus.getAllMine.useQuery(undefined, {
    enabled: role === UserRole.DRONE_PROVIDER,
  });

  const landingPads = landingPadsQuery.data ?? [];
  const userOrders = userOrdersQuery.data ?? [];
  const waitingOrders = waitingOrdersQuery.data ?? [];
  const acceptedOrders = acceptedOrdersQuery.data ?? [];
  const deliveries = deliveriesQuery.data ?? [];
  const droneStatuses = droneStatusesQuery.data ?? [];

  const userLandingPads = useMemo(
    () => landingPads.filter((landingPad) => landingPad.ownerId === session?.user.id),
    [landingPads, session?.user.id],
  );

  const title = session ? `Cześć, ${session.user.firstName}` : 'Dashboard';

  const activeUserOrders = userOrders.filter((order) => order.status !== OrderStatus.DELIVERED);
  const nextEta = activeUserOrders.length
    ? Math.min(...activeUserOrders.map((order) => order.etaMinutes ?? Number.POSITIVE_INFINITY))
    : Number.POSITIVE_INFINITY;

  const userTiles = [
    {
      title: 'Odebrane przesyłki',
      value: formatNumber(userOrders.filter((order) => order.status === OrderStatus.DELIVERED).length),
      icon: <CheckCircle2 className="size-6" />,
    },
    {
      title: 'W drodze',
      value: formatNumber(userOrders.filter((order) => order.status === OrderStatus.IN_TRANSIT).length),
      icon: <Truck className="size-6" />,
    },
    {
      title: 'W przygotowaniu',
      value: formatNumber(userOrders.filter((order) => order.status === OrderStatus.PREPARING).length),
      icon: <Package className="size-6" />,
    },
    {
      title: 'Oczekujące',
      value: formatNumber(userOrders.filter((order) => order.status === OrderStatus.ORDERED).length),
      icon: <Clock3 className="size-6" />,
    },
    {
      title: 'Następna przesyłka',
      value: Number.isFinite(nextEta) ? `za ${nextEta} min` : 'Brak',
      icon: <Route className="size-6" />,
      className: 'col-span-2 md:col-span-2 lg:col-span-2',
    },
    {
      title: 'Twoje zgłoszenia',
      value: formatNumber(userLandingPads.length),
      icon: <MapPin className="size-6" />,
    },
    {
      title: 'Zaakceptowane lądowiska',
      value: formatNumber(userLandingPads.filter((landingPad) => landingPad.status === LandingPadStatus.ACCEPTED).length),
      icon: <CheckCircle2 className="size-6" />,
    },
    {
      title: 'Odrzucone lądowiska',
      value: formatNumber(userLandingPads.filter((landingPad) => landingPad.status === LandingPadStatus.REJECTED).length),
      icon: <XCircle className="size-6" />,
    },
  ];

  const providerTiles = [
    {
      title: 'Drony łącznie',
      value: formatNumber(new Set(droneStatuses.map((droneStatus) => droneStatus.droneId)).size),
      icon: <Users className="size-6" />,
    },
    {
      title: 'Aktualnie dostarczających',
      value: formatNumber(droneStatuses.length),
      icon: <Truck className="size-6" />,
    },
    {
      title: 'Zamówienia do wzięcia',
      value: formatNumber(waitingOrders.length),
      icon: <Clock3 className="size-6" />,
    },
    {
      title: 'Przyjęte zlecenia',
      value: formatNumber(acceptedOrders.length),
      icon: <Package className="size-6" />,
    },
    {
      title: 'Zakończone dostawy',
      value: formatNumber(acceptedOrders.filter((order) => order.status === OrderStatus.DELIVERED).length),
      icon: <CheckCircle2 className="size-6" />,
      className: 'col-span-2 md:col-span-2 lg:col-span-2',
    },
    {
      title: 'Średnia bateria',
      value: droneStatuses.length
        ? formatPercent(droneStatuses.reduce((sum, droneStatus) => sum + droneStatus.batteryLevel, 0) / droneStatuses.length)
        : 'Brak danych',
      icon: <Gauge className="size-6" />,
    },
    {
      title: 'Dostawy zrealizowane',
      value: formatNumber(deliveries.length),
      icon: <Route className="size-6" />,
    },
  ];

  const moderatorTiles = [
    {
      title: 'Oczekujące lądowiska',
      value: formatNumber(landingPads.filter((landingPad) => landingPad.status === LandingPadStatus.WAITING_FOR_REVIEW).length),
      icon: <Clock3 className="size-6" />,
    },
    {
      title: 'Zaakceptowane lądowiska',
      value: formatNumber(landingPads.filter((landingPad) => landingPad.status === LandingPadStatus.ACCEPTED).length),
      icon: <CheckCircle2 className="size-6" />,
    },
    {
      title: 'Łącznie w systemie',
      value: formatNumber(landingPads.length),
      icon: <LayoutDashboard className="size-6" />,
      className: 'col-span-2 md:col-span-2 lg:col-span-2',
    },
    {
      title: 'Odrzucone lądowiska',
      value: formatNumber(landingPads.filter((landingPad) => landingPad.status === LandingPadStatus.REJECTED).length),
      icon: <XCircle className="size-6" />,
    },
  ];

  const tiles =
    role === UserRole.USER ? userTiles : role === UserRole.DRONE_PROVIDER ? providerTiles : moderatorTiles;
  const tilesWithMobileSpan = addMobileFullWidthForLastTile(tiles);

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Dashboard" />
      <main className="flex-1 space-y-6 px-0 pb-6">
        {!session && <p className="text-sm text-muted-foreground">Ładowanie danych dashboardu...</p>}

        {session && (
          <section className="px-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                  Szybki podgląd najważniejszych danych zależnie od Twojej roli w systemie.
                </p>
              </div>
            </div>
          </section>
        )}

        {session && (
          <section className="grid grid-cols-2 gap-3 sm:gap-4">
            {tilesWithMobileSpan.map((tile) => (
              <DashboardTile
                key={tile.title}
                title={tile.title}
                value={tile.value}
                icon={tile.icon}
                className={cn(tile.className, tile.mobileClassName)}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}