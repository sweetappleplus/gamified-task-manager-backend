import { API_STATUSES, LOG_LEVELS } from '../consts/index.js';

export type ApiStatus = (typeof API_STATUSES)[keyof typeof API_STATUSES];
export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];