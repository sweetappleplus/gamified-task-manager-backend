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

@Controller('level-configs')
export class LevelConfigController {
  constructor(private readonly levelConfigService: LevelConfigService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateLevelConfigDto,
  ): Promise<ApiResponse<LevelConfigResponseDto>> {
    return this.levelConfigService.create(createDto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ApiResponse<LevelConfigResponseDto[]>> {
    return this.levelConfigService.findAll();
  }

  @Public()
  @Get(':level')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('level', ParseIntPipe) level: number,
  ): Promise<ApiResponse<LevelConfigResponseDto>> {
    return this.levelConfigService.findOne(level);
  }

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
