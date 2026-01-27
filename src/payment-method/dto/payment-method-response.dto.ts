import { PaymentMethodType } from '../../types/index.js';

export class PaymentMethodResponseDto {
  id!: string;
  userId!: string;
  type!: PaymentMethodType;
  provider!: string | null;
  accountInfo!: string;
  isDefault!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
