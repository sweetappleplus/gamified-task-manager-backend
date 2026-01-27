import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service.js';
import {
  CreatePaymentMethodDto,
  PaymentMethodResponseDto,
  UpdatePaymentMethodDto,
} from './dto/index.js';
import { ApiResponse, type CurrentUserData } from '../modules/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { CurrentUser } from '../auth/decorators/index.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() payload: CreatePaymentMethodDto,
  ): Promise<ApiResponse<PaymentMethodResponseDto>> {
    return this.paymentMethodService.createForUser(user.userId, payload);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllForCurrentUser(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<PaymentMethodResponseDto[]>> {
    return this.paymentMethodService.findAllForUser(user.userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOneForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<ApiResponse<PaymentMethodResponseDto>> {
    return this.paymentMethodService.findOneForUser(user.userId, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() payload: UpdatePaymentMethodDto,
  ): Promise<ApiResponse<PaymentMethodResponseDto>> {
    return this.paymentMethodService.updateForUser(user.userId, id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removeForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<ApiResponse<void>> {
    return this.paymentMethodService.removeForUser(user.userId, id);
  }
}
