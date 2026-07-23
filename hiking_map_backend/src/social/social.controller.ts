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
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { JwtRequiredGuard } from '../auth/jwt-required.guard';
import { Collection } from './collection.entity';
import { Follow } from './follow.entity';
import { CollectionItemDto } from './dto/collection-item.dto';
import { User } from '../auth/auth.entity';

@ApiTags('Social')
@Controller()
export class SocialController {
  constructor(
    private socialService: SocialService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  // 查任何人的公開收藏清單，不需登入
  @Get('collections/by-username/:username')
  @ApiOkResponse({ type: CollectionItemDto, isArray: true })
  async findCollectionsByUsername(@Param('username') username: string) {
    const user = await this.usersRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('找不到使用者');
    return this.socialService.findCollections(user.id);
  }

  @Post('collections')
  @UseGuards(JwtRequiredGuard)
  @ApiCreatedResponse({ type: Collection })
  addCollection(@Body() dto: CreateCollectionDto, @Req() req: any) {
    return this.socialService.addCollection(req.user.user_id, dto);
  }

  @Delete('collections/:id')
  @UseGuards(JwtRequiredGuard)
  removeCollection(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.socialService.removeCollection(req.user.user_id, id);
  }

  @Get('collections')
  @UseGuards(JwtRequiredGuard)
  @ApiOkResponse({ type: CollectionItemDto, isArray: true })
  findCollections(@Req() req: any) {
    return this.socialService.findCollections(req.user.user_id);
  }

  @Post('follows/:userId')
  @UseGuards(JwtRequiredGuard)
  @ApiCreatedResponse({ type: Follow })
  follow(@Param('userId', ParseIntPipe) targetUserId: number, @Req() req: any) {
    return this.socialService.follow(req.user.user_id, targetUserId);
  }

  @Delete('follows/:userId')
  @UseGuards(JwtRequiredGuard)
  unfollow(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Req() req: any,
  ) {
    return this.socialService.unfollow(req.user.user_id, targetUserId);
  }

  @Get('follows/following')
  @UseGuards(JwtRequiredGuard)
  @ApiOkResponse({ type: Follow, isArray: true })
  findFollowing(@Req() req: any) {
    return this.socialService.findFollowing(req.user.user_id);
  }

  @Get('follows/followers')
  @UseGuards(JwtRequiredGuard)
  @ApiOkResponse({ type: Follow, isArray: true })
  findFollowers(@Req() req: any) {
    return this.socialService.findFollowers(req.user.user_id);
  }

  // 查任何人的追蹤者/正在追蹤數，以及目前登入者是否已追蹤該使用者（未登入時 isFollowing 固定為 false）
  @Get('follows/status/:userId')
  @ApiOkResponse({
    schema: {
      properties: {
        followerCount: { type: 'number' },
        followingCount: { type: 'number' },
        isFollowing: { type: 'boolean' },
      },
    },
  })
  getFollowStatus(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Req() req: any,
  ) {
    return this.socialService.getFollowStatus(
      targetUserId,
      req.user?.user_id ?? null,
    );
  }
}
