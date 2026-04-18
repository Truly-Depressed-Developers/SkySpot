'use client';

import { PageHeader } from '@/components/PageHeader';
import { SettingsItem } from '@/components/settings/SettingsItem';
import {
  PlusCircleIcon,
  ListBulletsIcon
} from '@phosphor-icons/react';

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
  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Lądowiska" />

      <main className="flex-1 p-4 flex flex-col gap-2">
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
