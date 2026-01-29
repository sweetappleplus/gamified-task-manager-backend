import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  REFRESH_TOKEN_EXPIRY_DAYS,
  ACCESS_TOKEN_EXPIRY_MINUTES,
  LOG_LEVELS,
} from '../shared/consts/index.js';
import { log } from '../shared/utils/index.js';
import {
  JwtPayload,
  RefreshTokenResult,
  TokenPair,
} from '../shared/types/index.js';
import { UserRole } from '../generated/prisma/enums.js';

if (!REFRESH_TOKEN_EXPIRY_DAYS) {
  log({
    message:
      'REFRESH_TOKEN_EXPIRY_DAYS is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'REFRESH_TOKEN_EXPIRY_DAYS is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!ACCESS_TOKEN_EXPIRY_MINUTES) {
  log({
    message:
      'ACCESS_TOKEN_EXPIRY_MINUTES is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'ACCESS_TOKEN_EXPIRY_MINUTES is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

@Injectable()
export class AuthJwtService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async generateAccessToken(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<string> {
    const payload: JwtPayload = {
      id: userId,
      email,
      role,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: `${Number(ACCESS_TOKEN_EXPIRY_MINUTES)}m`,
    });
  }

  async generateRefreshToken(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(REFRESH_TOKEN_EXPIRY_DAYS));

    try {
      await this.prisma.refreshToken.create({
        data: {
          userId,
          tokenHash,
          deviceInfo,
          ipAddress,
          expiresAt,
        },
      });
    } catch (error) {
      log({
        message: `Error creating refresh token: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }

    return token;
  }

  async generateTokenPair(
    userId: string,
    email: string,
    role: UserRole,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email, role),
      this.generateRefreshToken(userId, deviceInfo, ipAddress),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<RefreshTokenResult> {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    type RefreshTokenWithUser = (typeof tokens)[number];

    let matchedToken: RefreshTokenWithUser | null = null;
    for (const token of tokens) {
      const isValid = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isValid) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const token = matchedToken;

    try {
      await this.prisma.refreshToken.update({
        where: { id: token.id },
        data: {
          isRevoked: true,
          lastUsedAt: new Date(),
        },
      });
    } catch (error) {
      log({
        message: `Error revoking refresh token: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }

    const tokenPair = await this.generateTokenPair(
      token.userId,
      token.user.email,
      token.user.role,
      token.deviceInfo ?? undefined,
      token.ipAddress ?? undefined,
    );

    return {
      ...tokenPair,
      userId: token.userId,
      email: token.user.email,
      role: token.user.role,
    };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    for (const token of tokens) {
      const isValid = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isValid) {
        try {
          await this.prisma.refreshToken.update({
            where: { id: token.id },
            data: { isRevoked: true },
          });
          return;
        } catch (error) {
          log({
            message: `Error revoking refresh token: ${
              error instanceof Error ? error.message : String(error)
            }`,
            level: LOG_LEVELS.ERROR,
          });
          throw new InternalServerErrorException((error as Error).message);
        }
      }
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      });
    } catch (error) {
      log({
        message: `Error revoking all user tokens: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
        },
      });
    } catch (error) {
      log({
        message: `Error cleaning up expired tokens: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }
}
