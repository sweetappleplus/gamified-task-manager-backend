import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import {
  TaskStatus,
  TaskPriority,
  TaskType,
} from '../../generated/prisma/enums.js';

export class TaskFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by task status',
    enum: TaskStatus,
    example: TaskStatus.IN_ACTION,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Filter by task priority',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Filter by task type',
    enum: TaskType,
    example: TaskType.STANDARD,
  })
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @ApiPropertyOptional({
    description: 'Filter by assigned worker ID',
    example: 'clxyz123456789abcdef',
  })
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: 'clxyz123456789abcdef',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by creator/admin ID',
    example: 'clxyz123456789abcdef',
  })
  @IsOptional()
  @IsString()
  createdById?: string;

  @ApiPropertyOptional({
    description: 'Search in task title and description',
    example: 'design landing',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks with deadline from this date (ISO 8601)',
    example: '2026-02-01T00:00:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  deadlineFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks with deadline up to this date (ISO 8601)',
    example: '2026-02-28T23:59:59Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  deadlineTo?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks created from this date (ISO 8601)',
    example: '2026-01-01T00:00:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks created up to this date (ISO 8601)',
    example: '2026-01-31T23:59:59Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  createdTo?: string;
}
