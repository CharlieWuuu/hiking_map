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
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrailsDto } from './dto/trails.dto';
import { Response } from 'express';
import { TrailsInfoDto } from './dto/trails_info.dio';

@ApiTags('Trails')
@Controller('trails')
export class TrailsController {
  constructor(private readonly trailsService: TrailsService) {}

  @Get()
  async getTrails() {
    console.log('Fetching trails...');
    return this.trailsService.getTrails();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async post(@UploadedFile() file: Express.Multer.File) {
    return this.trailsService.post(file);
  }

  @Delete(':uuid')
  delete(@Param('uuid') uuid: string) {
    return this.trailsService.delete(uuid);
  }

  @Put(':uuid')
  @UseInterceptors(FileInterceptor('file'))
  put(@Param('uuid') uuid: string, @UploadedFile() file: Express.Multer.File) {
    return this.trailsService.put(uuid, file);
  }

  @Patch(':uuid/properties')
  patch(@Param('uuid') uuid: string, @Body() dto: TrailsInfoDto) {
    return this.trailsService.patch(uuid, dto);
  }

  @Get('export/:type')
  getExport(@Res() res: Response, @Query('type') type: string) {
    return this.trailsService.getExport(res, type);
  }
}
