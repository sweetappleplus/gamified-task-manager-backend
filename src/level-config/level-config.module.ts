import { Module } from '@nestjs/common';
import { LevelConfigService } from './level-config.service.js';
import { LevelConfigController } from './level-config.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [LevelConfigController],
  providers: [LevelConfigService, PrismaService],
  exports: [LevelConfigService],
})
export class LevelConfigModule {}
