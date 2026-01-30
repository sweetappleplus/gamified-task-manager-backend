import {
  IsArray,
  ArrayNotEmpty,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsEnum,
  IsDecimal,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class CreateLevelConfigDto {
  @ApiProperty({
    description: 'User level number',
    example: 5,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  level!: number;

  @ApiProperty({
    description: 'Total XP required to reach this level',
    example: 5000,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  xpRequired!: number;

  @ApiProperty({
    description: 'Earning multiplier for this level',
    example: '1.25',
    type: 'string',
  })
  @IsNotEmpty()
  @IsDecimal()
  earningMultiplier!: Decimal;

  @ApiProperty({
    description: 'Task types unlocked at this level',
    enum: TaskType,
    isArray: true,
    example: ['STANDARD', 'HIGH_VALUE'],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(TaskType, { each: true })
  unlockedTaskTypes!: Array<TaskType>;
}
