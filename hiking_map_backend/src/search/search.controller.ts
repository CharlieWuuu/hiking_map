import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchResultDto } from './dto/search-result.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @ApiOkResponse({ type: SearchResultDto, isArray: true })
  search(@Query('q') q?: string, @Query('category') category?: string, @Query('county') county?: string) {
    if (q) return this.searchService.search(q);
    if (category || county) return this.searchService.filterTrails(category ?? null, county ?? null);
    return [];
  }
}
