import type { LedgerEntry, LedgerType } from '../../types/index.js';

export class LedgerEntryResponseDto implements LedgerEntry {
  id!: string;
  userId!: string;
  type!: LedgerType;
  amount!: number;
  description!: string | null;
  relatedTaskId!: string | null;
  createdAt!: Date;
}
