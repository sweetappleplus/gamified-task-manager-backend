import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDoc,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service.js';
import { CreateNotificationDto, NotificationResponseDto } from './dto/index.js';
import { ApiResponse, type CurrentUserData } from '../shared/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { CurrentUser, Roles } from '../auth/decorators/index.js';
import { UserRole } from '../generated/prisma/enums.js';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({
    summary: 'Create notification (Super Admin only)',
    description: 'Creates a system notification for a specific user',
  })
  @ApiResponseDoc({
    status: 201,
    description: 'Notification created successfully',
  })
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() payload: CreateNotificationDto,
  ): Promise<ApiResponse<NotificationResponseDto>> {
    return this.notificationService.create(payload);
  }

  @ApiOperation({
    summary: 'Get all notifications for current user',
    description: 'Retrieves all notifications for the authenticated user',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllForCurrentUser(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<NotificationResponseDto[]>> {
    return this.notificationService.findAllForUser(user.userId);
  }

  @ApiOperation({
    summary: 'Get unread notification count',
    description:
      'Returns the count of unread notifications for the authenticated user',
  })
  @ApiResponseDoc({ status: 200, description: 'Count retrieved successfully' })
  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  async getUnreadCountForCurrentUser(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<{ count: number }>> {
    return this.notificationService.getUnreadCountForUser(user.userId);
  }

  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Marks all notifications as read for the authenticated user',
  })
  @ApiResponseDoc({ status: 200, description: 'Notifications marked as read' })
  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllAsReadForCurrentUser(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<{ updatedCount: number }>> {
    return this.notificationService.markAllAsReadForUser(user.userId);
  }

  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Marks a specific notification as read',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponseDoc({ status: 200, description: 'Notification marked as read' })
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsReadForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<ApiResponse<NotificationResponseDto>> {
    return this.notificationService.markAsReadForUser(user.userId, id);
  }

  @ApiOperation({
    summary: 'Delete notification',
    description: 'Deletes a notification for the authenticated user',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponseDoc({
    status: 200,
    description: 'Notification deleted successfully',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removeForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<ApiResponse<void>> {
    return this.notificationService.removeForUser(user.userId, id);
  }
}
