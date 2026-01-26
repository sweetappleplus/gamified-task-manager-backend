import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OtpService } from './otp.service.js';
import { AuthJwtService } from './jwt.service.js';
import { AuthResponseDto } from './dto/index.js';
import { ApiResponse } from '../types/index.js';
import { API_STATUSES, LOG_LEVELS } from '../consts/index.js';
import { log } from '../utils/index.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private jwtService: AuthJwtService,
  ) {}

  /**
   * Send OTP for login/registration
   */
  async sendOtp(email: string): Promise<ApiResponse<void>> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // If user exists, send OTP for login
    // If user doesn't exist, send OTP for registration (will create user after verification)
    await this.otpService.generateAndSendOtp(email, user?.id);

    return {
      status: API_STATUSES.SUCCESS,
      message: 'OTP sent successfully. Please check your email.',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verify OTP and login/register
   */
  async verifyOtp(
    email: string,
    otp: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    // Verify OTP
    const verification = await this.otpService.verifyOtpCode(email, otp);

    if (!verification.isValid) {
      log({
        message: `${email} user was trying to login with an invalid or expired OTP`,
        level: LOG_LEVELS.WARNING,
      });
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user with WORKER role by default
      user = await this.prisma.user.create({
        data: {
          email,
        },
      });
      log({
        message: `New user registered: ${email}`,
        level: LOG_LEVELS.INFO,
      });
    }

    // Check if user is active
    if (!user.isActive) {
      log({
        message: `${email} user was trying to login with a deactivated account`,
        level: LOG_LEVELS.WARNING,
      });
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } =
      await this.jwtService.generateTokenPair(
        user.id,
        user.email,
        user.role,
        deviceInfo,
        ipAddress,
      );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        role: user.role,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const result = await this.jwtService.refreshTokens(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { id: result.userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        role: user.role,
      },
    };
  }

  /**
   * Logout (revoke refresh token)
   */
  async logout(refreshToken: string): Promise<ApiResponse<void>> {
    await this.jwtService.revokeRefreshToken(refreshToken);
    return {
      status: API_STATUSES.SUCCESS,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
