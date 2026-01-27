import type { LevelConfig, TaskType } from '../../types/index.js';

export class LevelConfigResponseDto implements LevelConfig {
  level!: number;
  xpRequired!: number;
  earningMultiplier!: number;
  unlockedTaskTypes!: TaskType[];
  createdAt!: Date;
  updatedAt!: Date;
}
