import { UserRole } from '../../generated/prisma/enums.js';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResult extends TokenPair {
  userId: string;
  email: string;
  role: UserRole;
}
