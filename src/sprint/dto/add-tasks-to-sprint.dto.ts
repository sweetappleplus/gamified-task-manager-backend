import { IsNotEmpty, IsArray, IsString } from 'class-validator';

export class AddTasksToSprintDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  taskIds!: string[];
}
