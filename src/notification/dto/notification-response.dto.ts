import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type NotificationType } from '../../generated/prisma/enums.js';
import type { Notification } from '../../shared/types/index.js';

export class NotificationResponseDto implements Notification {
  @ApiProperty({
    description: 'Notification ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  id!: string;

  @ApiProperty({
    description: 'User ID who receives this notification',
    example: 'clxyz1234abcd5678efgh9012',
  })
  userId!: string;

  @ApiProperty({
    description: 'Notification type',
    enum: [
      'TASK_ASSIGNED',
      'TASK_APPROVED',
      'TASK_REJECTED',
      'LEVEL_UP',
      'ACHIEVEMENT',
      'SYSTEM',
    ],
    example: 'TASK_ASSIGNED',
  })
  type!: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'New task assigned',
    maxLength: 255,
  })
  title!: string;

  @ApiProperty({
    description: 'Notification message content',
    example: 'You have been assigned a new task: Complete project setup',
    maxLength: 1024,
  })
  message!: string;

  @ApiProperty({
    description: 'Whether notification has been read',
    example: false,
  })
  isRead!: boolean;

  @ApiPropertyOptional({
    description: 'Related task ID if applicable',
    example: 'clxyz1234abcd5678efgh9012',
    nullable: true,
  })
  relatedTaskId!: string | null;

  @ApiProperty({
    description: 'Timestamp when notification was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when notification was last updated',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt!: Date;
}
