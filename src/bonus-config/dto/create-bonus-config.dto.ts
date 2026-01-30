import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
  IsPositive,
  IsDecimal,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class CreateBonusConfigDto {
  @ApiProperty({
    description: 'Task type this bonus applies to',
    enum: TaskType,
    example: TaskType.STANDARD,
  })
  @IsNotEmpty()
  @IsEnum(TaskType)
  TaskType!: TaskType;

  @ApiProperty({
    description: 'Bonus configuration name',
    example: 'Early Completion Bonus',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the bonus',
    example: 'Additional reward for completing tasks before deadline',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Bonus percentage multiplier',
    example: '15.00',
    type: 'string',
  })
  @IsNotEmpty()
  @IsDecimal()
  @IsPositive()
  bonusPercent!: Decimal;
}
