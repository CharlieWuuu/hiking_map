import { Controller, Get } from '@nestjs/common';
import { TrailsService } from './trails.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Trails')
@Controller('trails')
export class TrailsController {
  constructor(private readonly trailsService: TrailsService) {}

  @Get()
  async getTrails() {
    console.log('Fetching trails...');
    return this.trailsService.findAllGeoJSON();
  }
}
