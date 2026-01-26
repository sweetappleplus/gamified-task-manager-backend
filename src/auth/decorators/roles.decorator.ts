import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../types/index.js';
import { ROLES_KEY } from '../../consts/index.js';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
