export const PORT = process.env.PORT;

export const API_STATUSES = {
  SUCCESS: 'success',
  FAILURE: 'failure',
} as const;

export const IS_PUBLIC_KEY = 'isPublic';

export const ROLES_KEY = 'roles';

export const JWT_SECRET = process.env.JWT_SECRET;

export const JWT_EXPIRATION_TIME_MINUTES = process.env.JWT_EXPIRATION_TIME_MINUTES;
