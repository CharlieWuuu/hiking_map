import {
  BadRequestException,
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HikesService } from './hikes.service';
import { CreateHikeDto } from './dto/create-hike.dto';
import { UpdateHikeDto } from './dto/update-hike.dto';
import { HikeStatsDto } from './dto/hike-stats.dto';
import { MountainProgressDto } from './dto/mountain-progress.dto';
import { MergeHikesDto } from './dto/merge-hikes.dto';
import { TrimTrackDto } from './dto/trim-track.dto';
import { DropSegmentDto } from './dto/drop-segment.dto';
import { JwtRequiredGuard } from '../auth/jwt-required.guard';
import { Hike } from './hike.entity';
import { User } from '../auth/auth.entity';

@ApiTags('Hikes')
@Controller('hikes')
export class HikesController {
  constructor(
    private hikesService: HikesService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  @Post()
  @UseGuards(JwtRequiredGuard)
  @ApiCreatedResponse({ type: Hike })
  create(@Body() dto: CreateHikeDto, @Req() req: any) {
    return this.hikesService.create(req.user.user_id, dto);
  }

  // 合併必須擺在 @Get(':id') 之前無妨（方法不同），但擺在這裡比較好讀
  @Post('merge')
  @UseGuards(JwtRequiredGuard)
  @ApiCreatedResponse({ type: Hike, description: '合併後新建的紀錄' })
  merge(@Body() dto: MergeHikesDto, @Req() req: any) {
    return this.hikesService.merge(req.user.user_id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtRequiredGuard)
  @ApiOkResponse({ type: Hike, description: '更新後的紀錄' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHikeDto, @Req() req: any) {
    return this.hikesService.update(id, req.user.user_id, dto);
  }

  @Patch(':id/track/trim')
  @UseGuards(JwtRequiredGuard)
  @ApiOkResponse({ type: Hike, description: '裁切後的紀錄，距離已重算' })
  trimTrack(@Param('id', ParseIntPipe) id: number, @Body() dto: TrimTrackDto, @Req() req: any) {
    return this.hikesService.trimTrack(id, req.user.user_id, dto);
  }

  @Patch(':id/track/drop-segment')
  @UseGuards(JwtRequiredGuard)
  @ApiOkResponse({ type: Hike, description: '刪除該段後的紀錄，距離已重算' })
  dropTrackSegment(@Param('id', ParseIntPipe) id: number, @Body() dto: DropSegmentDto, @Req() req: any) {
    return this.hikesService.dropTrackSegment(id, req.user.user_id, dto);
  }

  // limit 沒給時維持舊行為（回傳完整陣列）；有給 limit 才會走分頁，回傳 { items, total_count, next_cursor }
  @Get()
  @ApiOkResponse({ type: Hike, isArray: true })
  findAll(
    @Query('userId') userId?: string,
    @Query('includeGeojson') includeGeojson?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    return this.hikesService.findAll(
      userId ? Number(userId) : undefined,
      includeGeojson === 'true',
      limit ? { cursor, limit: Number(limit) } : undefined,
      category,
    );
  }

  // bbox 格式為 minLng,minLat,maxLng,maxLat。zoom 決定回傳細緻度：
  // 遠景只回 center/bbox，中景加簡化線，近景直接給完整軌跡——由後端統一判斷，
  // 前端不用自己算該不該多打一次 R2 請求
  @Get('in-view')
  @ApiOkResponse({ description: '目前視野內的紀錄，含 center / bbox；zoom 到達門檻時另含簡化線或完整軌跡' })
  findInView(
    @Query('bbox') bbox: string,
    @Query('userId') userId?: string,
    @Query('zoom') zoom?: string,
    @Query('category') category?: string,
  ) {
    const parts = (bbox ?? '').split(',').map(Number);
    if (parts.length !== 4 || parts.some(Number.isNaN)) {
      throw new BadRequestException('bbox 格式應為 minLng,minLat,maxLng,maxLat');
    }
    return this.hikesService.findInView(
      parts as [number, number, number, number],
      userId ? Number(userId) : undefined,
      zoom ? Number(zoom) : undefined,
      category,
    );
  }

  @Get('stats')
  @ApiOkResponse({ type: HikeStatsDto })
  async getStats(@Query('username') username: string): Promise<HikeStatsDto> {
    const user = await this.usersRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('找不到使用者');
    return this.hikesService.getStats(user.id);
  }

  // 只有本人能看自己的完成度，跟 getStats 不同——那個是給 username 查任何人的公開統計，
  // 這裡是封閉系統下才有意義的「我還缺哪幾座」，不開放查別人
  @Get('mountain-progress')
  @UseGuards(JwtRequiredGuard)
  @ApiOkResponse({ type: MountainProgressDto })
  getMountainProgress(@Req() req: any) {
    return this.hikesService.getMountainProgress(req.user.user_id);
  }

  @Get(':id')
  @ApiOkResponse({ type: Hike })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hikesService.findOne(id);
  }

  // 給前端「地圖點某條路線時，清單自動跳到那一頁」使用
  @Get(':id/page')
  @ApiOkResponse({ description: '該筆紀錄在分頁清單中的頁碼與跳頁用的 cursor' })
  getPageInfo(@Param('id', ParseIntPipe) id: number, @Query('userId', ParseIntPipe) userId: number, @Query('limit', ParseIntPipe) limit: number) {
    return this.hikesService.getPageInfo(id, userId, limit);
  }

  @Delete(':id')
  @UseGuards(JwtRequiredGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.hikesService.remove(id, req.user.user_id);
  }
}
