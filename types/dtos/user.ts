import { User } from '@prisma/client';

export type UserDTO = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export const mapUserToDTO = (user: User): UserDTO => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
});
