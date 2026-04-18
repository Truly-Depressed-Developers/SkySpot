'use client';

import { SettingsItem } from '@/components/settings/SettingsItem';
import {
  GearIcon,
  SunIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
import { PageHeader } from '@/components/PageHeader';

export default function ProfilePage() {
  const { data: session } = useSession();

  const settingsOptions = [
    {
      label: 'Motyw aplikacji',
      icon: SunIcon,
      href: '/profile/theme',
    },
    {
      label: 'Ustawienia konta',
      icon: GearIcon,
      href: '/profile/settings',
    },
  ];

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <PageHeader title="Mój Profil" />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-16">
        <div className="flex flex-col gap-2">
          {settingsOptions.map((option, index) => (
            <SettingsItem key={index} icon={option.icon} label={option.label} href={option.href} />
          ))}
        </div>

        {session && (
          <div className="flex items-center gap-2 justify-center flex-col">
            Zalogowany użytkownik:
            <span className="text-sm text-muted-foreground">
              {session.user.firstName} {session.user.lastName}
            </span>
            <Button variant="destructive" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
              Logout
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
