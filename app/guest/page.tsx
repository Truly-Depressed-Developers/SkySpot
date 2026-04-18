'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useNavbar } from '@/hooks/useNavbar';
import { useEffect } from 'react';

export default function GuestPage() {
  const { setIsVisible } = useNavbar();

  useEffect(() => {
    setIsVisible(false);
    return () => setIsVisible(true);
  }, [setIsVisible]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Hacknarök</h1>
        <p className="text-lg text-muted-foreground">Zaloguj się, aby kontynuować</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/auth/signin">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Zaloguj się
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button size="lg" className="w-full sm:w-auto">
            Zarejestruj się
          </Button>
        </Link>
      </div>
    </div>
  );
}
