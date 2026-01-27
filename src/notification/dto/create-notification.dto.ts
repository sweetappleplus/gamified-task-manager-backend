import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  NOTIFICATION_TYPES,
  type NotificationType,
} from '../../types/index.js';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsIn(Object.values(NOTIFICATION_TYPES), {
    message: `type must be one of: ${Object.values(NOTIFICATION_TYPES).join(', ')}`,
  })
  type!: NotificationType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  message!: string;

  @IsOptional()
  @IsString()
  relatedTaskId?: string;
}
