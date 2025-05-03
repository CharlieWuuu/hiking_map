import { TypeOrmModule } from '@nestjs/typeorm';
import { TrailsModule } from './trails/trails.module';
import { AuthModule } from './auth/auth.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtOptionalMiddleware } from './auth/jwt-optional.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { OwnerModule } from './owner/owner.module';

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
    TrailsModule,
    AuthModule,
    OwnerModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtOptionalMiddleware).forRoutes('*'); // 全域註冊
  }
}
