import { Controller, Get, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtRequiredGuard } from '../auth/jwt-required.guard';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('me')
  @UseGuards(JwtRequiredGuard)
  getMe(@Req() req: any) {
    return this.profileService.findByUserId(req.user.userId);
  }

  @Patch('me')
  @UseGuards(JwtRequiredGuard)
  updateMe(@Body() dto: UpdateProfileDto, @Req() req: any) {
    return this.profileService.update(req.user.userId, dto);
  }

  @Get(':username')
  getByUsername(@Param('username') username: string) {
    return this.profileService.findByUsername(username);
  }
}
