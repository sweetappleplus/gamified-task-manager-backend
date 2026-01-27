export const PAYMENT_METHOD_TYPES = {
  BANK_ACCOUNT: 'BANK_ACCOUNT',
  PAYPAL: 'PAYPAL',
  CRYPTO: 'CRYPTO',
  CARD: 'CARD',
} as const;

export type PaymentMethodType =
  (typeof PAYMENT_METHOD_TYPES)[keyof typeof PAYMENT_METHOD_TYPES];

export const LEDGER_TYPES = {
  TASK_REWARD: 'TASK_REWARD',
  BONUS: 'BONUS',
  ADJUSTMENT: 'ADJUSTMENT',
  WITHDRAWAL: 'WITHDRAWAL',
} as const;

export type LedgerType = (typeof LEDGER_TYPES)[keyof typeof LEDGER_TYPES];

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
