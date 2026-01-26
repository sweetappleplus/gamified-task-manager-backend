import { Injectable } from '@nestjs/common';
import { API_STATUSES } from '../consts/index.js';
import { ApiResponse } from '../types/index.js';

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
