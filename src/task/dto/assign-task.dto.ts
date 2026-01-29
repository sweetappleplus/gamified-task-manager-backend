import { IsNotEmpty, IsString } from 'class-validator';

export class AssignTaskDto {
  @IsNotEmpty()
  @IsString()
  assignedUserId!: string;
}
