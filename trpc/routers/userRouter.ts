import { prisma } from '@/prisma/prisma';
import { protectedProcedure, publicProcedure, router } from '../init';
import z from 'zod';
import bcrypt from 'bcryptjs';

export const userRouter = router({
  register: publicProcedure
    .input(
      z
        .object({
          firstName: z.string().min(1, 'Imię jest wymagane'),
          lastName: z.string().min(1, 'Nazwisko jest wymagane'),
          email: z.email('Wpisz prawidłowy adres email'),
          password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: 'Hasła nie pasują do siebie',
          path: ['confirmPassword'],
        }),
    )
    .mutation(async ({ input }) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error('Użytkownik z tym adresem email już istnieje');
      }

      const hashed = await bcrypt.hash(input.password, 10);

      const user = await prisma.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          password: hashed,
        },
      });

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
      });

      if (!user) {
        throw new Error('Użytkownik nie znaleziony');
      }

      const isPasswordValid = await bcrypt.compare(input.currentPassword, user.password);

      if (!isPasswordValid) {
        throw new Error('Obecne hasło jest nieprawidłowe');
      }

      const hashed = await bcrypt.hash(input.newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashed,
        },
      });

      return { success: true };
    }),
});
