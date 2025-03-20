import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  userId: number; // Adjust based on your token payload
  email?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) =>
        AccessTokenStrategy.cookieExtractor(req),
      secretOrKey: configService.get<string>('jwt.secret', 'defaultSecret'), // Ensure it's always a string
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }

  private static cookieExtractor(req: Request): string | null {
    if (
      req?.cookies &&
      typeof req.cookies === 'object' &&
      'token' in req.cookies
    ) {
      return req.cookies.token as string; // Explicitly typecast
    }
    return null;
  }
}
