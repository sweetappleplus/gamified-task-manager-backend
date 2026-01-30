import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TaskPriority,
  TaskType,
  TaskStatus,
} from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

class CategoryInfo {
  @ApiProperty({ example: 'clxyz123456789abcdef' })
  id!: string;

  @ApiProperty({ example: 'Web Development' })
  name!: string;
}

class UserInfo {
  @ApiProperty({ example: 'clxyz123456789abcdef' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: 'John Doe', nullable: true })
  name?: string | null;
}

export class TaskResponseDto {
  @ApiProperty({
    description: 'Unique task identifier',
    example: 'clxyz123456789abcdef',
  })
  id!: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Design landing page mockup',
  })
  title!: string;

  @ApiProperty({
    description: 'Detailed task description',
    example: 'Create a modern landing page design for our new product launch',
  })
  description!: string;

  @ApiPropertyOptional({
    description: 'Step-by-step instructions',
    example: '1. Research competitors\n2. Create wireframe\n3. Design mockup',
    nullable: true,
  })
  steps?: string | null;

  @ApiProperty({
    description: 'Task priority level',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  priority!: TaskPriority;

  @ApiProperty({
    description: 'Task type',
    enum: TaskType,
    example: TaskType.STANDARD,
  })
  type!: TaskType;

  @ApiProperty({
    description: 'Total budget for this task',
    example: '50.00',
    type: 'string',
  })
  budget!: Decimal;

  @ApiProperty({
    description: 'Commission percentage worker earns',
    example: '80.00',
    type: 'string',
  })
  commissionPercent!: Decimal;

  @ApiProperty({
    description: 'Expected completion time in minutes',
    example: 240,
  })
  timeToCompleteMin!: number;

  @ApiPropertyOptional({
    description: 'Task deadline',
    example: '2026-02-15T23:59:59.000Z',
    nullable: true,
  })
  deadline?: Date | null;

  @ApiPropertyOptional({
    description: 'Maximum allowed delay in minutes',
    example: 60,
    nullable: true,
  })
  maxSubmissionDelayMin?: number | null;

  @ApiProperty({
    description: 'Current task status',
    enum: TaskStatus,
    example: TaskStatus.IN_ACTION,
  })
  status!: TaskStatus;

  @ApiPropertyOptional({
    description: 'Timestamp when worker started the task',
    example: '2026-01-30T10:00:00.000Z',
    nullable: true,
  })
  startedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Timestamp when worker submitted the task',
    example: '2026-01-30T14:30:00.000Z',
    nullable: true,
  })
  submittedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Timestamp when task was marked as completed',
    example: '2026-01-30T15:00:00.000Z',
    nullable: true,
  })
  completedAt?: Date | null;

  @ApiProperty({
    description: 'ID of the admin who created this task',
    example: 'clxyz123456789abcdef',
  })
  createdById!: string;

  @ApiPropertyOptional({
    description: 'ID of the worker assigned to this task',
    example: 'clxyz123456789abcdef',
    nullable: true,
  })
  assignedUserId?: string | null;

  @ApiProperty({
    description: 'ID of the task category',
    example: 'clxyz123456789abcdef',
  })
  categoryId!: string;

  @ApiProperty({
    description: 'Timestamp when task was created',
    example: '2026-01-29T09:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when task was last updated',
    example: '2026-01-30T15:00:00.000Z',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Task category information',
    type: CategoryInfo,
  })
  category?: CategoryInfo;

  @ApiPropertyOptional({
    description: 'Assigned worker information',
    type: UserInfo,
    nullable: true,
  })
  assignedTo?: UserInfo | null;

  @ApiPropertyOptional({
    description: 'Creator/admin information',
    type: UserInfo,
  })
  createdBy?: UserInfo;
}
