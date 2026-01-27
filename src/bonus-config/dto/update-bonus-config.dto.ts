import {
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { TASK_TYPES, type TaskType } from '../../shared/types/index.js';

export class UpdateBonusConfigDto {
  @IsOptional()
  @IsIn(Object.values(TASK_TYPES), {
    message: `TaskType must be one of: ${Object.values(TASK_TYPES).join(', ')}`,
  })
  TaskType?: TaskType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'bonusPercent must be a valid number' },
  )
  @IsPositive()
  bonusPercent?: number;
}
