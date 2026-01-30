import {
  IsOptional,
  IsString,
  MaxLength,
  IsPositive,
  IsEnum,
  IsDecimal,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class UpdateBonusConfigDto {
  @ApiPropertyOptional({
    description: 'Task type this bonus applies to',
    enum: TaskType,
    example: TaskType.STANDARD,
  })
  @IsOptional()
  @IsEnum(TaskType)
  TaskType?: TaskType;

  @ApiPropertyOptional({
    description: 'Bonus configuration name',
    example: 'Early Completion Bonus',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the bonus',
    example: 'Additional reward for completing tasks before deadline',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Bonus percentage multiplier',
    example: '15.00',
    type: 'string',
  })
  @IsOptional()
  @IsDecimal()
  @IsPositive()
  bonusPercent?: Decimal;
}
