import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateTaskCategoryDto,
  UpdateTaskCategoryDto,
  TaskCategoryResponseDto,
} from './dto/index.js';
import { API_STATUSES } from '../consts/index.js';
import { ApiResponse } from '../types/index.js';

@Injectable()
export class TaskCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDto: CreateTaskCategoryDto,
  ): Promise<ApiResponse<TaskCategoryResponseDto>> {
    // Check if category with same name already exists
    const existing = await this.prisma.taskCategory.findUnique({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Task category with name "${createDto.name}" already exists`,
      );
    }

    const category = await this.prisma.taskCategory.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        isActive: true,
      },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Task category created successfully',
      data: category,
      timestamp: new Date().toISOString(),
    };
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
      throw new NotFoundException(`Task category with id "${id}" not found`);
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
    // Check if category exists
    const existing = await this.prisma.taskCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Task category with id "${id}" not found`);
    }

    // If name is being updated, check for conflicts
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

    // Prevent deactivating category if it has active tasks
    if (updateDto.isActive === false && existing.isActive) {
      const activeTasksCount = await this.prisma.task.count({
        where: {
          categoryId: id,
          status: {
            notIn: ['COMPLETED', 'PAID', 'CANCELLED', 'FAILED'],
          },
        },
      });

      if (activeTasksCount > 0) {
        throw new BadRequestException(
          `Cannot deactivate category with ${activeTasksCount} active task(s). Please complete or cancel all tasks first.`,
        );
      }
    }

    const updated = await this.prisma.taskCategory.update({
      where: { id },
      data: updateDto,
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Task category updated successfully',
      data: updated,
      timestamp: new Date().toISOString(),
    };
  }

  async remove(id: string): Promise<ApiResponse<void>> {
    // Check if category exists
    const existing = await this.prisma.taskCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Task category with id "${id}" not found`);
    }

    // Check if category has associated tasks
    const tasksCount = await this.prisma.task.count({
      where: { categoryId: id },
    });

    if (tasksCount > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${tasksCount} associated task(s). Please delete or reassign all tasks first.`,
      );
    }

    await this.prisma.taskCategory.delete({
      where: { id },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Task category deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
