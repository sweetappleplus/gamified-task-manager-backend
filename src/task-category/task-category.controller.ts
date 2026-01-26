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
} from '@nestjs/common';
import { TaskCategoryService } from './task-category.service.js';
import {
  CreateTaskCategoryDto,
  UpdateTaskCategoryDto,
  TaskCategoryResponseDto,
} from './dto/index.js';
import { Public, Roles } from '../auth/decorators/index.js';
import { UserRole } from '../types/index.js';
import { ApiResponse } from '../types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';

@Controller('task-categories')
export class TaskCategoryController {
  constructor(private readonly taskCategoryService: TaskCategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTaskCategoryDto: CreateTaskCategoryDto,
  ): Promise<ApiResponse<TaskCategoryResponseDto>> {
    return this.taskCategoryService.create(createTaskCategoryDto);
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ApiResponse<TaskCategoryResponseDto[]>> {
    return this.taskCategoryService.findAll();
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<TaskCategoryResponseDto>> {
    return this.taskCategoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateTaskCategoryDto: UpdateTaskCategoryDto,
  ): Promise<ApiResponse<TaskCategoryResponseDto>> {
    return this.taskCategoryService.update(id, updateTaskCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    return this.taskCategoryService.remove(id);
  }
}
