export const UserRole = {
  WORKER: 'WORKER',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export type TUserRole = (typeof UserRole)[keyof typeof UserRole];

export interface CurrentUserData {
  userId: string;
  email: string;
  role: TUserRole;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: TUserRole;
}
