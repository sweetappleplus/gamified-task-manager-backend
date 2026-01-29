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
import { TaskPriority, TaskType, TaskStatus } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  steps?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @IsOptional()
  @IsPositive()
  budget?: Decimal;

  @IsOptional()
  @IsPositive()
  @Min(0)
  commissionPercent?: Decimal;

  @IsOptional()
  @IsInt()
  @IsPositive()
  timeToCompleteMin?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxSubmissionDelayMin?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
