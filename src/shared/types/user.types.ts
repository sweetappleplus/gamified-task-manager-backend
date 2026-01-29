import { UserRole } from '../../generated/prisma/enums.js';

export interface CurrentUserData {
  userId: string;
  email: string;
  role: UserRole;
}
