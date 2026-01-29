import {
  TaskPriority,
  TaskType,
  TaskStatus,
} from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class TaskResponseDto {
  id!: string;
  title!: string;
  description!: string;
  steps?: string | null;
  priority!: TaskPriority;
  type!: TaskType;
  budget!: Decimal;
  commissionPercent!: Decimal;
  timeToCompleteMin!: number;
  deadline?: Date | null;
  maxSubmissionDelayMin?: number | null;
  status!: TaskStatus;
  startedAt?: Date | null;
  submittedAt?: Date | null;
  completedAt?: Date | null;
  createdById!: string;
  assignedUserId?: string | null;
  categoryId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  category?: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
  createdBy?: {
    id: string;
    email: string;
    name?: string | null;
  };
}
