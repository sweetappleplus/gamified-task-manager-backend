import { HttpException, HttpStatus, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { OtpService } from './otp.service.js';
import { AuthJwtService } from './jwt.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  JWT_SECRET,
  LOG_LEVELS,
  JWT_EXPIRATION_TIME_MINUTES,
} from '../shared/consts/index.js';
import { log } from '../shared/utils/index.js';

if (!JWT_SECRET) {
  log({
    message: 'JWT_SECRET is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'JWT_SECRET is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!JWT_EXPIRATION_TIME_MINUTES) {
  log({
    message:
      'JWT_EXPIRATION_TIME_MINUTES is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'JWT_EXPIRATION_TIME_MINUTES is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: `${Number(JWT_EXPIRATION_TIME_MINUTES)}m` },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    AuthJwtService,
    JwtStrategy,
    PrismaService,
  ],
  exports: [AuthService, AuthJwtService],
})
export class AuthModule {}
