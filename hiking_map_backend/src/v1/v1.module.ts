import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Owner } from './owner/owner.entity';
import { V1OwnerController } from './owner/owner.controller';
import { V1OwnerService } from './owner/owner.service';
import { Trail } from './trails/trail.entity';
import { V1TrailsController } from './trails/trails.controller';
import { V1TrailsService } from './trails/trails.service';
import { V1AuthController } from './auth/v1-auth.controller';

/**
 * 舊版前端（v1）用的 API，掛在 /v1/* 底下。
 *
 * 這是 2026-08 重構前的那一套：資料模型是 owner / users_trails，跟現在的
 * users / hikes 是兩套獨立的資料表，互不影響——所以之後改新版 schema
 * 不會弄壞舊站，這也是把它獨立成一個模組而不是做相容層的原因。
 *
 * 程式碼原封不動取自 commit 65739d5^，只改了路由前綴與類別名稱。
 */
@Module({
  imports: [TypeOrmModule.forFeature([Trail, Owner]), JwtModule.register({ secret: process.env.JWT_SECRET || 'your-secret-key', signOptions: { expiresIn: '7d' } })],
  controllers: [V1TrailsController, V1OwnerController, V1AuthController],
  providers: [V1TrailsService, V1OwnerService],
})
export class V1Module {}
