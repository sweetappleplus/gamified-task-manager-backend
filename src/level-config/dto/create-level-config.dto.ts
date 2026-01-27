import {
  IsArray,
  ArrayNotEmpty,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsIn,
} from 'class-validator';
import { TASK_TYPES, TaskType } from '../../shared/types/index.js';

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
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'earningMultiplier must be a valid number' },
  )
  @IsPositive()
  earningMultiplier!: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(Object.values(TASK_TYPES), {
    each: true,
    message: `Each unlocked task type must be one of: ${Object.values(TASK_TYPES).join(', ')}`,
  })
  unlockedTaskTypes!: TaskType[];
}
