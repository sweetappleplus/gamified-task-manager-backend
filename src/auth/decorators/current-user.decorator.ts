import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserData } from '../../types/index.js';

interface RequestWithUser extends Request {
  user: CurrentUserData;
}

export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
