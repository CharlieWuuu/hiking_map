import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchQuery } from './search-query.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SearchQuery])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
