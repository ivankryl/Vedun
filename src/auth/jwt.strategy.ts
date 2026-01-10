//  src/auth/jwt.strategy.ts
//
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (!payload?.sub) throw new UnauthorizedException();
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      orgId: payload.orgId ?? null,
    };
  }
}

