import {
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
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HikesService } from './hikes.service';
import { CreateHikeDto } from './dto/create-hike.dto';
import { JwtRequiredGuard } from '../auth/jwt-required.guard';
import { Hike } from './hike.entity';

@ApiTags('Hikes')
@Controller('hikes')
export class HikesController {
  constructor(private hikesService: HikesService) {}

  @Post()
  @UseGuards(JwtRequiredGuard)
  @ApiCreatedResponse({ type: Hike })
  create(@Body() dto: CreateHikeDto, @Req() req: any) {
    return this.hikesService.create(req.user.user_id, dto);
  }

  @Get()
  @ApiOkResponse({ type: Hike, isArray: true })
  findAll(@Query('userId') userId?: string): Promise<Hike[]> {
    return this.hikesService.findAll(userId ? Number(userId) : undefined);
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
