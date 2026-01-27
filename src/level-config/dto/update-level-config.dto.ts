import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { TASK_TYPES, TaskType } from '../../shared/types/index.js';

export class UpdateLevelConfigDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  xpRequired?: number;

  @IsOptional()
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'earningMultiplier must be a valid number' },
  )
  @IsPositive()
  earningMultiplier?: number;

  @IsOptional()
  @IsArray()
  @IsIn(Object.values(TASK_TYPES), {
    each: true,
    message: `Each unlocked task type must be one of: ${Object.values(TASK_TYPES).join(', ')}`,
  })
  unlockedTaskTypes?: TaskType[];
}
