import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../generated/prisma/enums.js';
import { ROLES_KEY } from '../../shared/consts/index.js';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
