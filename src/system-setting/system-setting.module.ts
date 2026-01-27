import { Module } from '@nestjs/common';
import { SystemSettingService } from './system-setting.service.js';
import { SystemSettingController } from './system-setting.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [SystemSettingController],
  providers: [SystemSettingService, PrismaService],
})
export class SystemSettingModule {}
