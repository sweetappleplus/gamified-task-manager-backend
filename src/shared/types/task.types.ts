export const TASK_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export const TASK_TYPES = {
  STANDARD: 'STANDARD',
  HIGH_VALUE: 'HIGH_VALUE',
  PREMIUM: 'PREMIUM',
} as const;

export const TASK_STATUSES = {
  NEW: 'NEW',
  PENDING: 'PENDING',
  IN_ACTION: 'IN_ACTION',
  IN_REVIEW: 'IN_REVIEW',
  COMPLETED: 'COMPLETED',
  LATE: 'LATE',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export const SPRINT_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export interface TaskCategory {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
