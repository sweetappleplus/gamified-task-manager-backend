import {
  IsArray,
  ArrayNotEmpty,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsEnum,
  IsDecimal,
} from 'class-validator';
import { TaskType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class CreateLevelConfigDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  level!: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  xpRequired!: number;

  @IsNotEmpty()
  @IsDecimal()
  earningMultiplier!: Decimal;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(TaskType, { each: true })
  unlockedTaskTypes!: Array<TaskType>;
}
