import type { PaymentMethod, PaymentMethodType } from '../../types/index.js';

export class PaymentMethodResponseDto implements PaymentMethod {
  id!: string;
  userId!: string;
  type!: PaymentMethodType;
  provider!: string | null;
  accountInfo!: string;
  isDefault!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
