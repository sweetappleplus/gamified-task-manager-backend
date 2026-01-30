import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Gamified Task Manager API')
    .setDescription(
      'Comprehensive REST API for a gamified task management system with rewards, levels, and sprint tracking',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token obtained from /auth/verify-otp endpoint',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'OTP-based authentication and token management')
    .addTag(
      'Tasks',
      'Task CRUD operations, assignment, submission, and workflow management',
    )
    .addTag('Users', 'User management, profile operations, and avatar uploads')
    .addTag('Categories', 'Task category management and organization')
    .addTag('Sprints', 'Sprint planning, tracking, and progress monitoring')
    .addTag('Notifications', 'User notification management and delivery')
    .addTag('Ledger', 'Financial transactions, earnings, and payment records')
    .addTag(
      'Payment Methods',
      'User payment method configuration and management',
    )
    .addTag(
      'Bonus Configuration',
      'Task bonus configuration and reward multipliers',
    )
    .addTag('Level Configuration', 'User level progression and XP requirements')
    .addTag('System Settings', 'Application-wide system configuration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
    customSiteTitle: 'Gamified Task Manager API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .information-container { margin: 50px 0 }
    `,
  });

  await app.listen(Number(PORT));
  log({
    message: `Application is running on: http://localhost:${PORT}`,
    level: LOG_LEVELS.SUCCESS,
  });
}
void bootstrap();
