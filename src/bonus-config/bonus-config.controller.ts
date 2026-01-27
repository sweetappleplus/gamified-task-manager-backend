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
import { BonusConfigService } from './bonus-config.service.js';
import {
  CreateBonusConfigDto,
  BonusConfigResponseDto,
  UpdateBonusConfigDto,
} from './dto/index.js';
import {
  ApiResponse,
  UserRole,
  type TaskType,
} from '../modules/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { Public, Roles } from '../auth/decorators/index.js';

@Controller('bonus-configs')
export class BonusConfigController {
  constructor(private readonly bonusConfigService: BonusConfigService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateBonusConfigDto,
  ): Promise<ApiResponse<BonusConfigResponseDto>> {
    return this.bonusConfigService.create(createDto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ApiResponse<BonusConfigResponseDto[]>> {
    return this.bonusConfigService.findAll();
  }

  @Public()
  @Get('task-type/:taskType')
  @HttpCode(HttpStatus.OK)
  async findByTaskType(
    @Param('taskType') taskType: TaskType,
  ): Promise<ApiResponse<BonusConfigResponseDto>> {
    return this.bonusConfigService.findByTaskType(taskType);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<BonusConfigResponseDto>> {
    return this.bonusConfigService.findOne(id);
  }

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    return this.bonusConfigService.remove(id);
  }
}
