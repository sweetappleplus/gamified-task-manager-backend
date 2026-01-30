import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDoc,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from './user.service.js';
import {
  UpdateUserProfileDto,
  UserResponseDto,
  GetUsersQueryDto,
  DeactivateUserDto,
} from './dto/index.js';
import { CurrentUser, Roles } from '../auth/decorators/index.js';
import { ApiResponse, type CurrentUserData } from '../shared/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { UserRole } from '../generated/prisma/enums.js';
import { AVATAR_MAX_SIZE_MB, LOG_LEVELS } from '../shared/consts/index.js';
import { log } from '../shared/utils/index.js';

if (!AVATAR_MAX_SIZE_MB) {
  log({
    message: 'AVATAR_MAX_SIZE_MB is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'AVATAR_MAX_SIZE_MB is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Get all users (Super Admin only)',
    description:
      'Retrieves a list of all users with optional filtering by role and active status',
  })
  @ApiResponseDoc({ status: 200, description: 'Users retrieved successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: GetUsersQueryDto,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    return this.userService.findAll(query);
  }

  @ApiOperation({
    summary: 'Get current user profile',
    description: "Retrieves the authenticated user's profile information",
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.userService.findOne(user.userId);
  }

  @ApiOperation({
    summary: 'Get user by ID (Super Admin only)',
    description: 'Retrieves detailed information about a specific user',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clxyz123456789abcdef',
  })
  @ApiResponseDoc({ status: 200, description: 'User retrieved successfully' })
  @ApiResponseDoc({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.userService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update user profile (Worker only)',
    description:
      "Updates the authenticated worker's profile information (name, payment methods, etc.)",
  })
  @ApiResponseDoc({ status: 200, description: 'Profile updated successfully' })
  @ApiResponseDoc({ status: 400, description: 'Invalid data' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.userService.updateProfile(user.userId, updateUserProfileDto);
  }

  @ApiOperation({
    summary: 'Upload user avatar (Worker only)',
    description:
      'Uploads a profile picture for the authenticated worker. Supported formats: JPG, JPEG, PNG, GIF, WEBP. Maximum file size configured in environment.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file',
        },
      },
    },
  })
  @ApiResponseDoc({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponseDoc({ status: 400, description: 'Invalid file type or size' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  @Patch('avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (_, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Number(AVATAR_MAX_SIZE_MB) * 1024 * 1024,
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<UserResponseDto>> {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.userService.uploadAvatar(user.userId, avatarUrl);
  }

  @ApiOperation({
    summary: 'Change user status (Super Admin only)',
    description:
      'Activate or deactivate a user account. Deactivated users cannot log in.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clxyz123456789abcdef',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'User status updated successfully',
  })
  @ApiResponseDoc({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async deactivateUser(
    @CurrentUser() admin: CurrentUserData,
    @Param('id') id: string,
    @Body() deactivateUserDto: DeactivateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.userService.deactivateUser(admin.userId, id, deactivateUserDto);
  }
}
