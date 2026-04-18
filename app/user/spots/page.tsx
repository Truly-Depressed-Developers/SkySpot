'use client';

import { PageHeader } from '@/components/PageHeader';
import { SettingsItem } from '@/components/settings/SettingsItem';
import { trpc } from '@/trpc/client';
import {
  PlusCircleIcon,
  ListBulletsIcon
} from '@phosphor-icons/react';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';

const navigationItems = [
  {
    label: 'Dodaj lądowisko',
    icon: PlusCircleIcon,
    href: '/user/spots/new',
  },
  {
    label: 'Moje zgłoszenia',
    icon: ListBulletsIcon,
    href: '/user/spots/my-reports',
  },
];

export default function SpotsPage() {
  const { data: session } = useSession();
  const isUser = session?.user?.role === UserRole.USER;
  const landingPadsQuery = trpc.landingPad.getAll.useQuery(undefined, {
    enabled: isUser,
  });

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Lądowiska" />

      <main className="flex-1 p-4 flex flex-col gap-4">
        {!isUser && (
          <p className="text-sm text-muted-foreground">Ta podstrona jest dostępna tylko dla zwykłego użytkownika.</p>
        )}

        {isUser && (
          <section className="rounded-lg border p-4">
            <h2 className="font-semibold">Podgląd danych</h2>
            <p className="text-sm text-muted-foreground">Liczba lądowisk w systemie: {landingPadsQuery.data?.length ?? 0}</p>
          </section>
        )}

        {navigationItems.map((item, index) => (
          <SettingsItem
            key={index}
            icon={item.icon}
            label={item.label}
            href={item.href}
          />
        ))}
      </main>
    </div>
  );
}
