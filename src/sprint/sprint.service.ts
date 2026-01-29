import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateSprintDto,
  UpdateSprintDto,
  AddTasksToSprintDto,
  SprintFilterDto,
  SprintResponseDto,
  SprintProgressResponseDto,
} from './dto/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { API_STATUSES, LOG_LEVELS } from '../shared/consts/index.js';
import { log } from '../shared/utils/index.js';
import { SprintStatus, TaskStatus } from '../generated/prisma/enums.js';

@Injectable()
export class SprintService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDto: CreateSprintDto,
    createdById: string,
  ): Promise<ApiResponse<SprintResponseDto>> {
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const durationHours =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    if (durationHours < 1 || durationHours > 48) {
      throw new BadRequestException(
        'Sprint duration must be between 1 and 48 hours',
      );
    }

    try {
      const sprint = await this.prisma.dailySprint.create({
        data: {
          name: createDto.name,
          description: createDto.description,
          startDate,
          endDate,
          status: SprintStatus.DRAFT,
          isActive: false,
          createdById,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      log({
        message: `New sprint created: ${sprint.name} by user ${createdById}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Sprint created successfully',
        data: sprint,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error creating sprint: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async findAll(
    filterDto: SprintFilterDto,
  ): Promise<ApiResponse<SprintResponseDto[]>> {
    const where: Record<string, unknown> = {};

    if (filterDto.status !== undefined) {
      where.status = filterDto.status;
    }
    if (filterDto.isActive !== undefined) {
      where.isActive = filterDto.isActive;
    }
    if (filterDto.createdById) {
      where.createdById = filterDto.createdById;
    }

    const sprints = await this.prisma.dailySprint.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        tasks: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                type: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        progress: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Sprints retrieved successfully',
      data: sprints,
      timestamp: new Date().toISOString(),
    };
  }

  async findOne(id: string): Promise<ApiResponse<SprintResponseDto>> {
    const sprint = await this.prisma.dailySprint.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        tasks: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                type: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        progress: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with id "${id}" is not found`);
    }

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Sprint retrieved successfully',
      data: sprint,
      timestamp: new Date().toISOString(),
    };
  }

  async update(
    id: string,
    updateDto: UpdateSprintDto,
  ): Promise<ApiResponse<SprintResponseDto>> {
    const existing = await this.prisma.dailySprint.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Sprint with id "${id}" is not found`);
    }

    if (existing.status === SprintStatus.COMPLETED) {
      throw new BadRequestException('Cannot update a completed sprint');
    }

    if (updateDto.startDate && updateDto.endDate) {
      const startDate = new Date(updateDto.startDate);
      const endDate = new Date(updateDto.endDate);
      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    try {
      const updated = await this.prisma.dailySprint.update({
        where: { id },
        data: {
          ...updateDto,
          startDate: updateDto.startDate
            ? new Date(updateDto.startDate)
            : undefined,
          endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          tasks: {
            include: {
              task: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  status: true,
                  priority: true,
                  type: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
          progress: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      log({
        message: `Sprint updated: ${updated.name}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Sprint updated successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error updating sprint: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async remove(id: string): Promise<ApiResponse<void>> {
    const existing = await this.prisma.dailySprint.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Sprint with id "${id}" is not found`);
    }

    if (existing.status === SprintStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete an active sprint');
    }

    try {
      await this.prisma.dailySprint.delete({
        where: { id },
      });

      log({
        message: `Sprint deleted: ${existing.name}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Sprint deleted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error deleting sprint: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async addTasks(
    id: string,
    addTasksDto: AddTasksToSprintDto,
  ): Promise<ApiResponse<SprintResponseDto>> {
    const sprint = await this.prisma.dailySprint.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with id "${id}" is not found`);
    }

    if (sprint.status !== SprintStatus.DRAFT) {
      throw new BadRequestException('Can only add tasks to draft sprints');
    }

    const tasks = await this.prisma.task.findMany({
      where: {
        id: { in: addTasksDto.taskIds },
      },
    });

    if (tasks.length !== addTasksDto.taskIds.length) {
      throw new NotFoundException('One or more tasks not found');
    }

    const invalidTasks = tasks.filter(
      (task) =>
        task.status !== TaskStatus.NEW && task.status !== TaskStatus.PENDING,
    );

    if (invalidTasks.length > 0) {
      throw new BadRequestException(
        'Can only add tasks with NEW or PENDING status to sprint',
      );
    }

    const totalTasks = sprint.tasks.length + addTasksDto.taskIds.length;
    if (totalTasks > 8) {
      throw new BadRequestException('Sprint cannot have more than 8 tasks');
    }

    try {
      const currentMaxOrder =
        sprint.tasks.length > 0
          ? Math.max(...sprint.tasks.map((t) => t.order))
          : 0;

      const sprintTasksData = addTasksDto.taskIds.map((taskId, index) => ({
        sprintId: id,
        taskId,
        order: currentMaxOrder + index + 1,
      }));

      await this.prisma.sprintTask.createMany({
        data: sprintTasksData,
        skipDuplicates: true,
      });

      const updated = await this.prisma.dailySprint.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          tasks: {
            include: {
              task: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  status: true,
                  priority: true,
                  type: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
          progress: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      log({
        message: `Tasks added to sprint: ${sprint.name}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Tasks added to sprint successfully',
        data: updated!,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error adding tasks to sprint: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async removeTask(
    sprintId: string,
    taskId: string,
  ): Promise<ApiResponse<void>> {
    const sprint = await this.prisma.dailySprint.findUnique({
      where: { id: sprintId },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with id "${sprintId}" is not found`);
    }

    if (sprint.status !== SprintStatus.DRAFT) {
      throw new BadRequestException('Can only remove tasks from draft sprints');
    }

    const sprintTask = await this.prisma.sprintTask.findFirst({
      where: {
        sprintId,
        taskId,
      },
    });

    if (!sprintTask) {
      throw new NotFoundException('Task not found in this sprint');
    }

    try {
      await this.prisma.sprintTask.delete({
        where: { id: sprintTask.id },
      });

      log({
        message: `Task removed from sprint: ${sprint.name}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Task removed from sprint successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error removing task from sprint: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async activate(id: string): Promise<ApiResponse<SprintResponseDto>> {
    const sprint = await this.prisma.dailySprint.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with id "${id}" is not found`);
    }

    if (sprint.status !== SprintStatus.DRAFT) {
      throw new BadRequestException('Can only activate draft sprints');
    }

    if (sprint.tasks.length < 5) {
      throw new BadRequestException('Sprint must have at least 5 tasks');
    }

    if (sprint.tasks.length > 8) {
      throw new BadRequestException('Sprint cannot have more than 8 tasks');
    }

    const activeSprintExists = await this.prisma.dailySprint.findFirst({
      where: {
        status: SprintStatus.ACTIVE,
        isActive: true,
      },
    });

    if (activeSprintExists) {
      throw new ConflictException('Another sprint is already active');
    }

    try {
      const updated = await this.prisma.dailySprint.update({
        where: { id },
        data: {
          status: SprintStatus.ACTIVE,
          isActive: true,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          tasks: {
            include: {
              task: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  status: true,
                  priority: true,
                  type: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
          progress: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      log({
        message: `Sprint activated: ${updated.name}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Sprint activated successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error activating sprint: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async complete(id: string): Promise<ApiResponse<SprintResponseDto>> {
    const sprint = await this.prisma.dailySprint.findUnique({
      where: { id },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with id "${id}" is not found`);
    }

    if (sprint.status !== SprintStatus.ACTIVE) {
      throw new BadRequestException('Can only complete active sprints');
    }

    try {
      const updated = await this.prisma.dailySprint.update({
        where: { id },
        data: {
          status: SprintStatus.COMPLETED,
          isActive: false,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          tasks: {
            include: {
              task: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  status: true,
                  priority: true,
                  type: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
          progress: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      log({
        message: `Sprint completed: ${updated.name}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Sprint completed successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error completing sprint: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async startSprint(
    id: string,
    userId: string,
  ): Promise<ApiResponse<SprintProgressResponseDto>> {
    const sprint = await this.prisma.dailySprint.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with id "${id}" is not found`);
    }

    if (sprint.status !== SprintStatus.ACTIVE) {
      throw new BadRequestException('Can only start active sprints');
    }

    const existingProgress = await this.prisma.sprintProgress.findUnique({
      where: {
        sprintId_userId: {
          sprintId: id,
          userId,
        },
      },
    });

    if (existingProgress) {
      throw new ConflictException('You have already started this sprint');
    }

    try {
      const progress = await this.prisma.sprintProgress.create({
        data: {
          sprintId: id,
          userId,
          tasksCompleted: 0,
          totalTasks: sprint.tasks.length,
          startedAt: new Date(),
        },
        include: {
          sprint: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      log({
        message: `Sprint started by user ${userId}: ${sprint.name}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Sprint started successfully',
        data: progress,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error starting sprint: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async getProgress(
    id: string,
    userId?: string,
  ): Promise<ApiResponse<SprintProgressResponseDto[]>> {
    const sprint = await this.prisma.dailySprint.findUnique({
      where: { id },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with id "${id}" is not found`);
    }

    const where: Record<string, unknown> = { sprintId: id };
    if (userId) {
      where.userId = userId;
    }

    const progress = await this.prisma.sprintProgress.findMany({
      where,
      include: {
        sprint: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Sprint progress retrieved successfully',
      data: progress,
      timestamp: new Date().toISOString(),
    };
  }
}
