import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../../generated/prisma/enums.js';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'User ID who receives this notification',
    example: 'clxyz1234abcd5678efgh9012',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.TASK_ASSIGNED,
  })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'New task assigned',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Notification message content',
    example: 'You have been assigned a new task: Complete project setup',
    maxLength: 1024,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  message!: string;

  @ApiPropertyOptional({
    description: 'Related task ID if applicable',
    example: 'clxyz1234abcd5678efgh9012',
  })
  @IsOptional()
  @IsString()
  relatedTaskId?: string;
}
