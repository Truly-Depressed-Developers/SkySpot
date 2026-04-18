'use client';

import { navItemsConfig } from '@/lib/appAccess';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  MapTrifoldIcon,
  UserIcon,
  MapPinIcon,
  PackageIcon,
  ShieldCheckIcon,
  GearIcon
} from '@phosphor-icons/react';
import { useNavbar } from '@/hooks/useNavbar';

const navIconsByHref: Record<string, React.ReactNode> = {
  '/map': <MapTrifoldIcon size={24} weight="fill" />,
  '/user/spots': <MapPinIcon size={24} weight="fill" />,
  '/user/orders': <PackageIcon size={24} weight="fill" />,
  '/company/orders': <PackageIcon size={24} weight="fill" />,
  '/company/settings': <GearIcon size={24} weight="fill" />,
  '/moderator/approvals': <ShieldCheckIcon size={24} weight="fill" />,
  '/profile': <UserIcon size={24} weight="fill" />,
};

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isVisible } = useNavbar();

  const isActive = (href: string) => {
    if (href === '/' && pathname !== '/') return false;
    return pathname.startsWith(href);
  };

  if (!isVisible) {
    return null;
  }

  const filteredNavItems = navItemsConfig.filter((item) => {
    if (!session?.user?.role) {
      return false;
    }
    return item.roles.includes(session.user.role);
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="flex justify-around items-end">
        {filteredNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors ${active ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {navIconsByHref[item.href]}
              <span className="text-[10px] text-center leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
