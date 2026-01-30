import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReviewTaskDto {
  @ApiProperty({
    description: 'Whether the task is approved or rejected',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isApproved!: boolean;

  @ApiPropertyOptional({
    description: 'Feedback or comments for the worker about the submission',
    example: 'Great work! The design meets all requirements.',
  })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({
    description:
      'If true and rejected, task returns to IN_ACTION status instead of FAILED',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  returnToInAction?: boolean;
}
