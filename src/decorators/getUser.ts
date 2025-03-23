import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

interface UserPayload {
  userId: number;
  iat: number;
  exp: number;
}

export const GetUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request?.user as UserPayload | undefined;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return data ? user[data] : user;
  },
);
