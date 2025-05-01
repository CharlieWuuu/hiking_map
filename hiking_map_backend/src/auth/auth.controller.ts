import {
  Controller,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginDto }) // 👈 這行讓 Swagger 知道你要什麼欄位
  async login(@Body() body: LoginDto, @Req() req: any) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) throw new UnauthorizedException('帳號或密碼錯誤');

    const ip = req.ip;
    const ua = req.headers['user-agent'];
    const uuid = user.uuid;

    return this.authService.login(user, ip, ua, uuid);
  }
}
