import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  PAYMENT_METHOD_TYPES,
  type PaymentMethodType,
} from '../../shared/types/index.js';

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsEnum(Object.values(PAYMENT_METHOD_TYPES))
  type?: PaymentMethodType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  provider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  accountInfo?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
