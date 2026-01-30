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
import { SprintService } from './sprint.service.js';
import {
  CreateSprintDto,
  UpdateSprintDto,
  AddTasksToSprintDto,
  SprintFilterDto,
  SprintResponseDto,
  SprintProgressResponseDto,
} from './dto/index.js';
import { Roles, CurrentUser } from '../auth/decorators/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { UserRole } from '../generated/prisma/enums.js';
import type { CurrentUserData } from '../shared/types/user.types.js';

@ApiTags('Sprints')
@ApiBearerAuth('JWT-auth')
@Controller('sprints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  @ApiOperation({
    summary: 'Create a new sprint (Super Admin only)',
    description:
      'Creates a new sprint with start and end dates for organizing tasks',
  })
  @ApiResponseDoc({ status: 201, description: 'Sprint created successfully' })
  @ApiResponseDoc({ status: 400, description: 'Invalid data' })
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSprintDto: CreateSprintDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<SprintResponseDto>> {
    return this.sprintService.create(createSprintDto, user.userId);
  }

  @ApiOperation({
    summary: 'Get all sprints',
    description:
      'Retrieves a list of sprints with optional filtering by status',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Sprints retrieved successfully',
  })
  @Roles(UserRole.SUPER_ADMIN, UserRole.WORKER)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() filterDto: SprintFilterDto,
  ): Promise<ApiResponse<SprintResponseDto[]>> {
    return this.sprintService.findAll(filterDto);
  }

  @ApiOperation({
    summary: 'Get sprint by ID',
    description:
      'Retrieves detailed information about a specific sprint including associated tasks',
  })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponseDoc({ status: 200, description: 'Sprint retrieved successfully' })
  @ApiResponseDoc({ status: 404, description: 'Sprint not found' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.WORKER)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<SprintResponseDto>> {
    return this.sprintService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update sprint (Super Admin only)',
    description: 'Updates sprint details',
  })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponseDoc({ status: 200, description: 'Sprint updated successfully' })
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateSprintDto: UpdateSprintDto,
  ): Promise<ApiResponse<SprintResponseDto>> {
    return this.sprintService.update(id, updateSprintDto);
  }

  @ApiOperation({
    summary: 'Delete sprint (Super Admin only)',
    description: 'Deletes a sprint',
  })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponseDoc({ status: 200, description: 'Sprint deleted successfully' })
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    return this.sprintService.remove(id);
  }

  @ApiOperation({
    summary: 'Add tasks to sprint (Super Admin only)',
    description: 'Associates tasks with a sprint',
  })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponseDoc({ status: 200, description: 'Tasks added successfully' })
  @Roles(UserRole.SUPER_ADMIN)
  @Post(':id/tasks')
  @HttpCode(HttpStatus.OK)
  async addTasks(
    @Param('id') id: string,
    @Body() addTasksDto: AddTasksToSprintDto,
  ): Promise<ApiResponse<SprintResponseDto>> {
    return this.sprintService.addTasks(id, addTasksDto);
  }

  @ApiOperation({
    summary: 'Remove task from sprint (Super Admin only)',
    description: 'Removes a task from sprint',
  })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiResponseDoc({ status: 200, description: 'Task removed successfully' })
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id/tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  async removeTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
  ): Promise<ApiResponse<void>> {
    return this.sprintService.removeTask(id, taskId);
  }

  @ApiOperation({
    summary: 'Activate sprint (Super Admin only)',
    description: 'Changes sprint status to ACTIVE',
  })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponseDoc({ status: 200, description: 'Sprint activated successfully' })
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(
    @Param('id') id: string,
  ): Promise<ApiResponse<SprintResponseDto>> {
    return this.sprintService.activate(id);
  }

  @ApiOperation({
    summary: 'Complete sprint (Super Admin only)',
    description: 'Changes sprint status to COMPLETED',
  })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponseDoc({ status: 200, description: 'Sprint completed successfully' })
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id') id: string,
  ): Promise<ApiResponse<SprintResponseDto>> {
    return this.sprintService.complete(id);
  }

  @ApiOperation({
    summary: 'Start sprint for worker (Worker only)',
    description: 'Worker begins working on sprint tasks',
  })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponseDoc({ status: 200, description: 'Sprint started successfully' })
  @Roles(UserRole.WORKER)
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async startSprint(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<SprintProgressResponseDto>> {
    return this.sprintService.startSprint(id, user.userId);
  }

  @ApiOperation({
    summary: 'Get sprint progress',
    description: 'Retrieves progress statistics for sprint tasks',
  })
  @ApiParam({ name: 'id', description: 'Sprint ID' })
  @ApiResponseDoc({
    status: 200,
    description: 'Progress retrieved successfully',
  })
  @Roles(UserRole.SUPER_ADMIN, UserRole.WORKER)
  @Get(':id/progress')
  @HttpCode(HttpStatus.OK)
  async getProgress(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<SprintProgressResponseDto[]>> {
    const userId = user.role === UserRole.WORKER ? user.userId : undefined;
    return this.sprintService.getProgress(id, userId);
  }
}
