import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSprintDto {
  @ApiProperty({
    description: 'Sprint name',
    example: 'January Sprint 2024',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    description: 'Sprint description',
    example: 'Focus on completing high-priority features',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Sprint start date (ISO 8601 format)',
    example: '2024-01-15T00:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'Sprint end date (ISO 8601 format)',
    example: '2024-01-29T23:59:59Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate!: string;
}
