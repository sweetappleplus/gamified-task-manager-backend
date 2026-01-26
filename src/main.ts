import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module.js';
import { LOG_LEVELS, PORT } from './consts/index.js';
import { log } from './utils/index.js';

if (!PORT) {
  log('PORT is not set in the environment variables', LOG_LEVELS.CRITICAL);
  throw new Error('PORT is not set in the environment variables');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  await app.listen(Number(PORT));
  log(`Application is running on: http://localhost:${PORT}`, LOG_LEVELS.SUCCESS);
}
void bootstrap();
