import { User } from '../../shared/types/index.js';

export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: User;
}
