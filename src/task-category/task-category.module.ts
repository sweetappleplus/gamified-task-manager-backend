import { Module } from '@nestjs/common';
import { TaskCategoryService } from './task-category.service.js';
import { TaskCategoryController } from './task-category.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [TaskCategoryController],
  providers: [TaskCategoryService, PrismaService],
  exports: [TaskCategoryService],
})
export class TaskCategoryModule {}
