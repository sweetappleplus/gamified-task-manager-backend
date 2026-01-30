import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSystemSettingDto {
  @ApiPropertyOptional({
    description: 'Setting value',
    example: '50',
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({
    description: 'Setting description',
    example: 'Maximum number of tasks a user can have assigned at once',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
