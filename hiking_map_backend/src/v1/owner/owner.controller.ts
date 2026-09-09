import { Controller, Get, Query } from '@nestjs/common';
import { V1OwnerService } from './owner.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('v1 (舊版前端)')
@Controller('v1/owners')
export class V1OwnerController {
  constructor(private userService: V1OwnerService) {}

  @Get('list')
  async getList() {
    return this.userService.getList();
  }

  @Get('detail')
  async getDetail(@Query('name') name: string, @Query('type') type: string) {
    return this.userService.getDetail(name, type);
  }
}
