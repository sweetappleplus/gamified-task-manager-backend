import { type TaskType } from './task.types.js';

export interface LevelConfig {
  level: number;
  xpRequired: number;
  earningMultiplier: number;
  unlockedTaskTypes: TaskType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BonusConfig {
  id: string;
  TaskType: TaskType;
  name: string;
  description?: string | null;
  bonusPercent: number;
  createdAt: Date;
  updatedAt: Date;
}
