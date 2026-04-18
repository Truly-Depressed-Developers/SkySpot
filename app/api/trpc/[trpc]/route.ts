import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc/appRouter';
import { createContext } from '@/trpc/context';

function handler(req: Request) {
  return fetchRequestHandler({
    req,
    endpoint: '/api/trpc',
    router: appRouter,
    createContext: createContext,
  });
}

export { handler as GET, handler as POST };
