import type { LedgerEntry } from '../../shared/types/index.js';
import { LedgerType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class LedgerEntryResponseDto implements LedgerEntry {
  id!: string;
  userId!: string;
  type!: LedgerType;
  amount!: Decimal;
  description!: string | null;
  relatedTaskId!: string | null;
  createdAt!: Date;
}
