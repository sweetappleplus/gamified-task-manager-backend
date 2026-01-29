import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  UpdateUserProfileDto,
  UserResponseDto,
  GetUsersQueryDto,
  DeactivateUserDto,
} from './dto/index.js';
import { API_STATUSES, LOG_LEVELS } from '../shared/consts/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { log } from '../shared/utils/index.js';
import { UserRole } from '../generated/prisma/enums.js';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    query: GetUsersQueryDto,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    try {
      const where = {
        ...(query.role && { role: query.role }),
        ...(query.isActive !== undefined && { isActive: query.isActive }),
        ...(query.search && {
          OR: [
            { email: { contains: query.search, mode: 'insensitive' as const } },
            { name: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }),
      };

      const users = await this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Users retrieved successfully',
        data: users,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error retrieving users: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async findOne(userId: string): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" is not found`);
    }

    return {
      status: API_STATUSES.SUCCESS,
      message: 'User retrieved successfully',
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  async updateProfile(
    userId: string,
    updateDto: UpdateUserProfileDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" is not found`);
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: updateDto.name,
        },
      });

      log({
        message: `User profile updated: ${updated.email}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Profile updated successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error updating user profile: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async uploadAvatar(
    userId: string,
    avatarUrl: string,
  ): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" is not found`);
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          avatarUrl,
        },
      });

      log({
        message: `User avatar uploaded: ${updated.email}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Avatar uploaded successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error uploading avatar: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async deactivateUser(
    adminId: string,
    targetUserId: string,
    deactivateDto: DeactivateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException(
        `User with id "${targetUserId}" is not found`,
      );
    }

    if (targetUser.role !== UserRole.WORKER) {
      throw new ForbiddenException('Only workers can be deactivated');
    }

    if (adminId === targetUserId) {
      throw new BadRequestException('You cannot deactivate yourself');
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id: targetUserId },
        data: {
          isActive: deactivateDto.isActive,
        },
      });

      log({
        message: `User ${deactivateDto.isActive ? 'activated' : 'deactivated'}: ${updated.email} by admin ${adminId}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: `User ${deactivateDto.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error deactivating user: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }
}
