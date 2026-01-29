import { Decimal } from '@prisma/client/runtime/client';
import { TaskType } from '../../generated/prisma/enums.js';
import type { BonusConfig } from '../../shared/types/index.js';

export class BonusConfigResponseDto implements BonusConfig {
  id!: string;
  TaskType!: TaskType;
  name!: string;
  description!: string | null;
  bonusPercent!: Decimal;
  createdAt!: Date;
  updatedAt!: Date;
}
