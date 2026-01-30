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
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDoc,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentMethodService } from './payment-method.service.js';
import {
  CreatePaymentMethodDto,
  PaymentMethodResponseDto,
  UpdatePaymentMethodDto,
} from './dto/index.js';
import { ApiResponse, type CurrentUserData } from '../shared/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { CurrentUser } from '../auth/decorators/index.js';

@ApiTags('Payment Methods')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @ApiOperation({
    summary: 'Add payment method',
    description: 'Adds a new payment method for the authenticated user',
  })
  @ApiResponseDoc({
    status: 201,
    description: 'Payment method added successfully',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() payload: CreatePaymentMethodDto,
  ): Promise<ApiResponse<PaymentMethodResponseDto>> {
    return this.paymentMethodService.createForUser(user.userId, payload);
  }

  @ApiOperation({
    summary: 'Get all payment methods',
    description: 'Retrieves all payment methods for the authenticated user',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Payment methods retrieved successfully',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllForCurrentUser(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<PaymentMethodResponseDto[]>> {
    return this.paymentMethodService.findAllForUser(user.userId);
  }

  @ApiOperation({
    summary: 'Get payment method by ID',
    description: 'Retrieves a specific payment method',
  })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  @ApiResponseDoc({
    status: 200,
    description: 'Payment method retrieved successfully',
  })
  @ApiResponseDoc({ status: 404, description: 'Payment method not found' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOneForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<ApiResponse<PaymentMethodResponseDto>> {
    return this.paymentMethodService.findOneForUser(user.userId, id);
  }

  @ApiOperation({
    summary: 'Update payment method',
    description: 'Updates payment method details',
  })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  @ApiResponseDoc({
    status: 200,
    description: 'Payment method updated successfully',
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() payload: UpdatePaymentMethodDto,
  ): Promise<ApiResponse<PaymentMethodResponseDto>> {
    return this.paymentMethodService.updateForUser(user.userId, id, payload);
  }

  @ApiOperation({
    summary: 'Delete payment method',
    description: 'Removes a payment method',
  })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  @ApiResponseDoc({
    status: 200,
    description: 'Payment method deleted successfully',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removeForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<ApiResponse<void>> {
    return this.paymentMethodService.removeForUser(user.userId, id);
  }
}
