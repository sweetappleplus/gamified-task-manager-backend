import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { LevelConfigService } from './level-config.service.js';
import {
  CreateLevelConfigDto,
  LevelConfigResponseDto,
  UpdateLevelConfigDto,
} from './dto/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { Public, Roles } from '../auth/decorators/index.js';
import { UserRole } from '../generated/prisma/enums.js';

@ApiTags('Level Configuration')
@Controller('level-configs')
export class LevelConfigController {
  constructor(private readonly levelConfigService: LevelConfigService) {}

  @ApiOperation({
    summary: 'Create level config (Super Admin only)',
    description: 'Creates XP requirements and multipliers for a level',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDoc({
    status: 201,
    description: 'Level config created successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateLevelConfigDto,
  ): Promise<ApiResponse<LevelConfigResponseDto>> {
    return this.levelConfigService.create(createDto);
  }

  @ApiOperation({
    summary: 'Get all level configs',
    description:
      'Retrieves XP and multiplier configuration for all levels (public endpoint)',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Level configs retrieved successfully',
  })
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ApiResponse<LevelConfigResponseDto[]>> {
    return this.levelConfigService.findAll();
  }

  @ApiOperation({
    summary: 'Get level config by level number',
    description: 'Retrieves config for a specific level (public endpoint)',
  })
  @ApiParam({ name: 'level', description: 'Level number', example: 5 })
  @ApiResponseDoc({
    status: 200,
    description: 'Level config retrieved successfully',
  })
  @Public()
  @Get(':level')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('level', ParseIntPipe) level: number,
  ): Promise<ApiResponse<LevelConfigResponseDto>> {
    return this.levelConfigService.findOne(level);
  }

  @ApiOperation({
    summary: 'Update level config (Super Admin only)',
    description: 'Updates XP requirements and multipliers',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'level', description: 'Level number', example: 5 })
  @ApiResponseDoc({
    status: 200,
    description: 'Level config updated successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':level')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('level', ParseIntPipe) level: number,
    @Body() updateDto: UpdateLevelConfigDto,
  ): Promise<ApiResponse<LevelConfigResponseDto>> {
    return this.levelConfigService.update(level, updateDto);
  }

  @ApiOperation({
    summary: 'Delete level config (Super Admin only)',
    description: 'Deletes a level configuration',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'level', description: 'Level number', example: 5 })
  @ApiResponseDoc({
    status: 200,
    description: 'Level config deleted successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':level')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('level', ParseIntPipe) level: number,
  ): Promise<ApiResponse<void>> {
    return this.levelConfigService.remove(level);
  }
}
