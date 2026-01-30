import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Task title (maximum 255 characters)',
    example: 'Design landing page mockup',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Detailed task description explaining what needs to be done',
    example:
      'Create a modern landing page design for our new product launch. Include hero section, features, testimonials, and CTA.',
  })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    description:
      'Step-by-step instructions or checklist for completing the task',
    example:
      '1. Research competitor landing pages\n2. Create wireframe\n3. Design mockup in Figma\n4. Get feedback and iterate',
  })
  @IsOptional()
  @IsString()
  steps?: string;

  @ApiProperty({
    description: 'Task priority level',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsNotEmpty()
  @IsEnum(TaskPriority)
  priority!: TaskPriority;

  @ApiProperty({
    description: 'Task type/category',
    enum: TaskType,
    example: TaskType.STANDARD,
  })
  @IsNotEmpty()
  @IsEnum(TaskType)
  type!: TaskType;

  @ApiProperty({
    description: 'Total budget allocated for this task (in USD)',
    example: '50.00',
    type: 'string',
  })
  @IsNotEmpty()
  @IsPositive()
  budget!: Decimal;

  @ApiProperty({
    description: 'Commission percentage (0-100) that the worker will earn',
    example: '80.00',
    type: 'string',
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty()
  @IsPositive()
  @Min(0)
  commissionPercent!: Decimal;

  @ApiProperty({
    description: 'Expected time to complete the task (in minutes)',
    example: 240,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  timeToCompleteMin!: number;

  @ApiPropertyOptional({
    description: 'Task deadline (ISO 8601 date-time string)',
    example: '2026-02-15T23:59:59Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({
    description:
      'Maximum allowed delay in submission after deadline (in minutes)',
    example: 60,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  maxSubmissionDelayMin?: number;

  @ApiProperty({
    description: 'ID of the task category',
    example: 'clxyz123456789abcdef',
  })
  @IsNotEmpty()
  @IsString()
  categoryId!: string;

  @ApiPropertyOptional({
    description: 'ID of the user to assign this task to (optional)',
    example: 'clxyz123456789abcdef',
  })
  @IsOptional()
  @IsString()
  assignedUserId?: string;
}
