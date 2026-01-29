import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaymentMethodType } from '../../generated/prisma/enums.js';

export class CreatePaymentMethodDto {
  @IsNotEmpty()
  @IsEnum(PaymentMethodType)
  type!: PaymentMethodType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  provider?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  accountInfo!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
