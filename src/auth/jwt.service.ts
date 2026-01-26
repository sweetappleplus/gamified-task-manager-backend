import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  REFRESH_TOKEN_EXPIRY_DAYS,
  ACCESS_TOKEN_EXPIRY_MINUTES,
  LOG_LEVELS,
} from '../consts/index.js';
import { log } from '../utils/index.js';

if (!REFRESH_TOKEN_EXPIRY_DAYS) {
  log({
    message:
      'REFRESH_TOKEN_EXPIRY_DAYS is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
}

if (!ACCESS_TOKEN_EXPIRY_MINUTES) {
  log({
    message:
      'ACCESS_TOKEN_EXPIRY_MINUTES is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResult extends TokenPair {
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthJwtService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /**
   * Generate access token
   */
  async generateAccessToken(
    userId: string,
    email: string,
    role: string,
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

  /**
   * Generate refresh token and store in database
   */
  async generateRefreshToken(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<string> {
    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(REFRESH_TOKEN_EXPIRY_DAYS));

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        deviceInfo,
        ipAddress,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Generate both access and refresh tokens
   */
  async generateTokenPair(
    userId: string,
    email: string,
    role: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email, role),
      this.generateRefreshToken(userId, deviceInfo, ipAddress),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Verify refresh token and return new token pair with user info
   */
  async refreshTokens(refreshToken: string): Promise<RefreshTokenResult> {
    // Find all non-revoked refresh tokens for the user
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

    // Try to match the provided token
    let matchedToken: any = null;
    for (const token of tokens) {
      const isValid = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isValid) {
        matchedToken = token as any;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const token = matchedToken;

    // Revoke the old token
    await this.prisma.refreshToken.update({
      where: { id: token.id },
      data: {
        isRevoked: true,
        lastUsedAt: new Date(),
      },
    });

    // Generate new token pair
    const tokenPair = await this.generateTokenPair(
      token.userId,
      token.user.email,
      token.user.role,
      token.deviceInfo || undefined,
      token.ipAddress || undefined,
    );

    return {
      ...tokenPair,
      userId: token.userId,
      email: token.user.email,
      role: token.user.role,
    };
  }

  /**
   * Revoke a refresh token
   */
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
        await this.prisma.refreshToken.update({
          where: { id: token.id },
          data: { isRevoked: true },
        });
        return;
      }
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  /**
   * Clean up expired refresh tokens (can be called by a cron job)
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    });
  }
}
