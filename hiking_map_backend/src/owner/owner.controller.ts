import { Controller, Get, Query } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Owner')
@Controller('owners')
export class OwnerController {
  constructor(private userService: OwnerService) {}

  @Get('list')
  async getList() {
    return this.userService.getList();
  }

  @Get('detail')
  async getDetail(@Query('name') name: string, @Query('type') type: string) {
    return this.userService.getDetail(name, type);
  }
}
