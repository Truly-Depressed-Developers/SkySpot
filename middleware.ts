import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

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

        return !!token;
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
