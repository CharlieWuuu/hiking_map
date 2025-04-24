import { TypeOrmModule } from '@nestjs/typeorm';
import { TrailsModule } from './trails/trails.module';
import { AuthModule } from './auth/auth.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtOptionalMiddleware } from './auth/jwt-optional.middleware';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtOptionalMiddleware).forRoutes('*'); // 全域註冊
  }
}
