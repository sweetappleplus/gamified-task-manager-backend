import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreatePaymentMethodDto,
  PaymentMethodResponseDto,
  UpdatePaymentMethodDto,
} from './dto/index.js';
import { ApiResponse, PaymentMethod } from '../types/index.js';
import { API_STATUSES, LOG_LEVELS } from '../consts/index.js';
import { log } from '../utils/index.js';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prisma: PrismaService) {}

  async createForUser(
    userId: string,
    payload: CreatePaymentMethodDto,
  ): Promise<ApiResponse<PaymentMethodResponseDto>> {
    try {
      const data: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        type: payload.type,
        provider: payload.provider,
        accountInfo: payload.accountInfo,
        isDefault: payload.isDefault ?? false,
      };

      // If new method is default, unset existing defaults for this user
      if (payload.isDefault) {
        await this.prisma.paymentMethod.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
        data.isDefault = true;
      }

      const method = await this.prisma.paymentMethod.create({ data });

      log({
        message: `Payment method created for user ${userId}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Payment method created successfully',
        data: method,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error creating payment method: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async findAllForUser(
    userId: string,
  ): Promise<ApiResponse<PaymentMethodResponseDto[]>> {
    const methods = await this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Payment methods retrieved successfully',
      data: methods,
      timestamp: new Date().toISOString(),
    };
  }

  async findOneForUser(
    userId: string,
    id: string,
  ): Promise<ApiResponse<PaymentMethodResponseDto>> {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!method || method.userId !== userId) {
      throw new NotFoundException(
        `Payment method with id "${id}" is not found for this user`,
      );
    }

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Payment method retrieved successfully',
      data: method,
      timestamp: new Date().toISOString(),
    };
  }

  async updateForUser(
    userId: string,
    id: string,
    payload: UpdatePaymentMethodDto,
  ): Promise<ApiResponse<PaymentMethodResponseDto>> {
    const existing = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(
        `Payment method with id "${id}" is not found for this user`,
      );
    }

    try {
      // Handle default switching
      if (payload.isDefault) {
        await this.prisma.paymentMethod.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const updated = await this.prisma.paymentMethod.update({
        where: { id },
        data: {
          type: payload.type ?? existing.type,
          provider:
            typeof payload.provider === 'undefined'
              ? existing.provider
              : payload.provider,
          accountInfo:
            typeof payload.accountInfo === 'undefined'
              ? existing.accountInfo
              : payload.accountInfo,
          isDefault:
            typeof payload.isDefault === 'undefined'
              ? existing.isDefault
              : payload.isDefault,
        },
      });

      log({
        message: `Payment method updated for user ${userId}`,
        level: LOG_LEVELS.INFO,
      });

      return {
        status: API_STATUSES.SUCCESS,
        message: 'Payment method updated successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log({
        message: `Error updating payment method: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async removeForUser(userId: string, id: string): Promise<ApiResponse<void>> {
    const existing = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(
        `Payment method with id "${id}" is not found for this user`,
      );
    }

    try {
      await this.prisma.paymentMethod.delete({
        where: { id },
      });
    } catch (error) {
      log({
        message: `Error deleting payment method: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      throw new InternalServerErrorException((error as Error).message);
    }

    log({
      message: `Payment method deleted for user ${userId}`,
      level: LOG_LEVELS.INFO,
    });

    return {
      status: API_STATUSES.SUCCESS,
      message: 'Payment method deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
