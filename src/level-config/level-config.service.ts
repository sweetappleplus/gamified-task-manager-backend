import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateLevelConfigDto,
  LevelConfigResponseDto,
  UpdateLevelConfigDto,
} from './dto/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { API_STATUSES, LOG_LEVELS } from '../shared/consts/index.js';
import { log } from '../shared/utils/index.js';

@Injectable()
export class LevelConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDto: CreateLevelConfigDto,
  ): Promise<ApiResponse<LevelConfigResponseDto>> {
    const existing = await this.prisma.levelConfig.findUnique({
      where: { level: createDto.level },
    });

    if (existing) {
      throw new ConflictException(
        `Level config with level "${createDto.level}" already exists`,
      );
    }

    try {
      const levelConfig = await this.prisma.levelConfig.create({
        data: {
          level: createDto.level,
          xpRequired: createDto.xpRequired,
          earningMultiplier: createDto.earningMultiplier,
          unlockedTaskTypes: createDto.unlockedTaskTypes,
        },
      });

      log({
        message: `Level config created: level ${levelConfig.level}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Level config created successfully',
        data: levelConfig,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error creating level config: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async findAll(): Promise<ApiResponse<LevelConfigResponseDto[]>> {
    const levels = await this.prisma.levelConfig.findMany({
      orderBy: { level: 'asc' },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Level configs retrieved successfully',
      data: levels,
      timestamp: new Date().toISOString(),
    };
  }

  async findOne(level: number): Promise<ApiResponse<LevelConfigResponseDto>> {
    const levelConfig = await this.prisma.levelConfig.findUnique({
      where: { level },
    });

    if (!levelConfig) {
      throw new NotFoundException(
        `Level config with level "${level}" is not found`,
      );
    }

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Level config retrieved successfully',
      data: levelConfig,
      timestamp: new Date().toISOString(),
    };
  }

  async update(
    level: number,
    updateDto: UpdateLevelConfigDto,
  ): Promise<ApiResponse<LevelConfigResponseDto>> {
    const existing = await this.prisma.levelConfig.findUnique({
      where: { level },
    });

    if (!existing) {
      throw new NotFoundException(
        `Level config with level "${level}" is not found`,
      );
    }

    try {
      const updated = await this.prisma.levelConfig.update({
        where: { level },
        data: {
          xpRequired:
            typeof updateDto.xpRequired === 'undefined'
              ? existing.xpRequired
              : updateDto.xpRequired,
          earningMultiplier:
            typeof updateDto.earningMultiplier === 'undefined'
              ? existing.earningMultiplier
              : updateDto.earningMultiplier,
          unlockedTaskTypes:
            typeof updateDto.unlockedTaskTypes === 'undefined'
              ? existing.unlockedTaskTypes
              : updateDto.unlockedTaskTypes,
        },
      });

      log({
        message: `Level config updated: level ${updated.level}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Level config updated successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error updating level config: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async remove(level: number): Promise<ApiResponse<void>> {
    const existing = await this.prisma.levelConfig.findUnique({
      where: { level },
    });

    if (!existing) {
      throw new NotFoundException(
        `Level config with level "${level}" is not found`,
      );
    }

    try {
      await this.prisma.levelConfig.delete({
        where: { level },
      });
    } catch (error) {
      log({
        message: `Error deleting level config: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }

    log({
      message: `Level config deleted: level ${existing.level}`,
      level: LOG_LEVELS.INFO,
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Level config deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
