import { API_STATUSES } from '../consts/index.js';

export type ApiStatus = (typeof API_STATUSES)[keyof typeof API_STATUSES];

export type ApiResponse<T> = {
  status: ApiStatus;
  message: string;
  timestamp: string;
  data?: T | null;
};