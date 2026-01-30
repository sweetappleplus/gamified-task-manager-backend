import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsPositive,
  IsInt,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  TaskPriority,
  TaskType,
  TaskStatus,
} from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Task title (maximum 255 characters)',
    example: 'Design landing page mockup - Updated',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed task description',
    example: 'Updated description with more details',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Step-by-step instructions',
    example: 'Updated steps with more clarity',
  })
  @IsOptional()
  @IsString()
  steps?: string;

  @ApiPropertyOptional({
    description: 'Task priority level',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Task type/category',
    enum: TaskType,
    example: TaskType.STANDARD,
  })
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @ApiPropertyOptional({
    description: 'Total budget for this task (in USD)',
    example: '75.00',
    type: 'string',
  })
  @IsOptional()
  @IsPositive()
  budget?: Decimal;

  @ApiPropertyOptional({
    description: 'Commission percentage (0-100)',
    example: '85.00',
    type: 'string',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsPositive()
  @Min(0)
  commissionPercent?: Decimal;

  @ApiPropertyOptional({
    description: 'Expected time to complete (in minutes)',
    example: 180,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  timeToCompleteMin?: number;

  @ApiPropertyOptional({
    description: 'Task deadline (ISO 8601 date-time string)',
    example: '2026-02-20T23:59:59Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({
    description: 'Maximum allowed delay in submission (in minutes)',
    example: 120,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  maxSubmissionDelayMin?: number;

  @ApiPropertyOptional({
    description: 'ID of the task category',
    example: 'clxyz123456789abcdef',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Task status',
    enum: TaskStatus,
    example: TaskStatus.NEW,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
