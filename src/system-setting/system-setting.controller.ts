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
import { SystemSettingService } from './system-setting.service.js';
import {
  CreateSystemSettingDto,
  SystemSettingResponseDto,
  UpdateSystemSettingDto,
} from './dto/index.js';
import { ApiResponse } from '../shared/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { Public, Roles } from '../auth/decorators/index.js';
import { UserRole } from '../generated/prisma/enums.js';

@ApiTags('System Settings')
@Controller('system-settings')
export class SystemSettingController {
  constructor(private readonly systemSettingService: SystemSettingService) {}

  @ApiOperation({
    summary: 'Create system setting (Super Admin only)',
    description: 'Creates a new key-value system setting',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDoc({
    status: 201,
    description: 'System setting created successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateSystemSettingDto,
  ): Promise<ApiResponse<SystemSettingResponseDto>> {
    return this.systemSettingService.create(createDto);
  }

  @ApiOperation({
    summary: 'Get all system settings',
    description:
      'Retrieves all system configuration settings (public endpoint)',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'System settings retrieved successfully',
  })
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ApiResponse<SystemSettingResponseDto[]>> {
    return this.systemSettingService.findAll();
  }

  @ApiOperation({
    summary: 'Get system setting by key',
    description: 'Retrieves a specific setting by key (public endpoint)',
  })
  @ApiParam({
    name: 'key',
    description: 'Setting key',
    example: 'max_file_size',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'System setting retrieved successfully',
  })
  @Public()
  @Get(':key')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('key') key: string,
  ): Promise<ApiResponse<SystemSettingResponseDto>> {
    return this.systemSettingService.findOne(key);
  }

  @ApiOperation({
    summary: 'Update system setting (Super Admin only)',
    description: 'Updates the value of a system setting',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'key',
    description: 'Setting key',
    example: 'max_file_size',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'System setting updated successfully',
  })
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

  @ApiOperation({
    summary: 'Delete system setting (Super Admin only)',
    description: 'Removes a system setting',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'key',
    description: 'Setting key',
    example: 'max_file_size',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'System setting deleted successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':key')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('key') key: string): Promise<ApiResponse<void>> {
    return this.systemSettingService.remove(key);
  }
}
