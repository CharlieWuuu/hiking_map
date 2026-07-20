import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MountainsService } from './mountains.service';
import { Mountain } from './mountain.entity';

@ApiTags('Mountains')
@Controller('mountains')
export class MountainsController {
  constructor(private mountainsService: MountainsService) {}

  @Get()
  @ApiOkResponse({ type: Mountain, isArray: true })
  findAll() {
    return this.mountainsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: Mountain })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mountainsService.findOne(id);
  }
}
