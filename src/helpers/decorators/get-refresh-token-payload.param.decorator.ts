import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RefreshTokenPayload = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return {
      userId: request.user.id,
      deviceId: request.user.deviceId,
      issueAt: request.user.issueAt,
    };
  },
);
