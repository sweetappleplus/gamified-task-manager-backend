import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module.js';
import { PORT } from './consts/index.js';

if (!PORT) {
  throw new Error("PORT is not set in the environment variables");
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Number(PORT));
}
bootstrap();
