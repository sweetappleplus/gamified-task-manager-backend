import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LedgerType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class CreateLedgerEntryDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsEnum(LedgerType)
  type!: LedgerType;

  @IsNotEmpty()
  @IsDecimal()
  amount!: Decimal;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  description?: string;

  @IsOptional()
  @IsString()
  relatedTaskId?: string;
}
