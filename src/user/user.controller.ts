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

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: GetUsersQueryDto,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    return this.userService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.userService.findOne(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<UserResponseDto>> {
    return this.userService.findOne(id);
  }

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
