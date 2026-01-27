import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateTaskCategoryDto,
  UpdateTaskCategoryDto,
  TaskCategoryResponseDto,
} from './dto/index.js';
import { API_STATUSES, LOG_LEVELS } from '../shared/consts/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { log } from '../shared/utils/index.js';

@Injectable()
export class TaskCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDto: CreateTaskCategoryDto,
  ): Promise<ApiResponse<TaskCategoryResponseDto>> {
    const existing = await this.prisma.taskCategory.findUnique({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Task category with name "${createDto.name}" already exists`,
      );
    }

    try {
      const category = await this.prisma.taskCategory.create({
        data: {
          name: createDto.name,
          description: createDto.description,
        },
      });

      log({
        message: `New task category created: ${category.name}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Task category created successfully',
        data: category,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error creating task category: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async findAll(): Promise<ApiResponse<TaskCategoryResponseDto[]>> {
    const categories = await this.prisma.taskCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Task categories retrieved successfully',
      data: categories,
      timestamp: new Date().toISOString(),
    };
  }

  async findOne(id: string): Promise<ApiResponse<TaskCategoryResponseDto>> {
    const category = await this.prisma.taskCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Task category with id "${id}" is not found`);
    }

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Task category retrieved successfully',
      data: category,
      timestamp: new Date().toISOString(),
    };
  }

  async update(
    id: string,
    updateDto: UpdateTaskCategoryDto,
  ): Promise<ApiResponse<TaskCategoryResponseDto>> {
    const existing = await this.prisma.taskCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Task category with id "${id}" is not found`);
    }

    if (updateDto.name && updateDto.name !== existing.name) {
      const nameConflict = await this.prisma.taskCategory.findUnique({
        where: { name: updateDto.name },
      });

      if (nameConflict) {
        throw new ConflictException(
          `Task category with name "${updateDto.name}" already exists`,
        );
      }
    }

    try {
      const updated = await this.prisma.taskCategory.update({
        where: { id },
        data: updateDto,
      });

      log({
        message: `Task category updated: ${updated.name}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Task category updated successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error updating task category: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async remove(id: string): Promise<ApiResponse<void>> {
    const existing = await this.prisma.taskCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Task category with id "${id}" is not found`);
    }

    try {
      await this.prisma.taskCategory.delete({
        where: { id },
      });
    } catch (error) {
      log({
        message: `Error deleting task category: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }

    log({
      message: `Task category deleted: ${existing.name}`,
      level: LOG_LEVELS.INFO,
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Task category deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
