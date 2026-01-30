import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeactivateUserDto {
  @ApiProperty({
    description: 'Set user active status (true = activate, false = deactivate)',
    example: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  isActive!: boolean;
}
