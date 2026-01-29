import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { NotificationType } from '../../generated/prisma/enums.js';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
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
