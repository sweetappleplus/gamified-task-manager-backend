import {
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsDecimal,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { TaskPriority, TaskType } from '../../generated/prisma/enums.js';

export class BulkCreateTasksDto {
  @IsNumber()
  @Min(1)
  @Max(100)
  numberOfTasks!: number;

  @IsOptional()
  @IsString()
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

  @IsNumber()
  @Min(1)
  timeToCompleteMin!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSubmissionDelayMin?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsDecimal()
  budget!: string;

  @IsDecimal()
  @Min(0)
  @Max(100)
  commissionPercent!: string;

  @IsString()
  categoryId!: string;
}
