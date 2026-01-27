import { Module } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service.js';
import { PaymentMethodController } from './payment-method.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService, PrismaService],
})
export class PaymentMethodModule {}
