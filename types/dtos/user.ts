import type { User, UserRole } from '@prisma/client';

export type UserDTO = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};

export const mapUserToDTO = (user: User): UserDTO => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
});
