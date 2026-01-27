import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSystemSettingDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
