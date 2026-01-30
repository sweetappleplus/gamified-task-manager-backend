import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { LedgerEntry } from '../../shared/types/index.js';
import { LedgerType } from '../../generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';

export class LedgerEntryResponseDto implements LedgerEntry {
  @ApiProperty({
    description: 'Ledger entry ID',
    example: 'clxyz1234abcd5678efgh9012',
  })
  id!: string;

  @ApiProperty({
    description: 'User ID this ledger entry belongs to',
    example: 'clxyz1234abcd5678efgh9012',
  })
  userId!: string;

  @ApiProperty({
    description: 'Ledger entry type',
    enum: LedgerType,
    example: LedgerType.TASK_REWARD,
  })
  type!: LedgerType;

  @ApiProperty({
    description: 'Transaction amount',
    example: '150.00',
    type: 'string',
  })
  amount!: Decimal;

  @ApiPropertyOptional({
    description: 'Description of the transaction',
    example: 'Task completion reward',
    maxLength: 1024,
    nullable: true,
  })
  description!: string | null;

  @ApiPropertyOptional({
    description: 'Related task ID if applicable',
    example: 'clxyz1234abcd5678efgh9012',
    nullable: true,
  })
  relatedTaskId!: string | null;

  @ApiProperty({
    description: 'Timestamp when ledger entry was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;
}
