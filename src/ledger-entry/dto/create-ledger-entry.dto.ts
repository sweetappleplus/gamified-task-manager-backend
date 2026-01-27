import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LEDGER_TYPES, type LedgerType } from '../../types/index.js';

export class CreateLedgerEntryDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsIn(Object.values(LEDGER_TYPES), {
    message: `type must be one of: ${Object.values(LEDGER_TYPES).join(', ')}`,
  })
  type!: LedgerType;

  @IsNotEmpty()
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'amount must be a valid number' },
  )
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  description?: string;

  @IsOptional()
  @IsString()
  relatedTaskId?: string;
}
