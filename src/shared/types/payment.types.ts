import { Decimal } from '@prisma/client/runtime/client';
import { LedgerType, PaymentMethodType } from '../../generated/prisma/enums.js';

export const PAYMENT_METHOD_TYPES = {
  BANK_ACCOUNT: 'BANK_ACCOUNT',
  PAYPAL: 'PAYPAL',
  CRYPTO: 'CRYPTO',
  CARD: 'CARD',
} as const;

export const LEDGER_TYPES = {
  TASK_REWARD: 'TASK_REWARD',
  BONUS: 'BONUS',
  ADJUSTMENT: 'ADJUSTMENT',
  WITHDRAWAL: 'WITHDRAWAL',
} as const;

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
