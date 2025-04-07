import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrailsService } from './trails.service';
import { TrailsController } from './trails.controller';
import { Trail } from './trail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trail])],
  controllers: [TrailsController],
  providers: [TrailsService],
})
export class TrailsModule {}
