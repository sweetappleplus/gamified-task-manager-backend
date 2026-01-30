import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SprintStatus } from '../../generated/prisma/enums.js';

class CreatedByInfo {
  @ApiProperty({ description: 'User ID', example: 'clxyz1234abcd5678efgh9012' })
  id!: string;

  @ApiProperty({ description: 'User email', example: 'admin@example.com' })
  email!: string;

  @ApiPropertyOptional({
    description: 'User name',
    example: 'Admin User',
    nullable: true,
  })
  name?: string | null;
}

class TaskInfo {
  @ApiProperty({ description: 'Task ID', example: 'clxyz1234abcd5678efgh9012' })
  id!: string;

  @ApiProperty({ description: 'Task title', example: 'Complete project setup' })
  title!: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Initialize project with all dependencies',
  })
  description!: string;

  @ApiProperty({ description: 'Task status', example: 'IN_PROGRESS' })
  status!: string;

  @ApiProperty({ description: 'Task priority', example: 'HIGH' })
  priority!: string;

  @ApiProperty({ description: 'Task type', example: 'STANDARD' })
  type!: string;
}

class SprintTask {
  @ApiProperty({
    description: 'Sprint task ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  id!: string;

  @ApiProperty({ description: 'Task order in sprint', example: 1 })
  order!: number;

  @ApiProperty({ description: 'Task details', type: () => TaskInfo })
  task!: TaskInfo;
}

class UserInfo {
  @ApiProperty({ description: 'User ID', example: 'clxyz1234abcd5678efgh9012' })
  id!: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email!: string;

  @ApiPropertyOptional({
    description: 'User name',
    example: 'John Doe',
    nullable: true,
  })
  name?: string | null;
}

class SprintUserProgress {
  @ApiProperty({
    description: 'Progress ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  id!: string;

  @ApiProperty({ description: 'User ID', example: 'clxyz1234abcd5678efgh9012' })
  userId!: string;

  @ApiProperty({ description: 'Number of tasks completed', example: 5 })
  tasksCompleted!: number;

  @ApiProperty({ description: 'Total number of tasks', example: 10 })
  totalTasks!: number;

  @ApiPropertyOptional({
    description: 'When user started the sprint',
    example: '2024-01-15T10:30:00Z',
    nullable: true,
  })
  startedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'When user completed the sprint',
    example: '2024-01-20T14:45:00Z',
    nullable: true,
  })
  completedAt?: Date | null;

  @ApiProperty({ description: 'User details', type: () => UserInfo })
  user!: UserInfo;
}

export class SprintResponseDto {
  @ApiProperty({
    description: 'Sprint ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  id!: string;

  @ApiProperty({
    description: 'Sprint name',
    example: 'January Sprint 2024',
    maxLength: 255,
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Sprint description',
    example: 'Focus on completing high-priority features',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Sprint start date',
    example: '2024-01-15T00:00:00Z',
  })
  startDate!: Date;

  @ApiProperty({
    description: 'Sprint end date',
    example: '2024-01-29T23:59:59Z',
  })
  endDate!: Date;

  @ApiProperty({
    description: 'Sprint status',
    enum: SprintStatus,
    example: SprintStatus.ACTIVE,
  })
  status!: SprintStatus;

  @ApiProperty({
    description: 'Whether sprint is active',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'ID of user who created the sprint',
    example: 'clxyz1234abcd5678efgh9012',
  })
  createdById!: string;

  @ApiProperty({
    description: 'Timestamp when sprint was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when sprint was last updated',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Creator user details',
    type: () => CreatedByInfo,
  })
  createdBy?: CreatedByInfo;

  @ApiPropertyOptional({
    description: 'Tasks in this sprint',
    type: () => SprintTask,
    isArray: true,
  })
  tasks?: Array<SprintTask>;

  @ApiPropertyOptional({
    description: 'User progress tracking for this sprint',
    type: () => SprintUserProgress,
    isArray: true,
  })
  progress?: Array<SprintUserProgress>;
}
