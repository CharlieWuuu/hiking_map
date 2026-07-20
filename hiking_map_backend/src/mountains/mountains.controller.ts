import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MountainsService } from './mountains.service';

@ApiTags('Mountains')
@Controller('mountains')
export class MountainsController {
  constructor(private mountainsService: MountainsService) {}

  @Get()
  findAll() {
    return this.mountainsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mountainsService.findOne(id);
  }
}
