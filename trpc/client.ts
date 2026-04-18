'use client';

import type { QueryClient } from '@tanstack/react-query';
import { httpBatchLink, unstable_httpBatchStreamLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { AppRouter } from './appRouter';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
  })();
  return `${base}/api/trpc`;
}

export function getClientOptions() {
  return {
    links: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typeof window !== 'undefined' && (window as any).Cypress
        ? httpBatchLink({
            transformer: superjson,
            url: getUrl(),
            headers: () => {
              const headers = new Headers();
              headers.set('x-trpc-source', 'nextjs-react');
              return headers;
            },
          })
        : unstable_httpBatchStreamLink({
            transformer: superjson,
            url: getUrl(),
            headers: () => {
              const headers = new Headers();
              headers.set('x-trpc-source', 'nextjs-react');
              return headers;
            },
          }),
    ],
  };
}
