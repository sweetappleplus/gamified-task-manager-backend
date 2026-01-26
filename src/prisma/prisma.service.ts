import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { DATABASE_URL, LOG_LEVELS } from '../consts/index.js';
import { log } from '../utils/index.js';

if (!DATABASE_URL) {
  log('DATABASE_URL is not set in the environment variables', LOG_LEVELS.CRITICAL);
  throw new Error('DATABASE_URL is not set in the environment variables');
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
