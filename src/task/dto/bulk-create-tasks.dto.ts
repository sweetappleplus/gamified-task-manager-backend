import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Number of identical tasks to create (1-100)',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  numberOfTasks!: number;

  @ApiPropertyOptional({
    description: 'Task title template (will be appended with task number)',
    example: 'Data Entry Task',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed task description',
    example: 'Enter data from provided spreadsheet into the system',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Step-by-step instructions',
    example: '1. Download spreadsheet\n2. Enter data\n3. Verify accuracy',
  })
  @IsOptional()
  @IsString()
  steps?: string;

  @ApiPropertyOptional({
    description: 'Task priority level',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
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

  @ApiProperty({
    description: 'Expected time to complete each task (in minutes)',
    example: 30,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  timeToCompleteMin!: number;

  @ApiPropertyOptional({
    description: 'Maximum allowed delay in submission (in minutes)',
    example: 60,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSubmissionDelayMin?: number;

  @ApiPropertyOptional({
    description: 'Task deadline (ISO 8601 date-time string)',
    example: '2026-02-28T23:59:59Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({
    description: 'Budget per task (in USD)',
    example: '10.00',
    type: 'string',
  })
  @IsDecimal()
  budget!: string;

  @ApiProperty({
    description: 'Commission percentage per task (0-100)',
    example: '80.00',
    type: 'string',
    minimum: 0,
    maximum: 100,
  })
  @IsDecimal()
  @Min(0)
  @Max(100)
  commissionPercent!: string;

  @ApiProperty({
    description: 'ID of the task category',
    example: 'clxyz123456789abcdef',
  })
  @IsString()
  categoryId!: string;
}
