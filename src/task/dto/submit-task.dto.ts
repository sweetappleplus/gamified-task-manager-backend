import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitTaskDto {
  @IsNotEmpty()
  @IsString()
  proofUrl!: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
