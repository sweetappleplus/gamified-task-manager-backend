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
import { LedgerEntryService } from './ledger-entry.service.js';
import { CreateLedgerEntryDto, LedgerEntryResponseDto } from './dto/index.js';
import {
  ApiResponse,
  type CurrentUserData,
  UserRole,
  type LedgerType,
} from '../modules/types/index.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/index.js';
import { CurrentUser, Roles } from '../auth/decorators/index.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ledger-entries')
export class LedgerEntryController {
  constructor(private readonly ledgerEntryService: LedgerEntryService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() payload: CreateLedgerEntryDto,
  ): Promise<ApiResponse<LedgerEntryResponseDto>> {
    return this.ledgerEntryService.create(payload);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Query('type') type?: LedgerType,
  ): Promise<ApiResponse<LedgerEntryResponseDto[]>> {
    return this.ledgerEntryService.findAllForUser(user.userId, type);
  }

  @Get('balance')
  @HttpCode(HttpStatus.OK)
  async getBalanceForCurrentUser(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<{ balance: number }>> {
    return this.ledgerEntryService.getBalanceForUser(user.userId);
  }

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async getSummaryForCurrentUser(@CurrentUser() user: CurrentUserData): Promise<
    ApiResponse<{
      totalEarnings: number;
      totalWithdrawals: number;
      totalBonuses: number;
      totalAdjustments: number;
      balance: number;
    }>
  > {
    return this.ledgerEntryService.getSummaryForUser(user.userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOneForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<ApiResponse<LedgerEntryResponseDto>> {
    return this.ledgerEntryService.findOneForUser(user.userId, id);
  }
}
