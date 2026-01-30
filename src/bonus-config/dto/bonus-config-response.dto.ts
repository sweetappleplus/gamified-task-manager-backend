import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/client';
import { TaskType } from '../../generated/prisma/enums.js';
import type { BonusConfig } from '../../shared/types/index.js';

export class BonusConfigResponseDto implements BonusConfig {
  @ApiProperty({
    description: 'Bonus configuration ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  id!: string;

  @ApiProperty({
    description: 'Task type this bonus applies to',
    enum: TaskType,
    example: TaskType.STANDARD,
  })
  TaskType!: TaskType;

  @ApiProperty({
    description: 'Bonus configuration name',
    example: 'Early Completion Bonus',
    maxLength: 255,
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the bonus',
    example: 'Additional reward for completing tasks before deadline',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Bonus percentage multiplier',
    example: '15.00',
    type: 'string',
  })
  bonusPercent!: Decimal;

  @ApiProperty({
    description: 'Timestamp when bonus config was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when bonus config was last updated',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt!: Date;
}
