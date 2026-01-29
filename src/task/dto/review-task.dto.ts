import { IsNotEmpty, IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReviewTaskDto {
  @IsNotEmpty()
  @IsBoolean()
  isApproved!: boolean;

  @IsOptional()
  @IsString()
  feedback?: string;
}
