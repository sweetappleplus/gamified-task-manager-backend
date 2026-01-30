import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type PaymentMethodType } from '../../generated/prisma/enums.js';
import type { PaymentMethod } from '../../shared/types/index.js';

export class PaymentMethodResponseDto implements PaymentMethod {
  @ApiProperty({
    description: 'Payment method ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  id!: string;

  @ApiProperty({
    description: 'User ID this payment method belongs to',
    example: 'clxyz1234abcd5678efgh9012',
  })
  userId!: string;

  @ApiProperty({
    description: 'Payment method type',
    enum: ['BANK_ACCOUNT', 'PAYPAL', 'CRYPTO', 'CARD'],
    example: 'BANK_ACCOUNT',
  })
  type!: PaymentMethodType;

  @ApiPropertyOptional({
    description: 'Payment provider name',
    example: 'Chase Bank',
    maxLength: 255,
    nullable: true,
  })
  provider!: string | null;

  @ApiProperty({
    description: 'Account information (encrypted)',
    example: '****1234',
    maxLength: 1024,
  })
  accountInfo!: string;

  @ApiProperty({
    description: 'Whether this is the default payment method',
    example: true,
  })
  isDefault!: boolean;

  @ApiProperty({
    description: 'Timestamp when payment method was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when payment method was last updated',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt!: Date;
}
