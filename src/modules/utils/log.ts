import chalk from 'chalk';
import { LOG_LEVELS } from '../consts/index.js';
import { LogMessage } from '../types/index.js';

export const log = ({
  message,
  level = LOG_LEVELS.DEBUG,
  datetime = new Date(),
}: LogMessage) => {
  const logMessage = `${datetime.toISOString()}: ${level}: ${message}`;
  switch (level) {
    case LOG_LEVELS.SUCCESS:
      console.log(chalk.green(logMessage));
      break;
    case LOG_LEVELS.INFO:
      console.log(chalk.blue(logMessage));
      break;
    case LOG_LEVELS.WARNING:
      console.log(chalk.yellow(logMessage));
      break;
    case LOG_LEVELS.ERROR:
      console.log(chalk.red(logMessage));
      break;
    case LOG_LEVELS.CRITICAL:
      console.log(chalk.redBright(logMessage));
      break;
    case LOG_LEVELS.DEBUG:
      console.log(chalk.gray(logMessage));
      break;
    default:
      console.log(logMessage);
      break;
  }
};
