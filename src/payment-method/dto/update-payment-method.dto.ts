import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodType } from '../../generated/prisma/enums.js';

export class UpdatePaymentMethodDto {
  @ApiPropertyOptional({
    description: 'Payment method type',
    enum: PaymentMethodType,
    example: PaymentMethodType.BANK_ACCOUNT,
  })
  @IsOptional()
  @IsEnum(PaymentMethodType)
  type?: PaymentMethodType;

  @ApiPropertyOptional({
    description: 'Payment provider name',
    example: 'Chase Bank',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  provider?: string;

  @ApiPropertyOptional({
    description: 'Account information',
    example: 'Account ending in 1234',
    maxLength: 1024,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  accountInfo?: string;

  @ApiPropertyOptional({
    description: 'Set as default payment method',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
