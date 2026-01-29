import { Module } from '@nestjs/common';
import { TaskService } from './task.service.js';
import { TaskController } from './task.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [TaskController],
  providers: [TaskService, PrismaService],
  exports: [TaskService],
})
export class TaskModule {}
