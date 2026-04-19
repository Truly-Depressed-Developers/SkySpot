"use client"

import Link from 'next/link';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { PasswordForm } from '@/components/settings/PasswordForm';

export default function SettingsPage() {
  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <header className="sticky top-0 z-10 shrink-0 bg-background/80 backdrop-blur-sm p-4 text-center h-20 flex items-center justify-center border-b">
        <Button asChild variant="ghost" size="icon" className="absolute left-4 size-12 rounded-full" aria-label="Wróć">
          <Link href="/profile">
            <ArrowLeftIcon size={28} />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Ustawienia konta</h1>
      </header>

      <main className="flex-1 p-4">
        <PasswordForm />
      </main>
    </div>
  );
}
