export const IS_PUBLIC_KEY = 'isPublic';

export const ROLES_KEY = 'roles';

export const JWT_SECRET = process.env.JWT_SECRET;

export const JWT_EXPIRATION_TIME_MINUTES =
  process.env.JWT_EXPIRATION_TIME_MINUTES;

export const ACCESS_TOKEN_EXPIRY_MINUTES =
  process.env.ACCESS_TOKEN_EXPIRY_MINUTES;

export const REFRESH_TOKEN_EXPIRY_DAYS = process.env.REFRESH_TOKEN_EXPIRY_DAYS;

export const OTP_EXPIRATION_TIME_MINUTES =
  process.env.OTP_EXPIRATION_TIME_MINUTES;

export const OTP_ATTEMPTS_MIN_DURATION_MINUTES =
  process.env.OTP_ATTEMPTS_MIN_DURATION_MINUTES;

export const SMTP_FROM = process.env.SMTP_FROM;

export const SMTP_HOST = process.env.SMTP_HOST;

export const SMTP_PORT = process.env.SMTP_PORT;

export const SMTP_USER = process.env.SMTP_USER;

export const SMTP_PASS = process.env.SMTP_PASS;
