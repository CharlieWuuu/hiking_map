import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto, LoginResponseDto } from './dto/auth-response.dto';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

const AUTH_COOKIE = 'auth_token';
const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 與 JWT expiresIn 一致

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ type: RegisterResponseDto })
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body.username, body.password);
    return { id: user.id, username: user.username };
  }

  @Post('login')
  @ApiBody({ type: LoginDto }) // 👈 這行讓 Swagger 知道你要什麼欄位
  @ApiOkResponse({ type: LoginResponseDto })
  async login(@Body() body: LoginDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) throw new UnauthorizedException('帳號或密碼錯誤');

    const ip = req.ip;
    const ua = req.headers['user-agent'];
    const result = await this.authService.login(user, ip, ua);

    res.cookie(AUTH_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AUTH_COOKIE_MAX_AGE_MS,
    });

    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE);
    return { success: true };
  }
}
