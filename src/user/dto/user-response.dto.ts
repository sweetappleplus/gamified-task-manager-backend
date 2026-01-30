import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/client';
import { UserRole } from '../../generated/prisma/enums.js';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
    nullable: true,
  })
  name!: string | null;

  @ApiPropertyOptional({
    description: 'URL to user avatar image',
    example: 'https://example.com/avatars/user123.jpg',
    nullable: true,
  })
  avatarUrl!: string | null;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.WORKER,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  isActive!: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp of last login',
    example: '2024-01-20T14:45:00Z',
    nullable: true,
  })
  lastLoginAt!: Date | null;

  @ApiProperty({
    description: 'Total earnings accumulated',
    example: '1250.50',
    type: 'string',
  })
  earning!: Decimal;

  @ApiProperty({
    description: 'Current account balance',
    example: '850.25',
    type: 'string',
  })
  balance!: Decimal;

  @ApiProperty({
    description: 'Timestamp when user was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when user was last updated',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt!: Date;
}
