import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { TaskCategoryModule } from '../task-category/task-category.module.js';
import { SystemSettingModule } from '../system-setting/system-setting.module.js';
import { LevelConfigModule } from '../level-config/level-config.module.js';
import { PaymentMethodModule } from '../payment-method/payment-method.module.js';
import { BonusConfigModule } from '../bonus-config/bonus-config.module.js';
import { NotificationModule } from '../notification/notification.module.js';
import { LedgerEntryModule } from '../ledger-entry/ledger-entry.module.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';

@Module({
  imports: [
    AuthModule,
    TaskCategoryModule,
    SystemSettingModule,
    LevelConfigModule,
    PaymentMethodModule,
    BonusConfigModule,
    NotificationModule,
    LedgerEntryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
