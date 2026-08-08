import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

const STATIC_ORIGINS = [
  'http://localhost:4219', // 開發時本機（Next.js 前端）
  'http://localhost:3000', // 開發時本機
  'http://localhost:5173', // 開發時本機（舊版 Vite 前端）
  'https://hiking-map.vercel.app', // 正式部署後的前端網址
  'https://hiking-map-git-main-charliewuuus-projects.vercel.app', // 正式部署後的前端網址
];

// Vercel 每次 push 都會產生一個新的 preview 網址，沒辦法一個個列進白名單。
// 只放行自己專案底下的 preview，不是所有 *.vercel.app
const VERCEL_PREVIEW_ORIGIN = /^https:\/\/hiking-map-[a-z0-9-]+-charliewuuus-projects\.vercel\.app$/;

const ALLOWED_ORIGINS = [...STATIC_ORIGINS, VERCEL_PREVIEW_ORIGIN];

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // 上傳 GPX 時整條軌跡會以 GeoJSON 放在 body 裡，動輒數百 KB
  // （一趟六千多個點約 256 KB），Express 預設的 100kb 會直接回 413
  app.useBodyParser('json', { limit: '10mb' });

  app.use(cookieParser());
  app.enableCors({
    origin: ALLOWED_ORIGINS,
    credentials: true, // 允許跨域請求攜帶 Cookie
  });

  // Swagger 設定
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('因為架站平台的免費額度有限，因此統一放一起供不同專案使用')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`📘 Swagger docs: http://localhost:${port}/api-docs`);
}
bootstrap();
