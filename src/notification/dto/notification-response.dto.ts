import { type NotificationType } from '../../generated/prisma/enums.js';
import type { Notification } from '../../shared/types/index.js';

export class NotificationResponseDto implements Notification {
  id!: string;
  userId!: string;
  type!: NotificationType;
  title!: string;
  message!: string;
  isRead!: boolean;
  relatedTaskId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
