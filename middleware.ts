import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { canAccessPath, isPublicPath, isUserRole } from '@/lib/appAccess';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        if (isPublicPath(pathname)) {
          return true;
        }

        if (!token) {
          return false;
        }

        if (!isUserRole(token.role)) {
          return false;
        }

        return canAccessPath(pathname, token.role);
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  },
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
