import { Injectable } from '@nestjs/common';
import { API_STATUSES } from '../shared/consts/index.js';
import { ApiResponse } from '../shared/types/index.js';

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
