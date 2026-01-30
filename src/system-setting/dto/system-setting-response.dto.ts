import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SystemSetting } from '../../shared/types/index.js';

export class SystemSettingResponseDto implements SystemSetting {
  @ApiProperty({
    description: 'Setting key (unique identifier)',
    example: 'max_tasks_per_user',
    maxLength: 255,
  })
  key!: string;

  @ApiProperty({
    description: 'Setting value',
    example: '50',
  })
  value!: string;

  @ApiPropertyOptional({
    description: 'Setting description',
    example: 'Maximum number of tasks a user can have assigned at once',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Timestamp when setting was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when setting was last updated',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt!: Date;
}
