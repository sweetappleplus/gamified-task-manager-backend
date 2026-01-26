import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import {
  OTP_EXPIRATION_TIME_MINUTES,
  OTP_ATTEMPTS_MIN_DURATION_MINUTES,
  LOG_LEVELS,
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
} from '../consts/index.js';
import { log } from '../utils/index.js';

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

if (!SMTP_FROM) {
  log({
    message: 'SMTP_FROM is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'SMTP_FROM is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!SMTP_HOST) {
  log({
    message: 'SMTP_HOST is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'SMTP_HOST is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!SMTP_PORT) {
  log({
    message: 'SMTP_PORT is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'SMTP_PORT is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!SMTP_USER) {
  log({
    message: 'SMTP_USER is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'SMTP_USER is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!SMTP_PASS) {
  log({
    message: 'SMTP_PASS is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'SMTP_PASS is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

@Injectable()
export class OtpService {
  private transporter: nodemailer.Transporter;
  private readonly OTP_EXPIRY_MINUTES = Number(OTP_EXPIRATION_TIME_MINUTES);
  private readonly MIN_DURATION_MINUTES = Number(
    OTP_ATTEMPTS_MIN_DURATION_MINUTES,
  );

  constructor(private prisma: PrismaService) {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  /**
   * Generate a random 6-digit OTP
   */
  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Hash OTP for secure storage
   */
  private async hashOtp(otp: string): Promise<string> {
    return bcrypt.hash(otp, 10);
  }

  /**
   * Verify OTP against hash
   */
  private async verifyOtpHash(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
  }

  /**
   * Send OTP email
   */
  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your OTP Code</h2>
          <p>Your OTP code is: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>
          <p>This code will expire in ${this.OTP_EXPIRY_MINUTES} minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      log({
        message: `${email} user received an OTP email`,
        level: LOG_LEVELS.SUCCESS,
      });
    } catch (error) {
      log({
        message: `${email} user failed to receive an OTP email: ${error instanceof Error ? error.message : String(error)}`,
        level: LOG_LEVELS.ERROR,
      });
      throw new HttpException(
        'Failed to send OTP email. Please try again later or contact support.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate and send OTP
   */
  async generateAndSendOtp(email: string, userId?: string): Promise<void> {
    // Check if there's a recent OTP attempt within the minimum duration
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

    // Invalidate any existing unused OTPs for this email
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

    // Generate new OTP
    const otp = this.generateOtp();
    const otpHash = await this.hashOtp(otp);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    // Store OTP in database
    await this.prisma.otp.create({
      data: {
        email,
        userId: userId || null,
        otpHash,
        expiresAt,
      },
    });

    // Send OTP via email
    await this.sendOtpEmail(email, otp);
  }

  /**
   * Verify OTP code
   */
  async verifyOtpCode(
    email: string,
    otp: string,
  ): Promise<{ isValid: boolean; userId?: string }> {
    // Find the most recent unused OTP for this email
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

    // Verify OTP
    const isValid = await this.verifyOtpHash(otp, otpRecord.otpHash);

    if (!isValid) {
      return { isValid: false };
    }

    // Mark OTP as used
    await this.prisma.otp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    return { isValid: true, userId: otpRecord.userId || undefined };
  }

  /**
   * Clean up expired OTPs (can be called by a cron job)
   */
  async cleanupExpiredOtps(): Promise<void> {
    await this.prisma.otp.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isUsed: true }],
      },
    });
  }
}
