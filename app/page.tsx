'use client';

import { baseConfig } from '@/lib/baseConfig';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    router.replace(baseConfig.accountDefaultSites[baseConfig.accountType]);
  }, [session, status, router]);

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="text-lg text-muted-foreground">Ładowanie...</div>
    </div>
  );
}