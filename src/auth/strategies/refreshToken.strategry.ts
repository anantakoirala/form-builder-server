import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface TokenPayload {
  userId: number; // adjust based on your token structure
}

interface CookieRequest extends Request {
  cookies: {
    token?: string;
    refresh_token?: string;
  };
}

export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh',
) {
  constructor(private configService: ConfigService) {
    // Ensure that `secretOrKey` is always defined

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: CookieRequest) => {
          // Log the cookies to the console

          return request.cookies?.refresh_token || null; // Ensure null is returned if no token
        },
      ]),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET as string,
    });
  }

  validate(payload: TokenPayload) {
    if (!payload.userId) {
      throw new UnauthorizedException('Invalid token');
    }
    return payload;
  }
}
