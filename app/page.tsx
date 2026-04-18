'use client';

import { roleDefaultPaths } from '@/lib/appAccess';
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
      router.replace('/auth/signin');
      return;
    }

    if (session.user.role in roleDefaultPaths) {
      router.replace(roleDefaultPaths[session.user.role]);
      return;
    }

    router.replace(roleDefaultPaths[UserRole.USER]);
  }, [session, status, router]);

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="text-lg text-muted-foreground">Ładowanie...</div>
    </div>
  );
}