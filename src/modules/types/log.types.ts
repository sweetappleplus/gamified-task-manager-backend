import { LOG_LEVELS } from '../consts/index.js';

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

export interface LogMessage {
  message: string;
  level?: LogLevel;
  datetime?: Date;
}
