import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service.js';
import {
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  SubmitTaskDto,
  ReviewTaskDto,
  TaskFilterDto,
  TaskResponseDto,
} from './dto/index.js';
import { Roles, CurrentUser } from '../auth/decorators/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { UserRole } from '../generated/prisma/enums.js';
import type { CurrentUserData } from '../shared/types/user.types.js';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<TaskResponseDto>> {
    return this.taskService.create(createTaskDto, user.userId);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.WORKER)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() filterDto: TaskFilterDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<TaskResponseDto[]>> {
    if (user.role === UserRole.WORKER) {
      filterDto.assignedUserId = user.userId;
    }
    return this.taskService.findAll(filterDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.WORKER)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<TaskResponseDto>> {
    return this.taskService.findOne(id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<ApiResponse<TaskResponseDto>> {
    return this.taskService.update(id, updateTaskDto);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    return this.taskService.remove(id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assignTask(
    @Param('id') id: string,
    @Body() assignTaskDto: AssignTaskDto,
  ): Promise<ApiResponse<TaskResponseDto>> {
    return this.taskService.assignTask(id, assignTaskDto);
  }

  @Roles(UserRole.WORKER)
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async startTask(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<TaskResponseDto>> {
    return this.taskService.startTask(id, user.userId);
  }

  @Roles(UserRole.WORKER)
  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  async submitTask(
    @Param('id') id: string,
    @Body() submitTaskDto: SubmitTaskDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<TaskResponseDto>> {
    return this.taskService.submitTask(id, user.userId, submitTaskDto);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Post(':id/review')
  @HttpCode(HttpStatus.OK)
  async reviewTask(
    @Param('id') id: string,
    @Body() reviewTaskDto: ReviewTaskDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<TaskResponseDto>> {
    return this.taskService.reviewTask(id, reviewTaskDto, user.userId);
  }
}
