import type { BonusConfig, TaskType } from '../../shared/types/index.js';

export class BonusConfigResponseDto implements BonusConfig {
  id!: string;
  TaskType!: TaskType;
  name!: string;
  description!: string | null;
  bonusPercent!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
