import { SetMetadata } from '@nestjs/common';
import { TUserRole } from '../../types/index.js';
import { ROLES_KEY } from '../../consts/index.js';

export const Roles = (...roles: TUserRole[]) => SetMetadata(ROLES_KEY, roles);
