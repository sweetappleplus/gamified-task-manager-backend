import { UserRole } from '../../generated/prisma/enums.js';

export const USER_ROLES = {
  WORKER: 'WORKER',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export interface CurrentUserData {
  userId: string;
  email: string;
  role: UserRole;
}
