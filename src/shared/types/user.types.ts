import { UserRole } from '../../generated/prisma/enums.js';

export interface CurrentUserData {
  userId: string;
  email: string;
  role: UserRole;
}

export interface RequestWithUserDecorator extends Request {
  user: CurrentUserData;
}

export interface RequestWithUserGuard extends Request {
  user?: CurrentUserData;
}
