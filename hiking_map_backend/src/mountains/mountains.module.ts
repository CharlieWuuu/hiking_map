import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mountain } from './mountain.entity';
import { MountainCategoryMap } from './mountain-category-map.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mountain, MountainCategoryMap])],
})
export class MountainsModule {}
