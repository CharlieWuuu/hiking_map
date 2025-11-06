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
  @Header('Cache-Control', 'no-store') // 防止 Swagger 快取 304
  async getTrails(
    @Req() req: Request,
    @Query('owner_uuid') ownerUuid: string,
    @Query('type') type: string,
    @Query('uuid') uuid?: string,
    @Query('share') share?: string,
  ): Promise<FeatureCollection> {
    let isLogin: boolean = false;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });

        payload.uuid === ownerUuid && (isLogin = true);
      } catch (err) {
        console.warn('JWT 驗證失敗');
      }
    }
    const data: FeatureCollection = await this.trailsService.getTrails(
      isLogin,
      ownerUuid,
      type,
      uuid,
      share,
    );
    return data;
  }

  @ApiBearerAuth()
  @Get('county_order')
  async getCountyOrder(
    @Query('owner_uuid') owner_uuid: string,
    @Query('type') type: string,
  ) {
    return this.trailsService.getCountyOrder(owner_uuid, type);
  }

  @ApiBearerAuth()
  @Get('trails_month_data')
  async getTrailsMonthData(
    @Query('owner_uuid') owner_uuid: string,
    @Query('type') type: string,
  ) {
    return this.trailsService.getTrailsMonthData(owner_uuid, type);
  }

  @ApiBearerAuth()
  @Get('export')
  async getExport(
    @Req() req: Request,
    @Query('type') type: string,
    @Query('owner_uuid') owner_uuid: string,
    @Res() res: Response,
  ) {
    let isLogin: boolean = false;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });

        isLogin = true;
      } catch (err) {
        console.warn('JWT 驗證失敗');
      }
    }

    return this.trailsService.getExport(res, type, isLogin, owner_uuid);
  }

  @ApiBearerAuth()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async post(
    @Body('owner_uuid') owner_uuid: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.trailsService.post(owner_uuid, file);
  }

  @ApiBearerAuth()
  @Put(':uuid')
  @UseInterceptors(FileInterceptor('file'))
  put(
    @Body('uuid') uuid: string,
    @Body('owner_uuid') owner_uuid: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.trailsService.put(uuid, owner_uuid, file);
  }

  @ApiBearerAuth()
  @UseGuards(JwtRequiredGuard)
  @Delete(':uuid')
  delete(@Param('uuid') uuid: string) {
    return this.trailsService.delete(uuid);
  }

  @ApiBearerAuth()
  @Patch(':uuid/properties')
  patch(@Param('uuid') uuid: string, @Body() dto: TrailsInfoDto) {
    return this.trailsService.patch(uuid, dto);
  }
}
