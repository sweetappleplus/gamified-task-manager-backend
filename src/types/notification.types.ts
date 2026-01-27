export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_APPROVED: 'TASK_APPROVED',
  TASK_REJECTED: 'TASK_REJECTED',
  PAYMENT_RECORDED: 'PAYMENT_RECORDED',
  WORKER_JOINED: 'WORKER_JOINED',
  TASK_SUBMITTED: 'TASK_SUBMITTED',
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

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
