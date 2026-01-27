import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service.js';
import type { ApiResponse } from '../shared/types/index.js';
import { Public } from '../auth/decorators/index.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth(): ApiResponse<void> {
    return this.appService.getHealth();
  }
}
