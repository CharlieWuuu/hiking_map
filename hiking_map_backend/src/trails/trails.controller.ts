import { TrailsService } from './trails.service';
import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateTrailDto } from './dto/update-trail.dto';
import { UpdatePropertiesDto } from './dto/update-properties.dto';

@ApiTags('Trails')
@Controller('trails')
export class TrailsController {
  constructor(private readonly trailsService: TrailsService) {}

  @Get()
  async getTrails() {
    console.log('Fetching trails...');
    return this.trailsService.findAllGeoJSON();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.trailsService.handleUpload(file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trailsService.remove(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTrailDto) {
    return this.trailsService.update(id, dto);
  }

  @Patch(':id/properties')
  updateProps(@Param('id') id: string, @Body() dto: UpdatePropertiesDto) {
    return this.trailsService.updateProperties(id, dto);
  }
}
