import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {
  SendOtpDto,
  VerifyOtpDto,
  RefreshTokenDto,
  AuthResponseDto,
} from './dto/index.js';
import { Public, Roles, CurrentUser } from './decorators/index.js';
import { JwtAuthGuard, RolesGuard } from './guards/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { API_STATUSES } from '../shared/consts/index.js';
import { UserRole } from '../generated/prisma/enums.js';
import type { CurrentUserData } from '../shared/types/user.types.js';

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<ApiResponse<void>> {
    return this.authService.sendOtp(sendOtpDto.email);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-forwarded-for') ipAddress?: string,
  ): Promise<ApiResponse<AuthResponseDto>> {
    const authResponse = await this.authService.verifyOtp(
      verifyOtpDto.email,
      verifyOtpDto.otp,
      userAgent,
      ipAddress,
    );
    return {
      status: API_STATUSES.SUCCESS,
      message: 'OTP verified successfully',
      data: authResponse,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ApiResponse<AuthResponseDto>> {
    const authResponse = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
    );
    return {
      status: API_STATUSES.SUCCESS,
      message: 'Token refreshed successfully',
      data: authResponse,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ApiResponse<void>> {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Post('impersonate')
  @HttpCode(HttpStatus.OK)
  async impersonate(
    @Body('userId') userId: string,
    @CurrentUser() admin: CurrentUserData,
    @Headers('user-agent') userAgent?: string,
    @Headers('x-forwarded-for') ipAddress?: string,
  ): Promise<ApiResponse<AuthResponseDto>> {
    const authResponse = await this.authService.impersonate(
      admin.userId,
      userId,
      userAgent,
      ipAddress,
    );
    return {
      status: API_STATUSES.SUCCESS,
      message: 'Impersonation successful',
      data: authResponse,
      timestamp: new Date().toISOString(),
    };
  }
}
