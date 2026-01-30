import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDecorator,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
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

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Send OTP code to email',
    description:
      'Sends a 6-digit OTP code to the provided email address for passwordless authentication. The OTP is valid for 10 minutes.',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: {
          type: 'string',
          example: 'OTP sent successfully. Please check your email.',
        },
        timestamp: { type: 'string', example: '2026-01-30T12:00:00.000Z' },
      },
    },
  })
  @ApiResponseDecorator({
    status: 400,
    description: 'Invalid email format',
  })
  @ApiResponseDecorator({
    status: 500,
    description: 'Failed to send email',
  })
  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<ApiResponse<void>> {
    return this.authService.sendOtp(sendOtpDto.email);
  }

  @ApiOperation({
    summary: 'Verify OTP and login',
    description:
      'Verifies the OTP code and returns JWT access and refresh tokens. If the user does not exist, a new account is automatically created. Workers trigger notifications to all super admins upon first login.',
  })
  @ApiHeader({
    name: 'user-agent',
    description: 'Client user agent string',
    required: false,
  })
  @ApiHeader({
    name: 'x-forwarded-for',
    description: 'Client IP address',
    required: false,
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'OTP verified successfully, returns authentication tokens',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'OTP verified successfully' },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'clxyz123456789abcdef' },
                email: { type: 'string', example: 'user@example.com' },
                name: { type: 'string', example: 'John Doe', nullable: true },
                role: { type: 'string', example: 'WORKER' },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2026-01-30T12:00:00.000Z' },
      },
    },
  })
  @ApiResponseDecorator({
    status: 401,
    description: 'Invalid or expired OTP code',
  })
  @ApiResponseDecorator({
    status: 401,
    description: 'User account is deactivated',
  })
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

  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates a new access token and refresh token using a valid refresh token. The old refresh token is revoked after successful refresh.',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Token refreshed successfully',
  })
  @ApiResponseDecorator({
    status: 401,
    description: 'Invalid or revoked refresh token',
  })
  @ApiResponseDecorator({
    status: 401,
    description: 'User account not found or deactivated',
  })
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

  @ApiOperation({
    summary: 'Logout user',
    description:
      'Revokes the refresh token to log out the user. Access tokens will continue to work until they expire (15 minutes).',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Logged out successfully',
  })
  @ApiResponseDecorator({
    status: 401,
    description: 'Invalid refresh token',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ApiResponse<void>> {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @ApiOperation({
    summary: 'Impersonate another user (Super Admin only)',
    description:
      'Allows a super admin to impersonate any user in the system. Generates JWT tokens for the target user. This action is logged for security audit purposes.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'user-agent',
    description: 'Client user agent string',
    required: false,
  })
  @ApiHeader({
    name: 'x-forwarded-for',
    description: 'Client IP address',
    required: false,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID of the user to impersonate',
          example: 'clxyz123456789abcdef',
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Impersonation successful, returns tokens for target user',
  })
  @ApiResponseDecorator({
    status: 401,
    description: 'Only super admins can impersonate users',
  })
  @ApiResponseDecorator({
    status: 401,
    description: 'Target user not found',
  })
  @ApiResponseDecorator({
    status: 401,
    description: 'Target user account is deactivated',
  })
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
