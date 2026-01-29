import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationService } from '../notification/notification.service.js';
import { EmailService } from '../email/email.service.js';
import {
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  SubmitTaskDto,
  ReviewTaskDto,
  TaskFilterDto,
  TaskResponseDto,
  BulkCreateTasksDto,
  BulkAssignTasksDto,
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
    private readonly emailService: EmailService,
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

      if (createDto.assignedUserId && task.assignedTo) {
        await this.notificationService.create({
          userId: createDto.assignedUserId,
          type: NotificationType.TASK_ASSIGNED,
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${task.title}`,
          relatedTaskId: task.id,
        });

        await this.emailService.sendTaskAssignedEmail(
          task.assignedTo.email,
          task.assignedTo.name || 'Worker',
          task.title,
          task.id,
          task.deadline || undefined,
        );
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

    if (filterDto.search) {
      where.OR = [
        { title: { contains: filterDto.search, mode: 'insensitive' } },
        { description: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }

    if (filterDto.deadlineFrom || filterDto.deadlineTo) {
      const deadlineFilter: Record<string, Date> = {};
      if (filterDto.deadlineFrom) {
        deadlineFilter.gte = new Date(filterDto.deadlineFrom);
      }
      if (filterDto.deadlineTo) {
        deadlineFilter.lte = new Date(filterDto.deadlineTo);
      }
      where.deadline = deadlineFilter;
    }

    if (filterDto.createdFrom || filterDto.createdTo) {
      const createdAtFilter: Record<string, Date> = {};
      if (filterDto.createdFrom) {
        createdAtFilter.gte = new Date(filterDto.createdFrom);
      }
      if (filterDto.createdTo) {
        createdAtFilter.lte = new Date(filterDto.createdTo);
      }
      where.createdAt = createdAtFilter;
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

      if (updated.assignedTo) {
        await this.emailService.sendTaskAssignedEmail(
          updated.assignedTo.email,
          updated.assignedTo.name || 'Worker',
          updated.title,
          updated.id,
          updated.deadline || undefined,
        );
      }

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

      const adminUser = await this.prisma.user.findUnique({
        where: { id: task.createdById },
      });

      if (adminUser && updated.assignedTo) {
        await this.emailService.sendTaskSubmittedEmail(
          adminUser.email,
          adminUser.name || 'Admin',
          updated.title,
          updated.assignedTo.name || 'Worker',
          updated.id,
        );
      }

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

        if (task.startedAt && task.submittedAt) {
          const timeSpentMinutes = Math.floor(
            (task.submittedAt.getTime() - task.startedAt.getTime()) /
              (1000 * 60),
          );

          if (timeSpentMinutes < task.timeToCompleteMin) {
            const bonusConfig = await this.prisma.bonusConfig.findUnique({
              where: { TaskType: task.type },
            });

            if (bonusConfig && bonusConfig.bonusPercent.greaterThan(0)) {
              const bonusAmount = reward.mul(bonusConfig.bonusPercent).div(100);

              await this.prisma.ledgerEntry.create({
                data: {
                  userId: task.assignedUserId!,
                  type: 'BONUS',
                  amount: bonusAmount,
                  description: `Time bonus for completing task "${task.title}" ahead of schedule (${timeSpentMinutes}/${task.timeToCompleteMin} min)`,
                  relatedTaskId: task.id,
                },
              });

              log({
                message: `Time bonus applied: ${bonusAmount.toString()} for task ${task.title}`,
                level: LOG_LEVELS.INFO,
              });
            }
          }
        }

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

        if (task.assignedTo) {
          await this.emailService.sendTaskApprovedEmail(
            task.assignedTo.email,
            task.assignedTo.name || 'Worker',
            updated.title,
            reward.toString(),
          );
        }

        return {
          status: API_STATUSES.SUCCESS,
          message: 'Task approved successfully',
          data: updated,
          timestamp: new Date().toISOString(),
        };
      } else {
        const newStatus = reviewDto.returnToInAction
          ? TaskStatus.IN_ACTION
          : TaskStatus.FAILED;

        const updated = await this.prisma.task.update({
          where: { id },
          data: {
            status: newStatus,
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

        const actionMessage = reviewDto.returnToInAction
          ? 'returned to in-progress for corrections'
          : 'rejected';

        log({
          message: `Task ${actionMessage}: ${updated.title}`,
          level: LOG_LEVELS.INFO,
        });

        await this.notificationService.create({
          userId: task.assignedUserId!,
          type: NotificationType.TASK_REJECTED,
          title: reviewDto.returnToInAction
            ? 'Task Needs Corrections'
            : 'Task Rejected',
          message: reviewDto.returnToInAction
            ? `Your task "${updated.title}" needs some corrections. Please review the feedback and resubmit.`
            : `Your task "${updated.title}" has been rejected. Please review the feedback.`,
          relatedTaskId: updated.id,
        });

        if (task.assignedTo) {
          await this.emailService.sendTaskRejectedEmail(
            task.assignedTo.email,
            task.assignedTo.name || 'Worker',
            updated.title,
            reviewDto.feedback || 'Please review and resubmit your work.',
          );
        }

        return {
          status: API_STATUSES.SUCCESS,
          message: reviewDto.returnToInAction
            ? 'Task returned to in-progress for corrections'
            : 'Task rejected',
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

  async markAsPaid(id: string): Promise<ApiResponse<TaskResponseDto>> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" is not found`);
    }

    if (task.status !== TaskStatus.COMPLETED) {
      throw new BadRequestException(
        'Only tasks with status COMPLETED can be marked as PAID',
      );
    }

    if (!task.assignedUserId) {
      throw new BadRequestException('Task must have an assigned worker');
    }

    const taskRewardLedger = await this.prisma.ledgerEntry.findFirst({
      where: {
        relatedTaskId: id,
        type: 'TASK_REWARD',
        userId: task.assignedUserId,
      },
    });

    const bonusLedger = await this.prisma.ledgerEntry.findFirst({
      where: {
        relatedTaskId: id,
        type: 'BONUS',
        userId: task.assignedUserId,
      },
    });

    const totalAmount = new Decimal(taskRewardLedger?.amount || 0).add(
      bonusLedger?.amount || 0,
    );

    try {
      const updated = await this.prisma.task.update({
        where: { id },
        data: {
          status: TaskStatus.PAID,
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
        message: `Task marked as PAID: ${updated.title}, amount: ${totalAmount.toString()}`,
        level: LOG_LEVELS.INFO,
      });

      await this.notificationService.create({
        userId: task.assignedUserId,
        type: NotificationType.PAYMENT_RECORDED,
        title: 'Payment Recorded',
        message: `Payment of $${totalAmount.toString()} for task "${updated.title}" has been recorded`,
        relatedTaskId: updated.id,
      });

      if (task.assignedTo) {
        await this.emailService.sendPaymentRecordedEmail(
          task.assignedTo.email,
          task.assignedTo.name || 'Worker',
          totalAmount.toString(),
          updated.title,
        );
      }

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Task marked as paid successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error marking task as paid: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async getPaymentsDashboard(
    status?: 'pending' | 'paid',
  ): Promise<ApiResponse<TaskResponseDto[]>> {
    const statusFilter =
      status === 'paid' ? TaskStatus.PAID : TaskStatus.COMPLETED;

    const tasks = await this.prisma.task.findMany({
      where: {
        status: statusFilter,
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
      orderBy: { completedAt: 'desc' },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: `${status === 'paid' ? 'Paid' : 'Pending'} payments retrieved successfully`,
      data: tasks,
      timestamp: new Date().toISOString(),
    };
  }

  async bulkCreateTasks(
    bulkDto: BulkCreateTasksDto,
    createdById: string,
  ): Promise<ApiResponse<TaskResponseDto[]>> {
    const category = await this.prisma.taskCategory.findUnique({
      where: { id: bulkDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Task category with id "${bulkDto.categoryId}" is not found`,
      );
    }

    const tasksData = Array.from({ length: bulkDto.numberOfTasks }, (_, i) => ({
      title: bulkDto.title || `Task ${i + 1}`,
      description: bulkDto.description || '',
      steps: bulkDto.steps || '',
      priority: bulkDto.priority || 'MEDIUM',
      type: bulkDto.type || 'STANDARD',
      budget: new Decimal(bulkDto.budget),
      commissionPercent: new Decimal(bulkDto.commissionPercent),
      timeToCompleteMin: bulkDto.timeToCompleteMin,
      deadline: bulkDto.deadline ? new Date(bulkDto.deadline) : null,
      maxSubmissionDelayMin: bulkDto.maxSubmissionDelayMin || 0,
      status: TaskStatus.NEW,
      createdById,
      categoryId: bulkDto.categoryId,
    }));

    try {
      const createdTasks = await this.prisma.$transaction(
        tasksData.map((taskData) =>
          this.prisma.task.create({
            data: taskData,
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
          }),
        ),
      );

      log({
        message: `Bulk created ${createdTasks.length} tasks by user ${createdById}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: `Successfully created ${createdTasks.length} tasks`,
        data: createdTasks,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error bulk creating tasks: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async bulkAssignTasks(
    bulkAssignDto: BulkAssignTasksDto,
  ): Promise<ApiResponse<{ assignedCount: number }>> {
    const tasks = await this.prisma.task.findMany({
      where: { id: { in: bulkAssignDto.taskIds } },
    });

    if (tasks.length !== bulkAssignDto.taskIds.length) {
      throw new NotFoundException('One or more tasks not found');
    }

    const invalidTasks = tasks.filter(
      (task) =>
        task.status !== TaskStatus.NEW &&
        task.status !== TaskStatus.PENDING &&
        task.status !== TaskStatus.CANCELLED,
    );

    if (invalidTasks.length > 0) {
      throw new BadRequestException(
        `Tasks can only be assigned when status is NEW, PENDING, or CANCELLED. Invalid task IDs: ${invalidTasks.map((t) => t.id).join(', ')}`,
      );
    }

    const workers = await this.prisma.user.findMany({
      where: {
        id: { in: bulkAssignDto.workerIds },
        role: UserRole.WORKER,
      },
    });

    if (workers.length !== bulkAssignDto.workerIds.length) {
      throw new NotFoundException('One or more workers not found');
    }

    try {
      let assignedCount = 0;

      for (const task of tasks) {
        for (const worker of workers) {
          await this.prisma.task.update({
            where: { id: task.id },
            data: {
              assignedUserId: worker.id,
              status: TaskStatus.PENDING,
            },
          });

          await this.notificationService.create({
            userId: worker.id,
            type: NotificationType.TASK_ASSIGNED,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: ${task.title}`,
            relatedTaskId: task.id,
          });

          await this.emailService.sendTaskAssignedEmail(
            worker.email,
            worker.name || 'Worker',
            task.title,
            task.id,
            task.deadline || undefined,
          );

          assignedCount++;
        }
      }

      log({
        message: `Bulk assigned ${bulkAssignDto.taskIds.length} tasks to ${bulkAssignDto.workerIds.length} workers (${assignedCount} total assignments)`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: `Successfully assigned ${bulkAssignDto.taskIds.length} tasks to ${bulkAssignDto.workerIds.length} workers`,
        data: { assignedCount },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error bulk assigning tasks: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }
}
