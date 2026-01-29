import {
  IsArray,
  IsDecimal,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { TaskType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class UpdateLevelConfigDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  xpRequired?: number;

  @IsOptional()
  @IsDecimal()
  earningMultiplier?: Decimal;

  @IsOptional()
  @IsArray()
  @IsEnum(TaskType, { each: true })
  unlockedTaskTypes?: Array<TaskType>;
}
