import { ApiProperty } from '@nestjs/swagger';
import { type TaskType } from '../../generated/prisma/enums.js';
import type { LevelConfig } from '../../shared/types/index.js';
import { Decimal } from '@prisma/client/runtime/client';

export class LevelConfigResponseDto implements LevelConfig {
  @ApiProperty({
    description: 'User level number',
    example: 5,
  })
  level!: number;

  @ApiProperty({
    description: 'Total XP required to reach this level',
    example: 5000,
  })
  xpRequired!: number;

  @ApiProperty({
    description: 'Earning multiplier for this level',
    example: '1.25',
    type: 'string',
  })
  earningMultiplier!: Decimal;

  @ApiProperty({
    description: 'Task types unlocked at this level',
    enum: ['STANDARD', 'HIGH_VALUE', 'PREMIUM'],
    isArray: true,
    example: ['STANDARD', 'HIGH_VALUE'],
  })
  unlockedTaskTypes!: Array<TaskType>;

  @ApiProperty({
    description: 'Timestamp when level config was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when level config was last updated',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt!: Date;
}
