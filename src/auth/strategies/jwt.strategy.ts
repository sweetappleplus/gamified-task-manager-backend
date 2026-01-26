import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { JwtPayload } from '../jwt.service.js';
import { JWT_SECRET, LOG_LEVELS } from '../../consts/index.js';
import { log } from '../../utils/index.js';

if (!JWT_SECRET) {
  log({
    message: 'JWT_SECRET is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new Error('JWT_SECRET is not set in the environment variables');
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET as string,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || !user.isActive) {
      log({
        message: `User not found or inactive: ${payload.id}`,
        level: LOG_LEVELS.DEBUG,
      });
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
