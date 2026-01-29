export class SprintProgressResponseDto {
  id!: string;
  sprintId!: string;
  userId!: string;
  tasksCompleted!: number;
  totalTasks!: number;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
  sprint?: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: string;
  };
  user?: {
    id: string;
    email: string;
    name?: string | null;
  };
}
