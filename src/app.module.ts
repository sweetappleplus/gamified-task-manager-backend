import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';
import { UserService } from './user/user.service.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, UserService],
})
export class AppModule {}
