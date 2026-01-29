import { Decimal } from '@prisma/client/runtime/client';
import { UserRole } from '../../generated/prisma/enums.js';

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string | null;
  avatarUrl!: string | null;
  role!: UserRole;
  isActive!: boolean;
  lastLoginAt!: Date | null;
  earning!: Decimal;
  balance!: Decimal;
  createdAt!: Date;
  updatedAt!: Date;
}
