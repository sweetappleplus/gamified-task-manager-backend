import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { DATABASE_URL, LOG_LEVELS } from '../modules/consts/index.js';
import { log } from '../modules/utils/index.js';

if (!DATABASE_URL) {
  log({
    message: 'DATABASE_URL is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'DATABASE_URL is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: DATABASE_URL,
    });
    super({ adapter });
  }
}
