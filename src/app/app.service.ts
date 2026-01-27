import { Injectable } from '@nestjs/common';
import { API_STATUSES } from '../modules/consts/index.js';
import { ApiResponse } from '../modules/types/index.js';

@Injectable()
export class AppService {
  getHealth(): ApiResponse<void> {
    return {
      status: API_STATUSES.SUCCESS,
      message: 'The application is running',
      timestamp: new Date().toISOString(),
    };
  }
}
