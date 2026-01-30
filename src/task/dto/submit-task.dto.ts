import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitTaskDto {
  @ApiProperty({
    description: 'URL to the proof of work (screenshot, document, video, etc.)',
    example: 'https://example.com/uploads/proof-screenshot.png',
    format: 'uri',
  })
  @IsNotEmpty()
  @IsString()
  proofUrl!: string;

  @ApiPropertyOptional({
    description: 'Additional comments or notes about the submission',
    example: 'Completed all requirements. Please review the design mockup.',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
