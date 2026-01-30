import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LOG_LEVELS, ROLES_KEY } from '../../shared/consts/index.js';
import { log } from '../../shared/utils/index.js';
import { UserRole } from '../../generated/prisma/enums.js';
import { RequestWithUserGuard } from '../../shared/types/user.types.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUserGuard>();
    const user = request.user;

    if (!user) {
      log({
        message:
          'Somebody was trying to access a restricted endpoint without being authenticated',
        level: LOG_LEVELS.WARNING,
      });
      throw new UnauthorizedException('Access is unauthorized');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      log({
        message:
          'Somebody was trying to access a restricted endpoint without having the required role',
        level: LOG_LEVELS.WARNING,
      });
      throw new ForbiddenException('Access is forbidden');
    }

    return true;
  }
}
