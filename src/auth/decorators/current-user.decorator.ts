import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  CurrentUserData,
  RequestWithUserDecorator,
} from '../../shared/types/index.js';

export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest<RequestWithUserDecorator>();
    return request.user;
  },
);
