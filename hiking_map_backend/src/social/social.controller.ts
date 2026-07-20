import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { JwtRequiredGuard } from '../auth/jwt-required.guard';

@ApiTags('Social')
@Controller()
@UseGuards(JwtRequiredGuard)
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Post('collections')
  addCollection(@Body() dto: CreateCollectionDto, @Req() req: any) {
    return this.socialService.addCollection(req.user.userId, dto);
  }

  @Delete('collections/:id')
  removeCollection(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.socialService.removeCollection(req.user.userId, id);
  }

  @Get('collections')
  findCollections(@Req() req: any) {
    return this.socialService.findCollections(req.user.userId);
  }

  @Post('follows/:userId')
  follow(@Param('userId', ParseIntPipe) targetUserId: number, @Req() req: any) {
    return this.socialService.follow(req.user.userId, targetUserId);
  }

  @Delete('follows/:userId')
  unfollow(@Param('userId', ParseIntPipe) targetUserId: number, @Req() req: any) {
    return this.socialService.unfollow(req.user.userId, targetUserId);
  }

  @Get('follows/following')
  findFollowing(@Req() req: any) {
    return this.socialService.findFollowing(req.user.userId);
  }

  @Get('follows/followers')
  findFollowers(@Req() req: any) {
    return this.socialService.findFollowers(req.user.userId);
  }
}
