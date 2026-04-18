import { User } from '@prisma/client';

export type UserRole = 'USER' | 'MODERATOR' | 'DRONE_PROVIDER';

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
  role: UserRole.USER, // TODO change when added to prisma schema
});
