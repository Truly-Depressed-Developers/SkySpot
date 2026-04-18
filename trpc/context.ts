import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export const createContext = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { authorized: false as const, user: null };
  }

  return {
    authorized: true as const,
    user: {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
    },
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
