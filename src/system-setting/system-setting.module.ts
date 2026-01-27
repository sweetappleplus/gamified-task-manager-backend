import { Module } from '@nestjs/common';
import { SystemSettingService } from './system-setting.service.js';
import { SystemSettingController } from './system-setting.controller.js';

@Module({
  controllers: [SystemSettingController],
  providers: [SystemSettingService],
})
export class SystemSettingModule {}
