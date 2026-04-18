'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CaretLeftIcon } from '@phosphor-icons/react';

import { LandingPadDetailsDialog } from '../../../../components/landing-pad/LandingPadDetailsDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/trpc/client';
import { LandingPadStatus, UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';

const landingPadStatusLabels: Record<LandingPadStatus, string> = {
  [LandingPadStatus.WAITING_FOR_REVIEW]: 'Oczekujące',
  [LandingPadStatus.ACCEPTED]: 'Zaakceptowane',
  [LandingPadStatus.REJECTED]: 'Odrzucone',
};

const landingPadStatusBadgeClasses: Record<LandingPadStatus, string> = {
  [LandingPadStatus.WAITING_FOR_REVIEW]: 'border-yellow-200 bg-yellow-100 text-yellow-700',
  [LandingPadStatus.REJECTED]: 'border-red-200 bg-red-100 text-red-700',
  [LandingPadStatus.ACCEPTED]: 'border-green-200 bg-green-100 text-green-700',
};

const availabilityLabels = {
  PRIVATE: 'Prywatny, dostępny tylko dla Ciebie',
  PUBLIC: 'Publiczny, dostępny dla wszystkich użytkowników',
} as const;

export default function MyReportsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isUser = session?.user?.role === UserRole.USER;
  const landingPadsQuery = trpc.landingPad.getAll.useQuery(undefined, {
    enabled: isUser,
  });

  const waitingLandingPads =
    landingPadsQuery.data?.filter((landingPad) => landingPad.status === LandingPadStatus.WAITING_FOR_REVIEW) ?? [];
  const rejectedLandingPads =
    landingPadsQuery.data?.filter((landingPad) => landingPad.status === LandingPadStatus.REJECTED) ?? [];
  const acceptedLandingPads =
    landingPadsQuery.data?.filter((landingPad) => landingPad.status === LandingPadStatus.ACCEPTED) ?? [];

  const renderLandingPads = (
    landingPads: typeof waitingLandingPads,
    emptyMessage: string,
  ) => {
    if (landingPads.length === 0) {
      return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
    }

    return (
      <div className="space-y-4">
        {landingPads.map((landingPad) => (
          <Card key={landingPad.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="font-semibold">{landingPad.name}</CardTitle>
              <Badge variant="outline" className={landingPadStatusBadgeClasses[landingPad.status]}>
                {landingPadStatusLabels[landingPad.status]}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Opis punktu</p>
                <p className="text-sm">{landingPad.description}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Dostęp do punktu</p>
                <p className="text-sm">{availabilityLabels[landingPad.availability]}</p>
              </div>
            </CardContent>

            <CardFooter>
              <LandingPadDetailsDialog landingPad={landingPad} />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <header className="flex items-center justify-between px-4 py-3">
        <Button type="button" size="icon-sm" variant="ghost" onClick={() => router.back()} aria-label="Wróć">
          <CaretLeftIcon size={20} />
        </Button>

        <p className="text-base font-semibold">Zgłoszone punkty</p>

        <Button variant="ghost" asChild>
          <Link href="/user/spots/new" className="text-primary">
            Dodaj
          </Link>
        </Button>
      </header>

      <main className="flex-1 space-y-4 px-4 pb-6">
        {!isUser && (
          <p className="text-sm text-muted-foreground">Ta podstrona jest dostępna tylko dla zwykłego użytkownika.</p>
        )}

        {isUser && (
          <Tabs defaultValue="WAITING_FOR_REVIEW" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted p-1">
              <TabsTrigger
                value="WAITING_FOR_REVIEW"
                className="data-active:bg-primary data-active:text-primary-foreground"
              >
                Oczekujące
              </TabsTrigger>
              <TabsTrigger
                value="REJECTED"
                className="data-active:bg-primary data-active:text-primary-foreground"
              >
                Odrzucone
              </TabsTrigger>
              <TabsTrigger
                value="ACCEPTED"
                className="data-active:bg-primary data-active:text-primary-foreground"
              >
                Zaakceptowane
              </TabsTrigger>
            </TabsList>

            <TabsContent value="WAITING_FOR_REVIEW" className="space-y-4">
              {renderLandingPads(waitingLandingPads, 'Brak oczekujących zgłoszeń.')}
            </TabsContent>

            <TabsContent value="REJECTED" className="space-y-4">
              {renderLandingPads(rejectedLandingPads, 'Brak odrzuconych zgłoszeń.')}
            </TabsContent>

            <TabsContent value="ACCEPTED" className="space-y-4">
              {renderLandingPads(acceptedLandingPads, 'Brak zaakceptowanych zgłoszeń.')}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
