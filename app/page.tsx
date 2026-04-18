'use client';

import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.replace('/guest');
      return;
    }

    if (session.user.role === UserRole.DRONE_PROVIDER) {
      router.replace('/company/orders');
      return;
    }

    if (session.user.role === UserRole.MODERATOR) {
      router.replace('/moderator/approvals');
      return;
    }

    router.replace('/map');
  }, [session, status, router]);

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="text-lg text-muted-foreground">Ładowanie...</div>
    </div>
  );
}