import { IsBoolean, IsNotEmpty } from 'class-validator';

export class DeactivateUserDto {
  @IsNotEmpty()
  @IsBoolean()
  isActive!: boolean;
}
