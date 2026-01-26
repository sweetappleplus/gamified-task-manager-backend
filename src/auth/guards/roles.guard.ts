import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, TUserRole } from '../../types/index.js';
import { LOG_LEVELS, ROLES_KEY } from '../../consts/index.js';
import { log } from '../../utils/index.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<TUserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      log({
        message:
          'Somebody was trying to access a restricted endpoint without being authenticated',
        level: LOG_LEVELS.WARNING,
      });
      throw new UnauthorizedException('Unauthorized access');
    }

    // SUPER_ADMIN can access all roles
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Check if user has required role
    const hasRole = requiredRoles.includes(user.role as TUserRole);

    if (!hasRole) {
      log({
        message:
          'Somebody was trying to access a restricted endpoint without having the required role',
        level: LOG_LEVELS.WARNING,
      });
      throw new ForbiddenException('Forbidden access');
    }

    return true;
  }
}
