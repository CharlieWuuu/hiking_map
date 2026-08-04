import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from './collection.entity';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { User } from '../auth/auth.entity';
import { Profile } from '../profile/profile.entity';
import { Trail } from '../trails/trail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, User, Profile, Trail])],
  controllers: [SocialController],
  providers: [SocialService],
})
export class SocialModule {}
