export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResult extends TokenPair {
  userId: string;
  email: string;
  role: string;
}
