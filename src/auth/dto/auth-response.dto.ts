import { User } from '../../modules/types/index.js';

export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: User;
}
