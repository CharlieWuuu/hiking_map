// src/auth/jwt-optional.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtOptionalMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });
        req.user = {
          userId: payload.sub,
          username: payload.username,
        };
        console.log(token, req.user);
      } catch {
        // 無效 token 就跳過
      }
    }
    next();
  }
}
