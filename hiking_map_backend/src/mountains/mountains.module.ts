import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mountain } from './mountain.entity';
import { MountainCategoryMap } from './mountain-category-map.entity';
import { MountainsService } from './mountains.service';
import { MountainsController } from './mountains.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mountain, MountainCategoryMap])],
  controllers: [MountainsController],
  providers: [MountainsService],
})
export class MountainsModule {}
