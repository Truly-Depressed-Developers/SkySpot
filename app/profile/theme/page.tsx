'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { DesktopIcon, MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';

export default function ThemePage() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-full flex-col bg-background p-4 pt-0">
      <PageHeader title="Motyw aplikacji" />

      <main className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            className="px-5 flex h-16 w-full items-center justify-start gap-4 text-lg"
            onClick={() => setTheme('light')}
          >
            <SunIcon size={36} />
            Jasny
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            className="px-5 flex h-16 w-full items-center justify-start gap-4 text-lg"
            onClick={() => setTheme('dark')}
          >
            <MoonIcon size={36} />
            Ciemny
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            className="px-5 flex h-16 w-full items-center justify-start gap-4 text-lg"
            onClick={() => setTheme('system')}
          >
            <DesktopIcon size={36} />
            Systemowy
          </Button>
        </div>
      </main>
    </div>
  );
}
