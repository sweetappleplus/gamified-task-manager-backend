import { Decimal } from '@prisma/client/runtime/client';
import { LedgerType, PaymentMethodType } from '../../generated/prisma/enums.js';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  provider?: string | null;
  accountInfo: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  type: LedgerType;
  amount: Decimal;
  description?: string | null;
  relatedTaskId?: string | null;
  createdAt: Date;
}
