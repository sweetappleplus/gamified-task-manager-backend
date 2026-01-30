import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDoc,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LedgerEntryService } from './ledger-entry.service.js';
import { CreateLedgerEntryDto, LedgerEntryResponseDto } from './dto/index.js';
import { ApiResponse, type CurrentUserData } from '../shared/types/index.js';
import { UserRole, LedgerType } from '../generated/prisma/enums.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { CurrentUser, Roles } from '../auth/decorators/index.js';
import { Decimal } from '@prisma/client/runtime/client';

@ApiTags('Ledger')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ledger-entries')
export class LedgerEntryController {
  constructor(private readonly ledgerEntryService: LedgerEntryService) {}

  @ApiOperation({
    summary: 'Create ledger entry (Super Admin only)',
    description: 'Creates a manual ledger entry for adjustments or withdrawals',
  })
  @ApiResponseDoc({
    status: 201,
    description: 'Ledger entry created successfully',
  })
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() payload: CreateLedgerEntryDto,
  ): Promise<ApiResponse<LedgerEntryResponseDto>> {
    return this.ledgerEntryService.create(payload);
  }

  @ApiOperation({
    summary: 'Get all ledger entries for current user',
    description:
      'Retrieves transaction history with optional filtering by type',
  })
  @ApiQuery({
    name: 'type',
    enum: LedgerType,
    required: false,
    description: 'Filter by ledger entry type',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Ledger entries retrieved successfully',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Query('type') type?: LedgerType,
  ): Promise<ApiResponse<LedgerEntryResponseDto[]>> {
    return this.ledgerEntryService.findAllForUser(user.userId, type);
  }

  @ApiOperation({
    summary: 'Get current balance',
    description: 'Returns the current balance for the authenticated user',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Balance retrieved successfully',
  })
  @Get('balance')
  @HttpCode(HttpStatus.OK)
  async getBalanceForCurrentUser(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<{ balance: Decimal }>> {
    return this.ledgerEntryService.getBalanceForUser(user.userId);
  }

  @ApiOperation({
    summary: 'Get earnings summary',
    description:
      'Returns a comprehensive summary of earnings, bonuses, withdrawals, and balance',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Summary retrieved successfully',
  })
  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async getSummaryForCurrentUser(@CurrentUser() user: CurrentUserData): Promise<
    ApiResponse<{
      totalEarnings: Decimal;
      totalWithdrawals: Decimal;
      totalBonuses: Decimal;
      totalAdjustments: Decimal;
      balance: Decimal;
    }>
  > {
    return this.ledgerEntryService.getSummaryForUser(user.userId);
  }

  @ApiOperation({
    summary: 'Get ledger entry by ID',
    description: 'Retrieves a specific ledger entry for the authenticated user',
  })
  @ApiParam({ name: 'id', description: 'Ledger entry ID' })
  @ApiResponseDoc({
    status: 200,
    description: 'Ledger entry retrieved successfully',
  })
  @ApiResponseDoc({ status: 404, description: 'Ledger entry not found' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOneForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<ApiResponse<LedgerEntryResponseDto>> {
    return this.ledgerEntryService.findOneForUser(user.userId, id);
  }
}
