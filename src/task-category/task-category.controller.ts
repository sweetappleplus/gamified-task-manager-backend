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
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDoc,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TaskCategoryService } from './task-category.service.js';
import {
  CreateTaskCategoryDto,
  UpdateTaskCategoryDto,
  TaskCategoryResponseDto,
} from './dto/index.js';
import { Public, Roles } from '../auth/decorators/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { UserRole } from '../generated/prisma/enums.js';

@ApiTags('Categories')
@Controller('task-categories')
export class TaskCategoryController {
  constructor(private readonly taskCategoryService: TaskCategoryService) {}

  @ApiOperation({ summary: 'Create task category (Super Admin only)', description: 'Creates a new task category' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDoc({ status: 201, description: 'Category created successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTaskCategoryDto: CreateTaskCategoryDto,
  ): Promise<ApiResponse<TaskCategoryResponseDto>> {
    return this.taskCategoryService.create(createTaskCategoryDto);
  }

  @ApiOperation({ summary: 'Get all task categories', description: 'Retrieves all task categories (public endpoint)' })
  @ApiResponseDoc({ status: 200, description: 'Categories retrieved successfully' })
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ApiResponse<TaskCategoryResponseDto[]>> {
    return this.taskCategoryService.findAll();
  }

  @ApiOperation({ summary: 'Get task category by ID', description: 'Retrieves a specific category (public endpoint)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponseDoc({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponseDoc({ status: 404, description: 'Category not found' })
  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<TaskCategoryResponseDto>> {
    return this.taskCategoryService.findOne(id);
  }

  @ApiOperation({ summary: 'Update task category (Super Admin only)', description: 'Updates category details' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponseDoc({ status: 200, description: 'Category updated successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateTaskCategoryDto: UpdateTaskCategoryDto,
  ): Promise<ApiResponse<TaskCategoryResponseDto>> {
    return this.taskCategoryService.update(id, updateTaskCategoryDto);
  }

  @ApiOperation({ summary: 'Delete task category (Super Admin only)', description: 'Deletes a category' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponseDoc({ status: 200, description: 'Category deleted successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    return this.taskCategoryService.remove(id);
  }
}
