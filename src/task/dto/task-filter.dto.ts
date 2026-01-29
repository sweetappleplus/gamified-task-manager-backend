import { IsOptional, IsEnum, IsString } from 'class-validator';
import { TaskStatus, TaskPriority, TaskType } from '../../generated/prisma/enums.js';

export class TaskFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  createdById?: string;
}
