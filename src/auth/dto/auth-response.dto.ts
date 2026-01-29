import { UserRole } from '../../generated/prisma/enums.js';

export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
}
