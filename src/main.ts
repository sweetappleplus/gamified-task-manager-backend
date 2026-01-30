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
      `
      Comprehensive API documentation for the Gamified Task Manager system.

      ## Features
      - **Authentication**: OTP-based passwordless authentication with JWT tokens
      - **Task Management**: Full CRUD operations with status workflow tracking
      - **Gamification**: XP levels, bonuses, and earning multipliers
      - **Role-Based Access**: SUPER_ADMIN and WORKER roles with different permissions
      - **Payment System**: Track task payments and manage worker earnings
      - **Notifications**: Real-time notifications for task updates and system events
      - **Bulk Operations**: Mass task creation and assignment capabilities

      ## Task Workflow
      NEW → PENDING → IN_ACTION → IN_REVIEW → COMPLETED → PAID

      ## Authentication
      All protected endpoints require a valid JWT token in the Authorization header.
      Use the /auth/verify-otp endpoint to obtain your access token.
      `,
    )
    .setVersion('1.0')
    .setContact(
      'Backend Team',
      'https://github.com/yourusername/gamified-task-manager',
      'support@gamified-task-manager.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
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
    .addTag('Tasks', 'Task CRUD operations, assignment, and workflow management')
    .addTag('Users', 'User management and profile operations')
    .addTag('Categories', 'Task category management')
    .addTag('Sprints', 'Sprint planning and tracking')
    .addTag('Notifications', 'User notification management')
    .addTag('Ledger', 'Financial transactions and earning records')
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
