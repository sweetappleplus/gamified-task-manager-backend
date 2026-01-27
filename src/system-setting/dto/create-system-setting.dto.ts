import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSystemSettingDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  key!: string;

  @IsNotEmpty()
  @IsString()
  value!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
