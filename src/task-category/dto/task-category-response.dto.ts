import type { TaskCategory } from '../../types/index.js';

export class TaskCategoryResponseDto implements TaskCategory {
  id!: string;
  name!: string;
  description!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
