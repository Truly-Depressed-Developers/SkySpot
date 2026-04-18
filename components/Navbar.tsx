'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapTrifoldIcon,
  NoteIcon,
  ChatCircleDotsIcon,
  UserIcon,
  HeartIcon,
  HouseIcon
} from '@phosphor-icons/react';
import { useNavbar } from '@/hooks/useNavbar';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: <HouseIcon size={32} weight="fill" />,
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: <UserIcon size={32} weight="fill" />,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { isVisible } = useNavbar();

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden">
      <div className="flex justify-around gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-w-fit flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors ${
                active ? 'text-primary' : 'text-ring hover:text-foreground'
              }`}
            >
              {item.icon}
              <span className=" ">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
