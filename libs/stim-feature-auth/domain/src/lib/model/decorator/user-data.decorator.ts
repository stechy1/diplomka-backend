import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestWithUser } from '@diplomka-backend/stim-feature-users/domain';

export const UserData = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request: RequestWithUser = ctx.switchToHttp().getRequest<RequestWithUser>();
  const user = request.user || { id: -1 };

  return data ? user && user[data] : user;
});
