import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
  IsPositive,
  IsDecimal,
} from 'class-validator';
import { TaskType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class CreateBonusConfigDto {
  @IsNotEmpty()
  @IsEnum(TaskType)
  TaskType!: TaskType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDecimal()
  @IsPositive()
  bonusPercent!: Decimal;
}
