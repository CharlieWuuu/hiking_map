import {
  BadRequestException,
  Controller,
  Get,
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
import { HikeStatsDto } from './dto/hike-stats.dto';
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

  @Get()
  @ApiOkResponse({ type: Hike, isArray: true })
  findAll(@Query('userId') userId?: string, @Query('includeGeojson') includeGeojson?: string) {
    return this.hikesService.findAll(userId ? Number(userId) : undefined, includeGeojson === 'true');
  }

  // bbox 格式為 minLng,minLat,maxLng,maxLat
  @Get('in-view')
  @ApiOkResponse({ description: '目前視野內的紀錄，含 center / bbox 與簡化軌跡' })
  findInView(@Query('bbox') bbox: string, @Query('userId') userId?: string) {
    const parts = (bbox ?? '').split(',').map(Number);
    if (parts.length !== 4 || parts.some(Number.isNaN)) {
      throw new BadRequestException('bbox 格式應為 minLng,minLat,maxLng,maxLat');
    }
    return this.hikesService.findInView(parts as [number, number, number, number], userId ? Number(userId) : undefined);
  }

  @Get('stats')
  @ApiOkResponse({ type: HikeStatsDto })
  async getStats(@Query('username') username: string): Promise<HikeStatsDto> {
    const user = await this.usersRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('找不到使用者');
    return this.hikesService.getStats(user.id);
  }

  @Get(':id')
  @ApiOkResponse({ type: Hike })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hikesService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtRequiredGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.hikesService.remove(id, req.user.user_id);
  }
}
