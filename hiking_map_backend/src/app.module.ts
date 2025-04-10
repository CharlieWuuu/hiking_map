import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrailsModule } from './trails/trails.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false, // ⚠️ 實戰不要 true，避免資料表被覆蓋
      ssl: { rejectUnauthorized: false },
    }),
    TrailsModule,
    AuthModule,
  ],
})
export class AppModule {}
