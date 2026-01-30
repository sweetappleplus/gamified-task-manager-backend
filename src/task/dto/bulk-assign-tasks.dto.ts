import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsString } from 'class-validator';

export class BulkAssignTasksDto {
  @ApiProperty({
    description: 'Array of task IDs to assign',
    example: ['clxyz123456789abcdef', 'clxyz987654321zyxwvu'],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  taskIds!: string[];

  @ApiProperty({
    description: 'Array of worker IDs to assign tasks to (tasks distributed round-robin)',
    example: ['clxyz111222333444555', 'clxyz666777888999000'],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  workerIds!: string[];
}
