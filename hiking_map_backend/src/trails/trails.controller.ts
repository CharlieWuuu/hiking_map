import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TrailsService } from './trails.service';
import { Trail } from './trail.entity';

@ApiTags('Trails')
@Controller('trails')
export class TrailsController {
  constructor(private trailsService: TrailsService) {}

  @Get()
  @ApiOkResponse({ type: Trail, isArray: true })
  findAll() {
    return this.trailsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: Trail })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trailsService.findOne(id);
  }
}
