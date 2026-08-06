import { Body, Controller, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { LoginDto } from '../../auth/dto/login.dto';

/**
 * 舊版前端的登入。
 *
 * 跟現在的 /auth/login 差在兩點：舊版把 JWT 直接回在 body（前端自己存，
 * 之後用 Bearer 帶），而且 payload 裡有 uuid——舊站所有 API 都靠 uuid
 * 辨識使用者。密碼雜湊是同一套 bcrypt，所以兩邊共用 users 表沒問題。
 */
@ApiTags('v1 (舊版前端)')
@Controller('v1/auth')
export class V1AuthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto, @Req() req: Request) {
    const [user] = await this.dataSource.query<{ id: number; username: string; password: string | null; uuid: string }[]>(
      `SELECT id, username, password, uuid::text FROM users WHERE username = $1`,
      [body.username],
    );

    if (!user?.password || !(await bcrypt.compare(body.password, user.password))) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    const token = this.jwtService.sign({ id: user.id, username: user.username, uuid: user.uuid });

    await this.dataSource.query(`INSERT INTO users_log (user_id, ip_address, user_agent, uuid) VALUES ($1, $2, $3, $4)`, [
      user.id,
      req.ip,
      req.headers['user-agent'],
      user.uuid,
    ]);

    return { token };
  }
}
