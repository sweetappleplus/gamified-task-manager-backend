import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationService } from '../notification/notification.service.js';
import {
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  SubmitTaskDto,
  ReviewTaskDto,
  TaskFilterDto,
  TaskResponseDto,
} from './dto/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { API_STATUSES, LOG_LEVELS } from '../shared/consts/index.js';
import { log } from '../shared/utils/index.js';
import {
  TaskStatus,
  NotificationType,
  UserRole,
} from '../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    createDto: CreateTaskDto,
    createdById: string,
  ): Promise<ApiResponse<TaskResponseDto>> {
    const category = await this.prisma.taskCategory.findUnique({
      where: { id: createDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Task category with id "${createDto.categoryId}" is not found`,
      );
    }

    if (createDto.assignedUserId) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: createDto.assignedUserId },
      });

      if (!assignedUser) {
        throw new NotFoundException(
          `User with id "${createDto.assignedUserId}" is not found`,
        );
      }

      if (assignedUser.role !== UserRole.WORKER) {
        throw new BadRequestException(
          'Task can only be assigned to users with WORKER role',
        );
      }
    }

    try {
      const task = await this.prisma.task.create({
        data: {
          title: createDto.title,
          description: createDto.description,
          steps: createDto.steps,
          priority: createDto.priority,
          type: createDto.type,
          budget: createDto.budget,
          commissionPercent: createDto.commissionPercent,
          timeToCompleteMin: createDto.timeToCompleteMin,
          deadline: createDto.deadline
            ? new Date(createDto.deadline)
            : undefined,
          maxSubmissionDelayMin: createDto.maxSubmissionDelayMin,
          status: createDto.assignedUserId
            ? TaskStatus.PENDING
            : TaskStatus.NEW,
          createdById,
          assignedUserId: createDto.assignedUserId,
          categoryId: createDto.categoryId,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
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
        message: `New task created: ${task.title} by user ${createdById}`,
        level: LOG_LEVELS.INFO,
      });

      if (createDto.assignedUserId) {
        await this.notificationService.create({
          userId: createDto.assignedUserId,
          type: NotificationType.TASK_ASSIGNED,
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${task.title}`,
          relatedTaskId: task.id,
        });
      }

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Task created successfully',
        data: task,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error creating task: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async findAll(
    filterDto: TaskFilterDto,
  ): Promise<ApiResponse<TaskResponseDto[]>> {
    const where: Record<string, unknown> = {};

    if (filterDto.status) {
      where.status = filterDto.status;
    }
    if (filterDto.priority) {
      where.priority = filterDto.priority;
    }
    if (filterDto.type) {
      where.type = filterDto.type;
    }
    if (filterDto.assignedUserId) {
      where.assignedUserId = filterDto.assignedUserId;
    }
    if (filterDto.categoryId) {
      where.categoryId = filterDto.categoryId;
    }
    if (filterDto.createdById) {
      where.createdById = filterDto.createdById;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Tasks retrieved successfully',
      data: tasks,
      timestamp: new Date().toISOString(),
    };
  }

  async findOne(id: string): Promise<ApiResponse<TaskResponseDto>> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" is not found`);
    }

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Task retrieved successfully',
      data: task,
      timestamp: new Date().toISOString(),
    };
  }

  async update(
    id: string,
    updateDto: UpdateTaskDto,
  ): Promise<ApiResponse<TaskResponseDto>> {
    const existing = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Task with id "${id}" is not found`);
    }

    if (updateDto.categoryId) {
      const category = await this.prisma.taskCategory.findUnique({
        where: { id: updateDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Task category with id "${updateDto.categoryId}" is not found`,
        );
      }
    }

    try {
      const updated = await this.prisma.task.update({
        where: { id },
        data: {
          ...updateDto,
          deadline: updateDto.deadline
            ? new Date(updateDto.deadline)
            : undefined,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
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
        message: `Task updated: ${updated.title}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Task updated successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error updating task: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async remove(id: string): Promise<ApiResponse<void>> {
    const existing = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Task with id "${id}" is not found`);
    }

    if (
      existing.status !== TaskStatus.NEW &&
      existing.status !== TaskStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Only tasks with status NEW or CANCELLED can be deleted',
      );
    }

    try {
      await this.prisma.task.delete({
        where: { id },
      });

      log({
        message: `Task deleted: ${existing.title}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Task deleted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error deleting task: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async assignTask(
    id: string,
    assignDto: AssignTaskDto,
  ): Promise<ApiResponse<TaskResponseDto>> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" is not found`);
    }

    if (
      task.status !== TaskStatus.NEW &&
      task.status !== TaskStatus.PENDING &&
      task.status !== TaskStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Task can only be assigned when status is NEW, PENDING, or CANCELLED',
      );
    }

    const assignedUser = await this.prisma.user.findUnique({
      where: { id: assignDto.assignedUserId },
    });

    if (!assignedUser) {
      throw new NotFoundException(
        `User with id "${assignDto.assignedUserId}" is not found`,
      );
    }

    if (assignedUser.role !== UserRole.WORKER) {
      throw new BadRequestException(
        'Task can only be assigned to users with WORKER role',
      );
    }

    try {
      const updated = await this.prisma.task.update({
        where: { id },
        data: {
          assignedUserId: assignDto.assignedUserId,
          status: TaskStatus.PENDING,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
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
        message: `Task assigned: ${updated.title} to user ${assignDto.assignedUserId}`,
        level: LOG_LEVELS.INFO,
      });

      await this.notificationService.create({
        userId: assignDto.assignedUserId,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${updated.title}`,
        relatedTaskId: updated.id,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Task assigned successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error assigning task: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async startTask(
    id: string,
    userId: string,
  ): Promise<ApiResponse<TaskResponseDto>> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" is not found`);
    }

    if (task.assignedUserId !== userId) {
      throw new ForbiddenException('You can only start tasks assigned to you');
    }

    if (task.status !== TaskStatus.PENDING) {
      throw new BadRequestException(
        'Task can only be started when status is PENDING',
      );
    }

    try {
      const updated = await this.prisma.task.update({
        where: { id },
        data: {
          status: TaskStatus.IN_ACTION,
          startedAt: new Date(),
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
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
        message: `Task started: ${updated.title} by user ${userId}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Task started successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error starting task: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async submitTask(
    id: string,
    userId: string,
    submitDto: SubmitTaskDto,
  ): Promise<ApiResponse<TaskResponseDto>> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" is not found`);
    }

    if (task.assignedUserId !== userId) {
      throw new ForbiddenException('You can only submit tasks assigned to you');
    }

    if (
      task.status !== TaskStatus.IN_ACTION &&
      task.status !== TaskStatus.FAILED
    ) {
      throw new BadRequestException(
        'Task can only be submitted when status is IN_ACTION or FAILED',
      );
    }

    if (!task.startedAt) {
      throw new BadRequestException('Task must be started before submission');
    }

    const submissionTime = new Date();
    const timeSpentMinutes = Math.floor(
      (submissionTime.getTime() - task.startedAt.getTime()) / (1000 * 60),
    );
    const isLate = timeSpentMinutes > task.timeToCompleteMin;

    try {
      await this.prisma.taskSubmission.updateMany({
        where: { taskId: id, isLatest: true },
        data: { isLatest: false },
      });

      await this.prisma.taskSubmission.create({
        data: {
          taskId: id,
          proofUrl: submitDto.proofUrl,
          comment: submitDto.comment,
          isLate,
          submittedById: userId,
          isLatest: true,
        },
      });

      const updated = await this.prisma.task.update({
        where: { id },
        data: {
          status: isLate ? TaskStatus.LATE : TaskStatus.IN_REVIEW,
          submittedAt: submissionTime,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
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
        message: `Task submitted: ${updated.title} by user ${userId}, isLate: ${isLate}`,
        level: LOG_LEVELS.INFO,
      });

      await this.notificationService.create({
        userId: task.createdById,
        type: NotificationType.TASK_SUBMITTED,
        title: 'Task Submitted for Review',
        message: `Task "${updated.title}" has been submitted for review`,
        relatedTaskId: updated.id,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Task submitted successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error submitting task: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async reviewTask(
    id: string,
    reviewDto: ReviewTaskDto,
    reviewerId: string,
  ): Promise<ApiResponse<TaskResponseDto>> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" is not found`);
    }

    if (
      task.status !== TaskStatus.IN_REVIEW &&
      task.status !== TaskStatus.LATE
    ) {
      throw new BadRequestException(
        'Task can only be reviewed when status is IN_REVIEW or LATE',
      );
    }

    const submission = await this.prisma.taskSubmission.findFirst({
      where: { taskId: id, isLatest: true },
    });

    if (!submission) {
      throw new NotFoundException('No submission found for this task');
    }

    try {
      await this.prisma.taskSubmission.update({
        where: { id: submission.id },
        data: {
          adminFeedback: reviewDto.feedback,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });

      if (reviewDto.isApproved) {
        const reward = new Decimal(task.budget)
          .mul(task.commissionPercent)
          .div(100);

        await this.prisma.ledgerEntry.create({
          data: {
            userId: task.assignedUserId!,
            type: 'TASK_REWARD',
            amount: reward,
            description: `Reward for completing task: ${task.title}`,
            relatedTaskId: task.id,
          },
        });

        const updated = await this.prisma.task.update({
          where: { id },
          data: {
            status: TaskStatus.COMPLETED,
            completedAt: new Date(),
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
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
          message: `Task approved: ${updated.title}, reward: ${reward.toString()}`,
          level: LOG_LEVELS.INFO,
        });

        await this.notificationService.create({
          userId: task.assignedUserId!,
          type: NotificationType.TASK_APPROVED,
          title: 'Task Approved',
          message: `Your task "${updated.title}" has been approved! You earned $${reward.toString()}`,
          relatedTaskId: updated.id,
        });

        return {
          status: API_STATUSES.SUCCESS,
          message: 'Task approved successfully',
          data: updated,
          timestamp: new Date().toISOString(),
        };
      } else {
        const updated = await this.prisma.task.update({
          where: { id },
          data: {
            status: TaskStatus.FAILED,
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
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
          message: `Task rejected: ${updated.title}`,
          level: LOG_LEVELS.INFO,
        });

        await this.notificationService.create({
          userId: task.assignedUserId!,
          type: NotificationType.TASK_REJECTED,
          title: 'Task Rejected',
          message: `Your task "${updated.title}" has been rejected. Please review the feedback and resubmit.`,
          relatedTaskId: updated.id,
        });

        return {
          status: API_STATUSES.SUCCESS,
          message: 'Task rejected, worker can resubmit',
          data: updated,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      log({
        message: `Error reviewing task: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }
}
