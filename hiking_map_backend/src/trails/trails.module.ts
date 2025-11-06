import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrailsService } from './trails.service';
import { TrailsController } from './trails.controller';
import { Trail } from './trail.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Trail]), JwtModule.register({})],
  controllers: [TrailsController],
  providers: [TrailsService],
})
export class TrailsModule {}
