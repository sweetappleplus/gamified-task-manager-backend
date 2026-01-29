import { type TaskType } from '../../generated/prisma/enums.js';
import type { LevelConfig } from '../../shared/types/index.js';
import { Decimal } from '@prisma/client/runtime/client';

export class LevelConfigResponseDto implements LevelConfig {
  level!: number;
  xpRequired!: number;
  earningMultiplier!: Decimal;
  unlockedTaskTypes!: Array<TaskType>;
  createdAt!: Date;
  updatedAt!: Date;
}
