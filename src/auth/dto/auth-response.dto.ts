import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/enums.js';

class UserInfo {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 'clxyz123456789abcdef',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
    required: false,
    nullable: true,
  })
  name?: string | null;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.WORKER,
  })
  role!: UserRole;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for API authentication (expires in 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT refresh token for obtaining new access tokens (expires in 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Authenticated user information',
    type: UserInfo,
  })
  user!: UserInfo;
}
