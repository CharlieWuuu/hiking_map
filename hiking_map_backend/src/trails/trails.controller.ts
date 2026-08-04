import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TrailsService } from './trails.service';
import { Trail } from './trail.entity';
import { TrailDetailDto } from './dto/trail-detail.dto';

@ApiTags('Trails')
@Controller('trails')
export class TrailsController {
  constructor(private trailsService: TrailsService) {}

  @Get()
  @ApiOkResponse({ type: Trail, isArray: true })
  findAll() {
    return this.trailsService.findAll();
  }

  @Get(':slug')
  @ApiOkResponse({ type: TrailDetailDto })
  findOne(@Param('slug') slug: string) {
    return this.trailsService.findOne(slug);
  }
}
