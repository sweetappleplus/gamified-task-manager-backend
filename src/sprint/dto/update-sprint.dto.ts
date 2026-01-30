import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SprintStatus } from '../../generated/prisma/enums.js';

export class UpdateSprintDto {
  @ApiPropertyOptional({
    description: 'Sprint name',
    example: 'January Sprint 2024',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Sprint description',
    example: 'Focus on completing high-priority features',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Sprint start date (ISO 8601 format)',
    example: '2024-01-15T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Sprint end date (ISO 8601 format)',
    example: '2024-01-29T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Sprint status',
    enum: SprintStatus,
    example: SprintStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @ApiPropertyOptional({
    description: 'Whether sprint is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
