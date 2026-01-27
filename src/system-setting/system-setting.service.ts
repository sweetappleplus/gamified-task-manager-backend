import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateSystemSettingDto,
  SystemSettingResponseDto,
  UpdateSystemSettingDto,
} from './dto/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { API_STATUSES, LOG_LEVELS } from '../shared/consts/index.js';
import { log } from '../shared/utils/index.js';

@Injectable()
export class SystemSettingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDto: CreateSystemSettingDto,
  ): Promise<ApiResponse<SystemSettingResponseDto>> {
    const existing = await this.prisma.systemSetting.findUnique({
      where: { key: createDto.key },
    });

    if (existing) {
      throw new ConflictException(
        `System setting with key "${createDto.key}" already exists`,
      );
    }

    try {
      const setting = await this.prisma.systemSetting.create({
        data: {
          key: createDto.key,
          value: createDto.value,
          description: createDto.description,
        },
      });

      log({
        message: `System setting created: ${setting.key}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'System setting created successfully',
        data: setting,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error creating system setting: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async findAll(): Promise<ApiResponse<SystemSettingResponseDto[]>> {
    const settings = await this.prisma.systemSetting.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'System settings retrieved successfully',
      data: settings,
      timestamp: new Date().toISOString(),
    };
  }

  async findOne(key: string): Promise<ApiResponse<SystemSettingResponseDto>> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(
        `System setting with key "${key}" is not found`,
      );
    }

    return {
      status: API_STATUSES.SUCCESS,
      message: 'System setting retrieved successfully',
      data: setting,
      timestamp: new Date().toISOString(),
    };
  }

  async update(
    key: string,
    updateDto: UpdateSystemSettingDto,
  ): Promise<ApiResponse<SystemSettingResponseDto>> {
    const existing = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!existing) {
      throw new NotFoundException(
        `System setting with key "${key}" is not found`,
      );
    }

    try {
      const updated = await this.prisma.systemSetting.update({
        where: { key },
        data: {
          value:
            typeof updateDto.value === 'undefined'
              ? existing.value
              : updateDto.value,
          description:
            typeof updateDto.description === 'undefined'
              ? existing.description
              : updateDto.description,
        },
      });

      log({
        message: `System setting updated: ${updated.key}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'System setting updated successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error updating system setting: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async remove(key: string): Promise<ApiResponse<void>> {
    const existing = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!existing) {
      throw new NotFoundException(
        `System setting with key "${key}" is not found`,
      );
    }

    try {
      await this.prisma.systemSetting.delete({
        where: { key },
      });
    } catch (error) {
      log({
        message: `Error deleting system setting: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }

    log({
      message: `System setting deleted: ${existing.key}`,
      level: LOG_LEVELS.INFO,
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'System setting deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
