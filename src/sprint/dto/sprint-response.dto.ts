import { SprintStatus } from '../../generated/prisma/enums.js';

export class SprintResponseDto {
  id!: string;
  name!: string;
  description?: string | null;
  startDate!: Date;
  endDate!: Date;
  status!: SprintStatus;
  isActive!: boolean;
  createdById!: string;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy?: {
    id: string;
    email: string;
    name?: string | null;
  };
  tasks?: Array<{
    id: string;
    order: number;
    task: {
      id: string;
      title: string;
      description: string;
      status: string;
      priority: string;
      type: string;
    };
  }>;
  progress?: Array<{
    id: string;
    userId: string;
    tasksCompleted: number;
    totalTasks: number;
    startedAt?: Date | null;
    completedAt?: Date | null;
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
  }>;
}
