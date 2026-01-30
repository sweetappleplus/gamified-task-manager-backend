import { IsNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTasksToSprintDto {
  @ApiProperty({
    description: 'Array of task IDs to add to the sprint',
    example: [
      'clxyz1234abcd5678efgh9012',
      'clxyz1234abcd5678efgh9013',
      'clxyz1234abcd5678efgh9014',
    ],
    isArray: true,
    type: 'string',
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  taskIds!: string[];
}
