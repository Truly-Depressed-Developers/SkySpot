'use client';

import { useNavbar } from '@/hooks/useNavbar';

export function NavbarSpacer() {
  const { isVisible } = useNavbar();

  if (!isVisible) return null;

  return <div className="h-20 md:h-0" />;
}
