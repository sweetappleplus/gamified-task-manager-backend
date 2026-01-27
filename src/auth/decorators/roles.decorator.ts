import { SetMetadata } from '@nestjs/common';
import { TUserRole } from '../../modules/types/index.js';
import { ROLES_KEY } from '../../modules/consts/index.js';

export const Roles = (...roles: TUserRole[]) => SetMetadata(ROLES_KEY, roles);
