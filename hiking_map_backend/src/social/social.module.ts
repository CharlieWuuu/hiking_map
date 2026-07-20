import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from './collection.entity';
import { Follow } from './follow.entity';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Follow])],
  controllers: [SocialController],
  providers: [SocialService],
})
export class SocialModule {}
