import { Module } from '@nestjs/common';
import { SprintService } from './sprint.service.js';
import { SprintController } from './sprint.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [SprintController],
  providers: [SprintService, PrismaService],
  exports: [SprintService],
})
export class SprintModule {}
