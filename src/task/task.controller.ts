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
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDoc,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TaskService } from './task.service.js';
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
import { Roles, CurrentUser } from '../auth/decorators/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { UserRole } from '../generated/prisma/enums.js';
import type { CurrentUserData } from '../shared/types/user.types.js';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({
    summary: 'Create a new task (Super Admin only)',
    description:
      'Creates a new task with the specified details. Optionally assigns it to a worker. Triggers notification email if assigned.',
  })
  @ApiResponseDoc({
    status: 201,
    description: 'Task created successfully',
  })
  @ApiResponseDoc({
    status: 400,
    description: 'Invalid task data',
  })
  @ApiResponseDoc({
    status: 404,
    description: 'Category or assigned user not found',
  })
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<TaskResponseDto>> {
    return this.taskService.create(createTaskDto, user.userId);
  }

  @ApiOperation({
    summary: 'Get all tasks with optional filters',
    description:
      'Retrieves a list of tasks. Workers can only see their assigned tasks. Admins can see all tasks and apply various filters including search, status, priority, dates, etc.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Tasks retrieved successfully',
  })
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

  @ApiOperation({
    summary: 'Get task by ID',
    description: 'Retrieves detailed information about a specific task.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'clxyz123456789abcdef',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Task retrieved successfully',
  })
  @ApiResponseDoc({
    status: 404,
    description: 'Task not found',
  })
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

  @ApiOperation({
    summary: 'Assign task to a worker (Super Admin only)',
    description:
      'Assigns a task to a worker. Task status changes from NEW to PENDING. Sends notification email to the worker.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'clxyz123456789abcdef',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Task assigned successfully',
  })
  @ApiResponseDoc({
    status: 400,
    description: 'Task cannot be assigned (invalid status)',
  })
  @ApiResponseDoc({
    status: 404,
    description: 'Task or worker not found',
  })
  @Roles(UserRole.SUPER_ADMIN)
  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assignTask(
    @Param('id') id: string,
    @Body() assignTaskDto: AssignTaskDto,
  ): Promise<ApiResponse<TaskResponseDto>> {
    return this.taskService.assignTask(id, assignTaskDto);
  }

  @ApiOperation({
    summary: 'Start working on a task (Worker only)',
    description:
      'Marks a task as started. Task status changes from PENDING to IN_ACTION. Records the start time for time bonus calculation.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'clxyz123456789abcdef',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Task started successfully',
  })
  @ApiResponseDoc({
    status: 400,
    description: 'Task cannot be started (invalid status or not assigned to you)',
  })
  @ApiResponseDoc({
    status: 404,
    description: 'Task not found',
  })
  @Roles(UserRole.WORKER)
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async startTask(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<TaskResponseDto>> {
    return this.taskService.startTask(id, user.userId);
  }

  @ApiOperation({
    summary: 'Submit completed task (Worker only)',
    description:
      'Submits a task for review with proof of work. Task status changes from IN_ACTION to IN_REVIEW. Sends notification email to admins.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'clxyz123456789abcdef',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Task submitted successfully',
  })
  @ApiResponseDoc({
    status: 400,
    description: 'Task cannot be submitted (invalid status or not assigned to you)',
  })
  @ApiResponseDoc({
    status: 404,
    description: 'Task not found',
  })
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

  @ApiOperation({
    summary: 'Review submitted task (Super Admin only)',
    description:
      'Approves or rejects a submitted task. On approval: status → COMPLETED, creates ledger entries, calculates XP/bonuses, sends success email. On rejection: status → FAILED (or IN_ACTION if returnToInAction=true), sends rejection email.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'clxyz123456789abcdef',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Task reviewed successfully',
  })
  @ApiResponseDoc({
    status: 400,
    description: 'Task cannot be reviewed (invalid status)',
  })
  @ApiResponseDoc({
    status: 404,
    description: 'Task not found or not assigned',
  })
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

  @ApiOperation({
    summary: 'Mark task as paid (Super Admin only)',
    description:
      'Marks a completed task as paid. Task status changes from COMPLETED to PAID. Sends payment confirmation email to the worker.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'clxyz123456789abcdef',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Task marked as paid successfully',
  })
  @ApiResponseDoc({
    status: 400,
    description: 'Task cannot be marked as paid (must be in COMPLETED status)',
  })
  @ApiResponseDoc({
    status: 404,
    description: 'Task not found',
  })
  @Roles(UserRole.SUPER_ADMIN)
  @Post(':id/mark-paid')
  @HttpCode(HttpStatus.OK)
  async markAsPaid(
    @Param('id') id: string,
  ): Promise<ApiResponse<TaskResponseDto>> {
    return this.taskService.markAsPaid(id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get('admin/payments')
  @HttpCode(HttpStatus.OK)
  async getPaymentsDashboard(
    @Query('status') status?: 'pending' | 'paid',
  ): Promise<ApiResponse<TaskResponseDto[]>> {
    return this.taskService.getPaymentsDashboard(status);
  }

  @ApiOperation({
    summary: 'Bulk create identical tasks (Super Admin only)',
    description:
      'Creates multiple identical tasks in one operation (1-100 tasks). Useful for repetitive work like data entry. Each task gets a unique number suffix.',
  })
  @ApiResponseDoc({
    status: 201,
    description: 'Tasks created successfully',
  })
  @ApiResponseDoc({
    status: 400,
    description: 'Invalid data or numberOfTasks out of range (1-100)',
  })
  @ApiResponseDoc({
    status: 404,
    description: 'Category not found',
  })
  @Roles(UserRole.SUPER_ADMIN)
  @Post('bulk-create')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(
    @Body() bulkCreateDto: BulkCreateTasksDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<TaskResponseDto[]>> {
    return this.taskService.bulkCreateTasks(bulkCreateDto, user.userId);
  }

  @ApiOperation({
    summary: 'Bulk assign tasks to workers (Super Admin only)',
    description:
      'Assigns multiple tasks to multiple workers in a round-robin fashion. Tasks are distributed evenly among workers. Each worker receives notification emails for their assigned tasks.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Tasks assigned successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Bulk assignment successful' },
        data: {
          type: 'object',
          properties: {
            assignedCount: { type: 'number', example: 10 },
          },
        },
        timestamp: { type: 'string', example: '2026-01-30T12:00:00.000Z' },
      },
    },
  })
  @ApiResponseDoc({
    status: 400,
    description: 'Invalid data (tasks cannot be assigned or already assigned)',
  })
  @ApiResponseDoc({
    status: 404,
    description: 'One or more tasks or workers not found',
  })
  @Roles(UserRole.SUPER_ADMIN)
  @Post('bulk-assign')
  @HttpCode(HttpStatus.OK)
  async bulkAssign(
    @Body() bulkAssignDto: BulkAssignTasksDto,
  ): Promise<ApiResponse<{ assignedCount: number }>> {
    return this.taskService.bulkAssignTasks(bulkAssignDto);
  }
}
