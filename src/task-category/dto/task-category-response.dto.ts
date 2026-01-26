export class TaskCategoryResponseDto {
  id!: string;
  name!: string;
  description?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
