import { Controller, Get, Post, Query, Req, Body } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchResultDto } from './dto/search-result.dto';
import { PopularQueryDto } from './dto/popular-query.dto';
import { LogSearchQueryDto } from './dto/log-search-query.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  // JwtOptionalMiddleware 全域套用，未登入時 req.user 就是 undefined
  @Get()
  @ApiOkResponse({ type: SearchResultDto, isArray: true })
  search(
    @Query('q') q: string | undefined,
    @Query('category') category: string | undefined,
    @Query('county') county: string | undefined,
    @Req() req: any,
  ) {
    if (q) return this.searchService.search(q, req.user?.user_id);
    if (category || county) return this.searchService.filterTrails(category ?? null, county ?? null);
    return [];
  }

  @Get('popular')
  @ApiOkResponse({ type: PopularQueryDto, isArray: true })
  popularQueries() {
    return this.searchService.popularQueries();
  }

  // 只有使用者真正送出搜尋（按 Enter／點搜尋圖示）才呼叫，
  // SearchBar 打字中的即時建議呼叫 GET /search 不會記錄，避免統計失真
  @Post('log')
  @ApiCreatedResponse()
  async logQuery(@Body() dto: LogSearchQueryDto) {
    await this.searchService.logQuery(dto.query);
    return { success: true };
  }
}
