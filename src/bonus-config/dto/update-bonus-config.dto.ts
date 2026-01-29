import {
  IsOptional,
  IsString,
  MaxLength,
  IsPositive,
  IsEnum,
  IsDecimal,
} from 'class-validator';
import { TaskType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class UpdateBonusConfigDto {
  @IsOptional()
  @IsEnum(TaskType)
  TaskType?: TaskType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDecimal()
  @IsPositive()
  bonusPercent?: Decimal;
}
