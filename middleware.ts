import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        const publicPaths = ['/guest', '/auth/signin', '/auth/register'];

        if (publicPaths.some((path) => pathname.startsWith(path))) {
          return true;
        }

        if (!token) {
          return false;
        }

        const role = token.role;

        if (pathname.startsWith('/user')) {
          return role === UserRole.USER;
        }

        if (pathname.startsWith('/company')) {
          return role === UserRole.DRONE_PROVIDER;
        }

        if (pathname.startsWith('/moderator')) {
          return role === UserRole.MODERATOR;
        }

        if (pathname.startsWith('/map')) {
          return role === UserRole.USER || role === UserRole.DRONE_PROVIDER;
        }

        return true;
      },
    },
    pages: {
      signIn: '/guest',
    },
  },
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
