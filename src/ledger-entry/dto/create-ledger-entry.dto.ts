import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LedgerType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class CreateLedgerEntryDto {
  @ApiProperty({
    description: 'User ID this ledger entry belongs to',
    example: 'clxyz1234abcd5678efgh9012',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty({
    description: 'Ledger entry type',
    enum: LedgerType,
    example: LedgerType.TASK_REWARD,
  })
  @IsNotEmpty()
  @IsEnum(LedgerType)
  type!: LedgerType;

  @ApiProperty({
    description: 'Transaction amount',
    example: '150.00',
    type: 'string',
  })
  @IsNotEmpty()
  @IsDecimal()
  amount!: Decimal;

  @ApiPropertyOptional({
    description: 'Description of the transaction',
    example: 'Task completion reward',
    maxLength: 1024,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  description?: string;

  @ApiPropertyOptional({
    description: 'Related task ID if applicable',
    example: 'clxyz1234abcd5678efgh9012',
  })
  @IsOptional()
  @IsString()
  relatedTaskId?: string;
}
