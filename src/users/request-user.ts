// src/users/request-user.ts
import { ForbiddenException } from '@nestjs/common';

export type RequestLike = {
  user?: any;
  headers?: Record<string, any>;
};

export function getUserId(req: RequestLike): string {
  const userId =
    req?.user?.userId ?? // наш стандарт (JwtStrategy.validate)
    req?.user?.id ??     // legacy
    req?.user?.sub ??    // legacy
    req?.headers?.['x-user-id'] ??
    req?.headers?.['x-broker-id'];

  if (!userId) throw new ForbiddenException('User id is missing in token');
  return String(userId);
}

export function getUserRole<T = any>(req: RequestLike): T | undefined {
  return (req?.user?.role ?? req?.headers?.['x-user-role']) as T | undefined;
}
