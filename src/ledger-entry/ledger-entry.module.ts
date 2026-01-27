import { Module } from '@nestjs/common';
import { LedgerEntryService } from './ledger-entry.service.js';
import { LedgerEntryController } from './ledger-entry.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [LedgerEntryController],
  providers: [LedgerEntryService, PrismaService],
})
export class LedgerEntryModule {}
