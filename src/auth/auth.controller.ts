import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {
  SendOtpDto,
  VerifyOtpDto,
  RefreshTokenDto,
  AuthResponseDto,
} from './dto/index.js';
import { Public } from './decorators/index.js';
import { ApiResponse } from '../types/index.js';
import { API_STATUSES } from '../consts/index.js';

@Controller('auth')
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

  @Public()
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
}
