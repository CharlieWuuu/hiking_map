import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Body,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto, LoginResponseDto } from './dto/auth-response.dto';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard, GOOGLE_LINK_STATE } from './google-auth.guard';
import { GoogleProfile } from './google.strategy';
import { JwtRequiredGuard } from './jwt-required.guard';
import { User } from './auth.entity';
import { AuthMethodsDto, ForgotPasswordDto, ResetPasswordDto, SetEmailDto } from './dto/password-reset.dto';

const AUTH_COOKIE = 'auth_token';
const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 與 JWT expiresIn 一致

function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  });
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  private frontendUrl() {
    return process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ type: RegisterResponseDto })
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body.username, body.password, body.email);
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
    setAuthCookie(res, result.token);

    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE);
    return { success: true };
  }

  // 目前有哪些登入方式，設定頁要靠它決定顯示「綁定」還是「解除綁定」
  @Get('methods')
  @UseGuards(JwtRequiredGuard)
  @ApiOkResponse({ type: AuthMethodsDto })
  async getMethods(@Req() req: any): Promise<AuthMethodsDto> {
    const user = await this.usersRepo.findOne({ where: { id: req.user.user_id } });
    if (!user) throw new UnauthorizedException();
    return { email: user.email, has_password: Boolean(user.password), has_google: Boolean(user.google_id) };
  }

  @Put('email')
  @UseGuards(JwtRequiredGuard)
  async setEmail(@Body() body: SetEmailDto, @Req() req: any) {
    await this.authService.setEmail(req.user.user_id, body.email);
    return { success: true };
  }

  // 無論這個 email 有沒有對應的帳號都回傳成功，
  // 否則這支 API 會變成「這個 email 有沒有註冊過」的查詢工具
  @Post('forgot-password')
  @ApiOkResponse({ description: '一律回傳成功，不透露 email 是否存在' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.requestPasswordReset(body.email, this.frontendUrl());
    return { success: true };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body.token, body.password);
    return { success: true };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // GoogleAuthGuard 會直接把請求導去 Google 授權頁，這裡不會執行到
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const googleProfile: GoogleProfile = req.user;
    const frontendUrl = this.frontendUrl();

    // 綁定流程：passport 已經把 req.user 換成 Google 的資料，
    // 所以要自己從 cookie 重新解出「現在登入的是誰」
    if (req.query.state === GOOGLE_LINK_STATE) {
      const currentUserId = this.readUserIdFromCookie(req);
      if (!currentUserId) return res.redirect(`${frontendUrl}/settings?googleLink=unauthenticated`);

      try {
        await this.authService.linkGoogle(currentUserId, googleProfile.googleId);
        return res.redirect(`${frontendUrl}/settings?googleLink=success`);
      } catch {
        return res.redirect(`${frontendUrl}/settings?googleLink=conflict`);
      }
    }

    const user = await this.authService.findOrCreateGoogleUser(googleProfile);
    const result = await this.authService.login(user, req.ip, req.headers['user-agent']);
    setAuthCookie(res, result.token);

    res.redirect(frontendUrl);
  }

  @Delete('google')
  @UseGuards(JwtRequiredGuard)
  async unlinkGoogle(@Req() req: any) {
    await this.authService.unlinkGoogle(req.user.user_id);
    return { success: true };
  }

  private readUserIdFromCookie(req: any): number | null {
    const token = req.cookies?.[AUTH_COOKIE];
    if (!token) return null;
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'your-secret-key' });
      return payload.sub as number;
    } catch {
      return null;
    }
  }
}
