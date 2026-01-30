import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TaskCategory } from '../../shared/types/index.js';

export class TaskCategoryResponseDto implements TaskCategory {
  @ApiProperty({
    description: 'Task category ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  id!: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Development',
    maxLength: 255,
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Software development and coding tasks',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Timestamp when category was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when category was last updated',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt!: Date;
}
