import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { SprintStatus } from '../../generated/prisma/enums.js';

export class UpdateSprintDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
