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
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { JwtRequiredGuard } from '../auth/jwt-required.guard';
import { Collection } from './collection.entity';
import { Follow } from './follow.entity';

@ApiTags('Social')
@Controller()
@UseGuards(JwtRequiredGuard)
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Post('collections')
  @ApiCreatedResponse({ type: Collection })
  addCollection(@Body() dto: CreateCollectionDto, @Req() req: any) {
    return this.socialService.addCollection(req.user.user_id, dto);
  }

  @Delete('collections/:id')
  removeCollection(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.socialService.removeCollection(req.user.user_id, id);
  }

  @Get('collections')
  @ApiOkResponse({ type: Collection, isArray: true })
  findCollections(@Req() req: any) {
    return this.socialService.findCollections(req.user.user_id);
  }

  @Post('follows/:userId')
  @ApiCreatedResponse({ type: Follow })
  follow(@Param('userId', ParseIntPipe) targetUserId: number, @Req() req: any) {
    return this.socialService.follow(req.user.user_id, targetUserId);
  }

  @Delete('follows/:userId')
  unfollow(@Param('userId', ParseIntPipe) targetUserId: number, @Req() req: any) {
    return this.socialService.unfollow(req.user.user_id, targetUserId);
  }

  @Get('follows/following')
  @ApiOkResponse({ type: Follow, isArray: true })
  findFollowing(@Req() req: any) {
    return this.socialService.findFollowing(req.user.user_id);
  }

  @Get('follows/followers')
  @ApiOkResponse({ type: Follow, isArray: true })
  findFollowers(@Req() req: any) {
    return this.socialService.findFollowers(req.user.user_id);
  }
}
