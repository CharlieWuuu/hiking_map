import { TrailsService } from './trails.service';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
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
  Req,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { TrailsInfoDto } from './dto/trails_info.dio';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtRequiredGuard } from '../auth/jwt-required.guard';
import { FeatureCollection } from 'geojson';

@ApiTags('Trails')
@Controller('trails')
export class TrailsController {
  constructor(
    private readonly trailsService: TrailsService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiBearerAuth()
  @Get()
  @ApiOkResponse({
    description: '取得 GeoJSON 步道資料',
    schema: {
      example: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [121.5, 25.0],
                [121.51, 25.01],
              ],
            },
            properties: {
              name: '範例步道',
              county: '臺北市',
              town: '信義區',
              time: '2025年04月',
            },
          },
        ],
      },
    },
  })
  @Header('Cache-Control', 'no-store') // 防止 Swagger 快取 304
  async getTrails(@Req() req: Request): Promise<FeatureCollection> {
    let userId: string | null = null;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });
        userId = payload.sub;
      } catch (err) {
        console.warn('JWT 驗證失敗');
      }
    }
    console.log(userId);
    const data: FeatureCollection = await this.trailsService.getTrails(userId);

    return data;
  }

  @ApiBearerAuth()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async post(@UploadedFile() file: Express.Multer.File) {
    return this.trailsService.post(file);
  }

  @ApiBearerAuth()
  @UseGuards(JwtRequiredGuard)
  @Delete(':uuid')
  delete(@Param('uuid') uuid: string) {
    return this.trailsService.delete(uuid);
  }

  @ApiBearerAuth()
  @Put(':uuid')
  @UseInterceptors(FileInterceptor('file'))
  put(@Param('uuid') uuid: string, @UploadedFile() file: Express.Multer.File) {
    return this.trailsService.put(uuid, file);
  }

  @ApiBearerAuth()
  @Patch(':uuid/properties')
  patch(@Param('uuid') uuid: string, @Body() dto: TrailsInfoDto) {
    return this.trailsService.patch(uuid, dto);
  }

  @ApiBearerAuth()
  @Get('export')
  async getExport(
    @Req() req: Request,
    @Query('type') type: string,
    @Res() res: Response,
  ) {
    let userId: string | null = null;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });
        userId = payload.sub;
      } catch (err) {
        console.warn('JWT 驗證失敗');
      }
    }

    return this.trailsService.getExport(res, type, userId);
  }
}
