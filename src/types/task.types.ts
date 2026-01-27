export const TASK_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type TaskPriority =
  (typeof TASK_PRIORITIES)[keyof typeof TASK_PRIORITIES];

export const TASK_TYPES = {
  STANDARD: 'STANDARD',
  HIGH_VALUE: 'HIGH_VALUE',
  PREMIUM: 'PREMIUM',
} as const;

export type TaskType = (typeof TASK_TYPES)[keyof typeof TASK_TYPES];

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

export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];

export const SPRINT_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type SprintStatus =
  (typeof SPRINT_STATUSES)[keyof typeof SPRINT_STATUSES];
