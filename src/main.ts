import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app/app.module.js';
import { LOG_LEVELS, PORT } from './shared/consts/index.js';
import { log } from './shared/utils/index.js';

if (!PORT) {
  log({
    message: 'PORT is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'PORT is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Serve static files
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(Number(PORT));
  log({
    message: `Application is running on: http://localhost:${PORT}`,
    level: LOG_LEVELS.SUCCESS,
  });
}
void bootstrap();
