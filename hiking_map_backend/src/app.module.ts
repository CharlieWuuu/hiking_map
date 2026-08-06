import { TypeOrmModule } from '@nestjs/typeorm';
import { V1Module } from './v1/v1.module';
import { AuthModule } from './auth/auth.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtOptionalMiddleware } from './auth/jwt-optional.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';
import { HikesModule } from './hikes/hikes.module';
import { MountainsModule } from './mountains/mountains.module';
import { TrailsModule } from './trails/trails.module';
import { SocialModule } from './social/social.module';
import { SearchModule } from './search/search.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 讓整個應用都能用 process.env
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      ssl: { rejectUnauthorized: false },
    }),
    JwtModule.register({}),
    AuthModule,
    V1Module,
    ProfileModule,
    HikesModule,
    MountainsModule,
    TrailsModule,
    SocialModule,
    SearchModule,
    UploadsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtOptionalMiddleware).forRoutes('*'); // 全域註冊
  }
}
