import { UserRole } from '@prisma/client';

export type NavItemConfig = {
  href: string;
  label: string;
  roles: UserRole[];
};

export const publicPaths = ['/guest', '/auth/signin', '/auth/register'] as const;

export const roleDefaultPaths: Record<UserRole, string> = {
  [UserRole.USER]: '/dashboard',
  [UserRole.DRONE_PROVIDER]: '/dashboard',
  [UserRole.MODERATOR]: '/dashboard',
};

export const routeAccessRules: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: '/dashboard', roles: [UserRole.USER, UserRole.DRONE_PROVIDER, UserRole.MODERATOR] },
  { prefix: '/user', roles: [UserRole.USER] },
  { prefix: '/company', roles: [UserRole.DRONE_PROVIDER] },
  { prefix: '/moderator', roles: [UserRole.MODERATOR] },
  { prefix: '/map', roles: [UserRole.USER, UserRole.DRONE_PROVIDER] },
];

export const navItemsConfig: NavItemConfig[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    roles: [UserRole.USER, UserRole.DRONE_PROVIDER, UserRole.MODERATOR],
  },
  { href: '/map', label: 'Mapa', roles: [UserRole.USER, UserRole.DRONE_PROVIDER] },
  { href: '/user/spots', label: 'Miejsca', roles: [UserRole.USER] },
  { href: '/user/orders', label: 'Paczki', roles: [UserRole.USER] },
  { href: '/company/drones', label: 'Drony', roles: [UserRole.DRONE_PROVIDER] },
  { href: '/company/orders', label: 'Zlecenia', roles: [UserRole.DRONE_PROVIDER] },
  { href: '/company/settings', label: 'API', roles: [UserRole.DRONE_PROVIDER] },
  { href: '/moderator/approvals', label: 'Akceptacja', roles: [UserRole.MODERATOR] },
  {
    href: '/profile',
    label: 'Profil',
    roles: [UserRole.USER, UserRole.DRONE_PROVIDER, UserRole.MODERATOR],
  },
];

export const isUserRole = (value: unknown): value is UserRole =>
  value === UserRole.USER || value === UserRole.DRONE_PROVIDER || value === UserRole.MODERATOR;

export const isPublicPath = (pathname: string): boolean =>
  publicPaths.some((path) => pathname.startsWith(path));

export const canAccessPath = (pathname: string, role: UserRole): boolean => {
  const rule = routeAccessRules.find((routeRule) => pathname.startsWith(routeRule.prefix));

  if (!rule) {
    return true;
  }

  return rule.roles.includes(role);
};
