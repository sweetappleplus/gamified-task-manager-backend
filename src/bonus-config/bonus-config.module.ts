import { Module } from '@nestjs/common';
import { BonusConfigService } from './bonus-config.service.js';
import { BonusConfigController } from './bonus-config.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [BonusConfigController],
  providers: [BonusConfigService, PrismaService],
  exports: [BonusConfigService],
})
export class BonusConfigModule {}
