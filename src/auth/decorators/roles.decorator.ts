import { SetMetadata } from '@nestjs/common';
import { TUserRole } from '../../shared/types/index.js';
import { ROLES_KEY } from '../../shared/consts/index.js';

export const Roles = (...roles: TUserRole[]) => SetMetadata(ROLES_KEY, roles);
