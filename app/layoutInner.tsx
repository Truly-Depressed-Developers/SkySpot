'use client';

import { Navbar } from '@/components/Navbar';
import { useNavbar } from '@/hooks/useNavbar';
import { cn } from '@/lib/utils';

export function LayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isVisible } = useNavbar();

  return (
    <div className={cn('grid h-screen', isVisible ? 'grid-rows-[1fr_84px]' : 'grid-rows-[1fr]')}>
      <main className="overflow-y-auto relative">{children}</main>
      <Navbar />
    </div>
  );
}
