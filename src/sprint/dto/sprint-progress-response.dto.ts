import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SprintInfo {
  @ApiProperty({ description: 'Sprint ID', example: 'clxyz1234abcd5678efgh9012' })
  id!: string;

  @ApiProperty({ description: 'Sprint name', example: 'January Sprint 2024' })
  name!: string;

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

  @ApiProperty({ description: 'Sprint status', example: 'ACTIVE' })
  status!: string;
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

export class SprintProgressResponseDto {
  @ApiProperty({
    description: 'Sprint progress ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  id!: string;

  @ApiProperty({
    description: 'Sprint ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  sprintId!: string;

  @ApiProperty({
    description: 'User ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  userId!: string;

  @ApiProperty({
    description: 'Number of tasks completed by user',
    example: 5,
  })
  tasksCompleted!: number;

  @ApiProperty({
    description: 'Total number of tasks assigned to user',
    example: 10,
  })
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

  @ApiProperty({
    description: 'Timestamp when progress was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when progress was last updated',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Sprint details',
    type: () => SprintInfo,
  })
  sprint?: SprintInfo;

  @ApiPropertyOptional({
    description: 'User details',
    type: () => UserInfo,
  })
  user?: UserInfo;
}
