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
import { NotificationService } from './notification.service.js';
import { CreateNotificationDto, NotificationResponseDto } from './dto/index.js';
import {
  ApiResponse,
  type CurrentUserData,
  UserRole,
} from '../shared/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { CurrentUser, Roles } from '../auth/decorators/index.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() payload: CreateNotificationDto,
  ): Promise<ApiResponse<NotificationResponseDto>> {
    return this.notificationService.create(payload);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllForCurrentUser(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<NotificationResponseDto[]>> {
    return this.notificationService.findAllForUser(user.userId);
  }

  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  async getUnreadCountForCurrentUser(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<{ count: number }>> {
    return this.notificationService.getUnreadCountForUser(user.userId);
  }

  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllAsReadForCurrentUser(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<{ updatedCount: number }>> {
    return this.notificationService.markAllAsReadForUser(user.userId);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsReadForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<ApiResponse<NotificationResponseDto>> {
    return this.notificationService.markAsReadForUser(user.userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removeForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<ApiResponse<void>> {
    return this.notificationService.removeForUser(user.userId, id);
  }
}
