import { NotificationType } from '../../generated/prisma/enums.js';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedTaskId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
