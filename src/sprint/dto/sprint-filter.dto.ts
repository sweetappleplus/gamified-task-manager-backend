import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { SprintStatus } from '../../generated/prisma/enums.js';

export class SprintFilterDto {
  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  createdById?: string;
}
