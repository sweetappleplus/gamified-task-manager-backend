import { type TaskType } from './task.types.js';

export interface LevelConfig {
  level: number;
  xpRequired: number;
  earningMultiplier: number;
  unlockedTaskTypes: TaskType[];
  createdAt: Date;
  updatedAt: Date;
}
