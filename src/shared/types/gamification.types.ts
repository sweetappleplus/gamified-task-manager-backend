import { Decimal } from '@prisma/client/runtime/client';
import { TaskType } from '../../generated/prisma/enums.js';

export interface LevelConfig {
  level: number;
  xpRequired: number;
  earningMultiplier: Decimal;
  unlockedTaskTypes: Array<TaskType>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BonusConfig {
  id: string;
  TaskType: TaskType;
  name: string;
  description?: string | null;
  bonusPercent: Decimal;
  createdAt: Date;
  updatedAt: Date;
}
