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

@Controller('sprints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSprintDto: CreateSprintDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<SprintResponseDto>> {
    return this.sprintService.create(createSprintDto, user.userId);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.WORKER)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() filterDto: SprintFilterDto,
  ): Promise<ApiResponse<SprintResponseDto[]>> {
    return this.sprintService.findAll(filterDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.WORKER)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<SprintResponseDto>> {
    return this.sprintService.findOne(id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateSprintDto: UpdateSprintDto,
  ): Promise<ApiResponse<SprintResponseDto>> {
    return this.sprintService.update(id, updateSprintDto);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    return this.sprintService.remove(id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Post(':id/tasks')
  @HttpCode(HttpStatus.OK)
  async addTasks(
    @Param('id') id: string,
    @Body() addTasksDto: AddTasksToSprintDto,
  ): Promise<ApiResponse<SprintResponseDto>> {
    return this.sprintService.addTasks(id, addTasksDto);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id/tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  async removeTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
  ): Promise<ApiResponse<void>> {
    return this.sprintService.removeTask(id, taskId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(
    @Param('id') id: string,
  ): Promise<ApiResponse<SprintResponseDto>> {
    return this.sprintService.activate(id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id') id: string,
  ): Promise<ApiResponse<SprintResponseDto>> {
    return this.sprintService.complete(id);
  }

  @Roles(UserRole.WORKER)
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async startSprint(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<SprintProgressResponseDto>> {
    return this.sprintService.startSprint(id, user.userId);
  }

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
