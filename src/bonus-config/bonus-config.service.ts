import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateBonusConfigDto,
  BonusConfigResponseDto,
  UpdateBonusConfigDto,
} from './dto/index.js';
import { ApiResponse, type TaskType } from '../types/index.js';
import { API_STATUSES, LOG_LEVELS } from '../consts/index.js';
import { log } from '../utils/index.js';

@Injectable()
export class BonusConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDto: CreateBonusConfigDto,
  ): Promise<ApiResponse<BonusConfigResponseDto>> {
    // Check if bonus config with same TaskType already exists
    const existingByTaskType = await this.prisma.bonusConfig.findUnique({
      where: { TaskType: createDto.TaskType },
    });

    if (existingByTaskType) {
      throw new ConflictException(
        `Bonus config with TaskType "${createDto.TaskType}" already exists`,
      );
    }

    // Check if bonus config with same name already exists
    const existingByName = await this.prisma.bonusConfig.findUnique({
      where: { name: createDto.name },
    });

    if (existingByName) {
      throw new ConflictException(
        `Bonus config with name "${createDto.name}" already exists`,
      );
    }

    try {
      const bonusConfig = await this.prisma.bonusConfig.create({
        data: {
          TaskType: createDto.TaskType,
          name: createDto.name,
          description: createDto.description,
          bonusPercent: createDto.bonusPercent,
        },
      });

      log({
        message: `Bonus config created: ${bonusConfig.name} (${bonusConfig.TaskType})`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Bonus config created successfully',
        data: {
          ...bonusConfig,
          bonusPercent: Number(bonusConfig.bonusPercent),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error creating bonus config: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async findAll(): Promise<ApiResponse<BonusConfigResponseDto[]>> {
    const bonusConfigs = await this.prisma.bonusConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Bonus configs retrieved successfully',
      data: bonusConfigs.map((config) => ({
        ...config,
        bonusPercent: Number(config.bonusPercent),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  async findOne(id: string): Promise<ApiResponse<BonusConfigResponseDto>> {
    const bonusConfig = await this.prisma.bonusConfig.findUnique({
      where: { id },
    });

    if (!bonusConfig) {
      throw new NotFoundException(`Bonus config with id "${id}" is not found`);
    }

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Bonus config retrieved successfully',
      data: {
        ...bonusConfig,
        bonusPercent: Number(bonusConfig.bonusPercent),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async findByTaskType(
    taskType: TaskType,
  ): Promise<ApiResponse<BonusConfigResponseDto>> {
    const bonusConfig = await this.prisma.bonusConfig.findUnique({
      where: { TaskType: taskType },
    });

    if (!bonusConfig) {
      throw new NotFoundException(
        `Bonus config with TaskType "${taskType}" is not found`,
      );
    }

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Bonus config retrieved successfully',
      data: {
        ...bonusConfig,
        bonusPercent: Number(bonusConfig.bonusPercent),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async update(
    id: string,
    updateDto: UpdateBonusConfigDto,
  ): Promise<ApiResponse<BonusConfigResponseDto>> {
    const existing = await this.prisma.bonusConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Bonus config with id "${id}" is not found`);
    }

    // If TaskType is being updated, check for conflicts
    if (updateDto.TaskType && updateDto.TaskType !== existing.TaskType) {
      const taskTypeConflict = await this.prisma.bonusConfig.findUnique({
        where: { TaskType: updateDto.TaskType },
      });

      if (taskTypeConflict) {
        throw new ConflictException(
          `Bonus config with TaskType "${updateDto.TaskType}" already exists`,
        );
      }
    }

    // If name is being updated, check for conflicts
    if (updateDto.name && updateDto.name !== existing.name) {
      const nameConflict = await this.prisma.bonusConfig.findUnique({
        where: { name: updateDto.name },
      });

      if (nameConflict) {
        throw new ConflictException(
          `Bonus config with name "${updateDto.name}" already exists`,
        );
      }
    }

    try {
      const updated = await this.prisma.bonusConfig.update({
        where: { id },
        data: {
          TaskType:
            typeof updateDto.TaskType === 'undefined'
              ? existing.TaskType
              : updateDto.TaskType,
          name:
            typeof updateDto.name === 'undefined'
              ? existing.name
              : updateDto.name,
          description:
            typeof updateDto.description === 'undefined'
              ? existing.description
              : updateDto.description,
          bonusPercent:
            typeof updateDto.bonusPercent === 'undefined'
              ? existing.bonusPercent
              : updateDto.bonusPercent,
        },
      });

      log({
        message: `Bonus config updated: ${updated.name} (${updated.TaskType})`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Bonus config updated successfully',
        data: {
          ...updated,
          bonusPercent: Number(updated.bonusPercent),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error updating bonus config: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async remove(id: string): Promise<ApiResponse<void>> {
    const existing = await this.prisma.bonusConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Bonus config with id "${id}" is not found`);
    }

    try {
      await this.prisma.bonusConfig.delete({
        where: { id },
      });
    } catch (error) {
      log({
        message: `Error deleting bonus config: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }

    log({
      message: `Bonus config deleted: ${existing.name} (${existing.TaskType})`,
      level: LOG_LEVELS.INFO,
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Bonus config deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
