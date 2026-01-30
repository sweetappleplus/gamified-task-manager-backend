import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SprintStatus } from '../../generated/prisma/enums.js';

export class SprintFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by sprint status',
    enum: SprintStatus,
    example: SprintStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by creator user ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  @IsOptional()
  @IsString()
  createdById?: string;
}
