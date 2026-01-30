import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty({
    description: 'ID of the worker to assign this task to',
    example: 'clxyz123456789abcdef',
  })
  @IsNotEmpty()
  @IsString()
  assignedUserId!: string;
}
