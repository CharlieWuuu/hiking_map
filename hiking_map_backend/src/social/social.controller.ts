import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { JwtRequiredGuard } from '../auth/jwt-required.guard';
import { Collection } from './collection.entity';
import { CollectionItemDto } from './dto/collection-item.dto';

@ApiTags('Social')
@Controller()
export class SocialController {
  constructor(private socialService: SocialService) {}

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
}
