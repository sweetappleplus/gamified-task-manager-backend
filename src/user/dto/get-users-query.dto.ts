import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { UserRole } from '../../generated/prisma/enums.js';

export class GetUsersQueryDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
