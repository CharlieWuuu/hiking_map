import { Controller, Get, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtRequiredGuard } from '../auth/jwt-required.guard';
import { Profile } from './profile.entity';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('me')
  @UseGuards(JwtRequiredGuard)
  @ApiOkResponse({ type: Profile })
  getMe(@Req() req: any) {
    return this.profileService.findByUserId(req.user.user_id);
  }

  @Patch('me')
  @UseGuards(JwtRequiredGuard)
  @ApiOkResponse({ type: Profile })
  updateMe(@Body() dto: UpdateProfileDto, @Req() req: any) {
    return this.profileService.update(req.user.user_id, dto);
  }

  @Get(':username')
  @ApiOkResponse({ type: Profile })
  getByUsername(@Param('username') username: string) {
    return this.profileService.findByUsername(username);
  }
}
