import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskCategoryDto {
  @ApiPropertyOptional({
    description: 'Category name',
    example: 'Development',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Software development and coding tasks',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
