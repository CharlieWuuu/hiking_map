// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

function extractFromCookie(req: Request): string | null {
  return req?.cookies?.auth_token || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(), // 從 Authorization: Bearer <token> 抽出 JWT
        extractFromCookie, // 或是從 httpOnly cookie 抽出
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // payload 是 JWT 裡面加的資訊（ex: sub、username）
    return {
      userId: payload.sub,
      username: payload.username,
    };
  }
}
