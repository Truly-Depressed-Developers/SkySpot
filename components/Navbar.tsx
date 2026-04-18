'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapTrifoldIcon,
  UserIcon,
  MapPinIcon,
  PackageIcon,
  BuildingsIcon,
  ShieldCheckIcon,
  GearIcon
} from '@phosphor-icons/react';
import { useNavbar } from '@/hooks/useNavbar';
import { AccountType, baseConfig } from '@/lib/baseConfig';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: AccountType[];
};

const navItems: NavItem[] = [
  {
    href: '/map',
    label: 'Mapa',
    icon: <MapTrifoldIcon size={24} weight="fill" />,
    roles: ['user', 'company'],
  },
  {
    href: '/user/spots',
    label: 'Miejsca',
    icon: <MapPinIcon size={24} weight="fill" />,
    roles: ['user'],
  },
  {
    href: '/user/orders',
    label: 'Paczki',
    icon: <PackageIcon size={24} weight="fill" />,
    roles: ['user'],
  },
  {
    href: '/company/orders',
    label: 'Zlecenia',
    icon: <PackageIcon size={24} weight="fill" />,
    roles: ['company'],
  },
  {
    href: '/company/settings',
    label: 'API',
    icon: <GearIcon size={24} weight="fill" />,
    roles: ['company'],
  },
  {
    href: '/moderator/approvals',
    label: 'Akceptacja',
    icon: <ShieldCheckIcon size={24} weight="fill" />,
    roles: ['moderator'],
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: <UserIcon size={24} weight="fill" />,
    roles: ['user', 'company', 'moderator'],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { isVisible } = useNavbar();

  const isActive = (href: string) => {
    if (href === '/' && pathname !== '/') return false;
    return pathname.startsWith(href);
  };

  if (!isVisible) {
    return null;
  }

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(baseConfig.accountType)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden z-50">
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
              {item.icon}
              <span className="text-[10px] text-center leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
