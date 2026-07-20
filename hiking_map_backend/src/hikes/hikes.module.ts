import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hike } from './hike.entity';
import { HikeTrack } from './hike-track.entity';
import { Category } from './hike-category.entity';
import { HikeCategoryMap } from './hike-category-map.entity';
import { HikesService } from './hikes.service';
import { HikesController } from './hikes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Hike, HikeTrack, Category, HikeCategoryMap])],
  controllers: [HikesController],
  providers: [HikesService],
})
export class HikesModule {}
