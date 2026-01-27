import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  PAYMENT_METHOD_TYPES,
  type PaymentMethodType,
} from '../../types/index.js';

export class CreatePaymentMethodDto {
  @IsNotEmpty()
  @IsEnum(Object.values(PAYMENT_METHOD_TYPES))
  type!: PaymentMethodType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  provider?: string;

  // This can hold account number, wallet address, etc.
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  accountInfo!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
