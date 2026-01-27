import { TaskType } from '../../types/index.js';

export class LevelConfigResponseDto {
  level!: number;
  xpRequired!: number;
  earningMultiplier!: number;
  unlockedTaskTypes!: TaskType[];
  createdAt!: Date;
  updatedAt!: Date;
}
