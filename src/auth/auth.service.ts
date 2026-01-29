import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OtpService } from './otp.service.js';
import { AuthJwtService } from './jwt.service.js';
import { EmailService } from '../email/email.service.js';
import { AuthResponseDto } from './dto/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { API_STATUSES, LOG_LEVELS } from '../shared/consts/index.js';
import { log } from '../shared/utils/index.js';
import { UserRole, NotificationType } from '../generated/prisma/enums.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private jwtService: AuthJwtService,
    private emailService: EmailService,
  ) {}

  async sendOtp(email: string): Promise<ApiResponse<void>> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    await this.otpService.generateAndSendOtp(email, user?.id);

    return {
      status: API_STATUSES.SUCCESS,
      message: 'OTP sent successfully. Please check your email.',
      timestamp: new Date().toISOString(),
    };
  }

  async verifyOtp(
    email: string,
    otp: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const verification = await this.otpService.verifyOtpCode(email, otp);

    if (!verification.isValid) {
      log({
        message: `${email} user was trying to login with an invalid or expired OTP`,
        level: LOG_LEVELS.WARNING,
      });
      throw new UnauthorizedException('OTP code is invalid or expired');
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      try {
        user = await this.prisma.user.create({
          data: {
            email,
          },
        });
        log({
          message: `New user registered: ${email}`,
          level: LOG_LEVELS.INFO,
        });

        await this.emailService.sendWelcomeEmail(email, user.name || 'User');

        if (user.role === UserRole.WORKER) {
          const admins = await this.prisma.user.findMany({
            where: { role: UserRole.SUPER_ADMIN },
          });

          for (const admin of admins) {
            await this.emailService.sendWorkerJoinedEmail(
              admin.email,
              admin.name || 'Admin',
              email,
            );

            await this.prisma.notification.create({
              data: {
                userId: admin.id,
                type: NotificationType.WORKER_JOINED,
                title: 'New Worker Joined',
                message: `A new worker has joined: ${email}`,
              },
            });
          }
        }
      } catch (error) {
        log({
          message: `Error creating user: ${
            error instanceof Error ? error.message : String(error)
          }`,
          level: LOG_LEVELS.ERROR,
        });
        throw new InternalServerErrorException((error as Error).message);
      }
    }

    if (!user.isActive) {
      log({
        message: `${email} user was trying to login with a deactivated account`,
        level: LOG_LEVELS.WARNING,
      });
      throw new UnauthorizedException('User account is deactivated');
    }

    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
        },
      });
    } catch (error) {
      log({
        message: `Error updating last login: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }

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

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const result = await this.jwtService.refreshTokens(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { id: result.userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'User account is not found or deactivated',
      );
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

  async logout(refreshToken: string): Promise<ApiResponse<void>> {
    await this.jwtService.revokeRefreshToken(refreshToken);
    return {
      status: API_STATUSES.SUCCESS,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    };
  }

  async impersonate(
    adminId: string,
    targetUserId: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== UserRole.SUPER_ADMIN) {
      throw new UnauthorizedException(
        'Only super admins can impersonate users',
      );
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new UnauthorizedException(
        `User with id "${targetUserId}" not found`,
      );
    }

    if (!targetUser.isActive) {
      throw new UnauthorizedException('Target user account is deactivated');
    }

    log({
      message: `Admin ${admin.email} (${adminId}) impersonating user ${targetUser.email} (${targetUserId})`,
      level: LOG_LEVELS.WARNING,
    });

    const { accessToken, refreshToken } =
      await this.jwtService.generateTokenPair(
        targetUser.id,
        targetUser.email,
        targetUser.role,
        deviceInfo,
        ipAddress,
      );

    return {
      accessToken,
      refreshToken,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name || undefined,
        role: targetUser.role,
      },
    };
  }
}
