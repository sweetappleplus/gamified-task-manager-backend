import {
  IsArray,
  IsDecimal,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class UpdateLevelConfigDto {
  @ApiPropertyOptional({
    description: 'Total XP required to reach this level',
    example: 5000,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  xpRequired?: number;

  @ApiPropertyOptional({
    description: 'Earning multiplier for this level',
    example: '1.25',
    type: 'string',
  })
  @IsOptional()
  @IsDecimal()
  earningMultiplier?: Decimal;

  @ApiPropertyOptional({
    description: 'Task types unlocked at this level',
    enum: TaskType,
    isArray: true,
    example: ['STANDARD', 'HIGH_VALUE'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TaskType, { each: true })
  unlockedTaskTypes?: Array<TaskType>;
}
