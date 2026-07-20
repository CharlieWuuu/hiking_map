import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trail } from './trail.entity';
import { TrailGeometry } from './trail-geometry.entity';
import { TrailCategoryMap } from './trail-category-map.entity';
import { TrailMountainMap } from './trail-mountain-map.entity';
import { TrailsService } from './trails.service';
import { TrailsController } from './trails.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trail, TrailGeometry, TrailCategoryMap, TrailMountainMap]),
  ],
  controllers: [TrailsController],
  providers: [TrailsService],
})
export class TrailsModule {}
