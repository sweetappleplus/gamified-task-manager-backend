import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import type { ApiResponse } from '../types/index.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): ApiResponse<void> {
    return this.appService.getHealth();
  }
}
