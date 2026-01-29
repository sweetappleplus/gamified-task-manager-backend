import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsPositive,
  IsInt,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { TaskPriority, TaskType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  steps?: string;

  @IsNotEmpty()
  @IsEnum(TaskPriority)
  priority!: TaskPriority;

  @IsNotEmpty()
  @IsEnum(TaskType)
  type!: TaskType;

  @IsNotEmpty()
  @IsPositive()
  budget!: Decimal;

  @IsNotEmpty()
  @IsPositive()
  @Min(0)
  commissionPercent!: Decimal;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  timeToCompleteMin!: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxSubmissionDelayMin?: number;

  @IsNotEmpty()
  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsString()
  assignedUserId?: string;
}
