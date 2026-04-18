import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';
import { getServerSession } from 'next-auth';

export const createContext = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { authorized: false as const, user: null };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return { authorized: false as const, user: null };
  }

  return {
    authorized: true as const,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
