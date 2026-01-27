import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { TASK_TYPES, type TaskType } from '../../types/index.js';

export class CreateBonusConfigDto {
  @IsNotEmpty()
  @IsIn(Object.values(TASK_TYPES), {
    message: `TaskType must be one of: ${Object.values(TASK_TYPES).join(', ')}`,
  })
  TaskType!: TaskType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'bonusPercent must be a valid number' },
  )
  @IsPositive()
  bonusPercent!: number;
}
