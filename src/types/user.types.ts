export const UserRole = {
  WORKER: 'WORKER',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface CurrentUserData {
  userId: string;
  email: string;
  role: UserRole;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}
