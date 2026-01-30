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
import { BonusConfigService } from './bonus-config.service.js';
import {
  CreateBonusConfigDto,
  BonusConfigResponseDto,
  UpdateBonusConfigDto,
} from './dto/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { Public, Roles } from '../auth/decorators/index.js';
import { TaskType, UserRole } from '../generated/prisma/enums.js';

@ApiTags('Bonus Configuration')
@Controller('bonus-configs')
export class BonusConfigController {
  constructor(private readonly bonusConfigService: BonusConfigService) {}

  @ApiOperation({
    summary: 'Create bonus config (Super Admin only)',
    description: 'Creates bonus percentage configuration for a task type',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDoc({
    status: 201,
    description: 'Bonus config created successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateBonusConfigDto,
  ): Promise<ApiResponse<BonusConfigResponseDto>> {
    return this.bonusConfigService.create(createDto);
  }

  @ApiOperation({
    summary: 'Get all bonus configs',
    description: 'Retrieves all bonus configurations (public endpoint)',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Bonus configs retrieved successfully',
  })
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ApiResponse<BonusConfigResponseDto[]>> {
    return this.bonusConfigService.findAll();
  }

  @ApiOperation({
    summary: 'Get bonus config by task type',
    description:
      'Retrieves bonus config for a specific task type (public endpoint)',
  })
  @ApiParam({ name: 'taskType', enum: TaskType, description: 'Task type' })
  @ApiResponseDoc({
    status: 200,
    description: 'Bonus config retrieved successfully',
  })
  @Public()
  @Get('task-type/:taskType')
  @HttpCode(HttpStatus.OK)
  async findByTaskType(
    @Param('taskType') taskType: TaskType,
  ): Promise<ApiResponse<BonusConfigResponseDto>> {
    return this.bonusConfigService.findByTaskType(taskType);
  }

  @ApiOperation({
    summary: 'Get bonus config by ID',
    description: 'Retrieves a specific bonus config (public endpoint)',
  })
  @ApiParam({ name: 'id', description: 'Bonus config ID' })
  @ApiResponseDoc({
    status: 200,
    description: 'Bonus config retrieved successfully',
  })
  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<BonusConfigResponseDto>> {
    return this.bonusConfigService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update bonus config (Super Admin only)',
    description: 'Updates bonus percentage',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Bonus config ID' })
  @ApiResponseDoc({
    status: 200,
    description: 'Bonus config updated successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBonusConfigDto,
  ): Promise<ApiResponse<BonusConfigResponseDto>> {
    return this.bonusConfigService.update(id, updateDto);
  }

  @ApiOperation({
    summary: 'Delete bonus config (Super Admin only)',
    description: 'Deletes a bonus configuration',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Bonus config ID' })
  @ApiResponseDoc({
    status: 200,
    description: 'Bonus config deleted successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    return this.bonusConfigService.remove(id);
  }
}
