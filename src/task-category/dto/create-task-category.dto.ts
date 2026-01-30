import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Development',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Software development and coding tasks',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
