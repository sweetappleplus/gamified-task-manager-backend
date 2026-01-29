import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaymentMethodType } from '../../generated/prisma/enums.js';

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsEnum(PaymentMethodType)
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
