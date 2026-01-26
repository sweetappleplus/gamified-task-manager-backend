export class TaskCategoryResponseDto {
  id!: string;
  name!: string;
  description?: string | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
