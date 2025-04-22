// upload.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { ApiBody, ApiTags, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Upload')
@Controller('upload')
export class UploadsController {
  constructor(private readonly uploadService: UploadsService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadService.handleUpload(file);
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    return await this.uploadService.deleteByUuid(uuid);
  }
}
