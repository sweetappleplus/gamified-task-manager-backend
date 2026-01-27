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
import { SystemSettingService } from './system-setting.service.js';
import {
  CreateSystemSettingDto,
  SystemSettingResponseDto,
  UpdateSystemSettingDto,
} from './dto/index.js';
import { ApiResponse, UserRole } from '../modules/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { Public, Roles } from '../auth/decorators/index.js';

@Controller('system-settings')
export class SystemSettingController {
  constructor(private readonly systemSettingService: SystemSettingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateSystemSettingDto,
  ): Promise<ApiResponse<SystemSettingResponseDto>> {
    return this.systemSettingService.create(createDto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ApiResponse<SystemSettingResponseDto[]>> {
    return this.systemSettingService.findAll();
  }

  @Public()
  @Get(':key')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('key') key: string,
  ): Promise<ApiResponse<SystemSettingResponseDto>> {
    return this.systemSettingService.findOne(key);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':key')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('key') key: string,
    @Body() updateDto: UpdateSystemSettingDto,
  ): Promise<ApiResponse<SystemSettingResponseDto>> {
    return this.systemSettingService.update(key, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':key')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('key') key: string): Promise<ApiResponse<void>> {
    return this.systemSettingService.remove(key);
  }
}
