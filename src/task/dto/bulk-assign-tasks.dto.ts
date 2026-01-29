import { IsArray, ArrayMinSize, IsString } from 'class-validator';

export class BulkAssignTasksDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  taskIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  workerIds!: string[];
}
