import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSystemSettingDto {
  @ApiProperty({
    description: 'Setting key (unique identifier)',
    example: 'max_tasks_per_user',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  key!: string;

  @ApiProperty({
    description: 'Setting value',
    example: '50',
  })
  @IsNotEmpty()
  @IsString()
  value!: string;

  @ApiPropertyOptional({
    description: 'Setting description',
    example: 'Maximum number of tasks a user can have assigned at once',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
