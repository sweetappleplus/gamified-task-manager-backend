import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLedgerEntryDto, LedgerEntryResponseDto } from './dto/index.js';
import { ApiResponse, LEDGER_TYPES } from '../shared/types/index.js';
import { API_STATUSES, LOG_LEVELS } from '../shared/consts/index.js';
import { log } from '../shared/utils/index.js';
import { LedgerType } from '../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class LedgerEntryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    payload: CreateLedgerEntryDto,
  ): Promise<ApiResponse<LedgerEntryResponseDto>> {
    try {
      const ledgerEntry = await this.prisma.ledgerEntry.create({
        data: {
          userId: payload.userId,
          type: payload.type,
          amount: payload.amount,
          description: payload.description,
          relatedTaskId: payload.relatedTaskId,
        },
      });

      log({
        message: `Ledger entry created for user ${payload.userId} (${payload.type})`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Ledger entry created successfully',
        data: ledgerEntry,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error creating ledger entry: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async findAllForUser(
    userId: string,
    type?: LedgerType,
  ): Promise<ApiResponse<LedgerEntryResponseDto[]>> {
    const where: { userId: string; type?: LedgerType } = { userId };
    if (type) {
      where.type = type;
    }

    const ledgerEntries = await this.prisma.ledgerEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Ledger entries retrieved successfully',
      data: ledgerEntries,
      timestamp: new Date().toISOString(),
    };
  }

  async findOneForUser(
    userId: string,
    id: string,
  ): Promise<ApiResponse<LedgerEntryResponseDto>> {
    const ledgerEntry = await this.prisma.ledgerEntry.findFirst({
      where: { id, userId },
    });

    if (!ledgerEntry) {
      throw new NotFoundException(
        `Ledger entry with id "${id}" is not found for this user`,
      );
    }

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Ledger entry retrieved successfully',
      data: ledgerEntry,
      timestamp: new Date().toISOString(),
    };
  }

  async getBalanceForUser(
    userId: string,
  ): Promise<ApiResponse<{ balance: Decimal }>> {
    const result = await this.prisma.ledgerEntry.groupBy({
      by: ['userId'],
      where: { userId },
      _sum: {
        amount: true,
      },
    });

    const balance = Decimal(result[0]?._sum.amount || 0);

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Balance retrieved successfully',
      data: { balance: balance },
      timestamp: new Date().toISOString(),
    };
  }

  async getSummaryForUser(userId: string): Promise<
    ApiResponse<{
      totalEarnings: Decimal;
      totalWithdrawals: Decimal;
      totalBonuses: Decimal;
      totalAdjustments: Decimal;
      balance: Decimal;
    }>
  > {
    const [entries, balanceResult] = await Promise.all([
      this.prisma.ledgerEntry.groupBy({
        by: ['type'],
        where: { userId },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.ledgerEntry.groupBy({
        by: ['userId'],
        where: { userId },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const summary = {
      totalEarnings: Decimal(0),
      totalWithdrawals: Decimal(0),
      totalBonuses: Decimal(0),
      totalAdjustments: Decimal(0),
      balance: Decimal(balanceResult[0]?._sum.amount || 0),
    };

    entries.forEach((entry) => {
      const amount = Number(entry._sum.amount || 0);
      switch (entry.type) {
        case LEDGER_TYPES.TASK_REWARD:
          summary.totalEarnings = summary.totalEarnings.plus(Decimal(amount));
          break;
        case LEDGER_TYPES.WITHDRAWAL:
          summary.totalWithdrawals = summary.totalWithdrawals.plus(
            Decimal(Math.abs(amount)),
          );
          break;
        case LEDGER_TYPES.BONUS:
          summary.totalBonuses = summary.totalBonuses.plus(Decimal(amount));
          break;
        case LEDGER_TYPES.ADJUSTMENT:
          summary.totalAdjustments = summary.totalAdjustments.plus(
            Decimal(amount),
          );
          break;
      }
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Summary retrieved successfully',
      data: summary,
      timestamp: new Date().toISOString(),
    };
  }
}
