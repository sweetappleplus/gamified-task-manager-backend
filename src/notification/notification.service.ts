import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateNotificationDto, NotificationResponseDto } from './dto/index.js';
import { ApiResponse } from '../types/index.js';
import { API_STATUSES, LOG_LEVELS } from '../consts/index.js';
import { log } from '../utils/index.js';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    payload: CreateNotificationDto,
  ): Promise<ApiResponse<NotificationResponseDto>> {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: payload.userId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          relatedTaskId: payload.relatedTaskId,
        },
      });

      log({
        message: `Notification created for user ${payload.userId} (${payload.type})`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Notification created successfully',
        data: notification,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error creating notification: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async findAllForUser(
    userId: string,
  ): Promise<ApiResponse<NotificationResponseDto[]>> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Notifications retrieved successfully',
      data: notifications,
      timestamp: new Date().toISOString(),
    };
  }

  async getUnreadCountForUser(
    userId: string,
  ): Promise<ApiResponse<{ count: number }>> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Unread notification count retrieved successfully',
      data: { count },
      timestamp: new Date().toISOString(),
    };
  }

  async markAsReadForUser(
    userId: string,
    id: string,
  ): Promise<ApiResponse<NotificationResponseDto>> {
    const existing = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(
        `Notification with id "${id}" is not found for this user`,
      );
    }

    try {
      const updated = await this.prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      log({
        message: `Notification marked as read for user ${userId}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Notification marked as read successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error marking notification as read: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async markAllAsReadForUser(
    userId: string,
  ): Promise<ApiResponse<{ updatedCount: number }>> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      log({
        message: `All notifications marked as read for user ${userId}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'All notifications marked as read successfully',
        data: { updatedCount: result.count },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error marking all notifications as read: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async removeForUser(userId: string, id: string): Promise<ApiResponse<void>> {
    const existing = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(
        `Notification with id "${id}" is not found for this user`,
      );
    }

    try {
      await this.prisma.notification.delete({
        where: { id },
      });
    } catch (error) {
      log({
        message: `Error deleting notification: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }

    log({
      message: `Notification deleted for user ${userId}`,
      level: LOG_LEVELS.INFO,
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Notification deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
