import {
  Injectable,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  OTP_EXPIRATION_TIME_MINUTES,
  OTP_ATTEMPTS_MIN_DURATION_MINUTES,
  LOG_LEVELS,
} from '../shared/consts/index.js';
import { log } from '../shared/utils/index.js';

if (!OTP_EXPIRATION_TIME_MINUTES) {
  log({
    message:
      'OTP_EXPIRATION_TIME_MINUTES is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'OTP_EXPIRATION_TIME_MINUTES is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!OTP_ATTEMPTS_MIN_DURATION_MINUTES) {
  log({
    message:
      'OTP_ATTEMPTS_MIN_DURATION_MINUTES is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'OTP_ATTEMPTS_MIN_DURATION_MINUTES is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = Number(OTP_EXPIRATION_TIME_MINUTES);
  private readonly MIN_DURATION_MINUTES = Number(
    OTP_ATTEMPTS_MIN_DURATION_MINUTES,
  );

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private async hashOtp(otp: string): Promise<string> {
    return bcrypt.hash(otp, 10);
  }

  private async verifyOtpHash(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
  }

  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    await this.emailService.sendOTPEmail(email, otp);
  }

  async generateAndSendOtp(email: string, userId?: string): Promise<void> {
    const minDurationAgo = new Date();
    minDurationAgo.setMinutes(
      minDurationAgo.getMinutes() - this.MIN_DURATION_MINUTES,
    );

    const recentOtp = await this.prisma.otp.findFirst({
      where: {
        email,
        createdAt: {
          gte: minDurationAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (recentOtp) {
      const timeSinceLastAttemptMs =
        new Date().getTime() - recentOtp.createdAt.getTime();
      const timeSinceLastAttemptMinutes = timeSinceLastAttemptMs / 1000 / 60;
      const remainingMinutes = Math.ceil(
        this.MIN_DURATION_MINUTES - timeSinceLastAttemptMinutes,
      );

      log({
        message: `${email} user made too many OTP requests`,
        level: LOG_LEVELS.WARNING,
      });

      throw new HttpException(
        `Please wait ${remainingMinutes + 1} minutes${remainingMinutes + 1 !== 1 ? 's' : ''} before requesting a new OTP.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    try {
      await this.prisma.otp.updateMany({
        where: {
          email,
          isUsed: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        data: {
          isUsed: true,
        },
      });
    } catch (error) {
      log({
        message: `Error invalidating existing unused OTPs: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }

    const otp = this.generateOtp();
    const otpHash = await this.hashOtp(otp);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    try {
      await this.prisma.otp.create({
        data: {
          email,
          userId: userId || null,
          otpHash,
          expiresAt,
        },
      });
    } catch (error) {
      log({
        message: `Error storing OTP in database: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }

    await this.sendOtpEmail(email, otp);
  }

  async verifyOtpCode(
    email: string,
    otp: string,
  ): Promise<{ isValid: boolean; userId?: string }> {
    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        email,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return { isValid: false };
    }

    const isValid = await this.verifyOtpHash(otp, otpRecord.otpHash);

    if (!isValid) {
      return { isValid: false };
    }

    try {
      await this.prisma.otp.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
    } catch (error) {
      log({
        message: `Error marking OTP as used: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }

    return { isValid: true, userId: otpRecord.userId || undefined };
  }

  async cleanupExpiredOtps(): Promise<void> {
    try {
      await this.prisma.otp.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { isUsed: true }],
        },
      });
    } catch (error) {
      log({
        message: `Error cleaning up expired OTPs: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }
}
