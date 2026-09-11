import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

const STATIC_ORIGINS = [
  'http://localhost:4219', // 開發時本機（Next.js 前端）
  'http://localhost:3000', // 開發時本機
  'http://localhost:5173', // 開發時本機（舊版 Vite 前端）
  'https://hiking-map.vercel.app', // 舊的正式前端網址
  'https://hiking-map-git-main-charliewuuus-projects.vercel.app', // 舊的正式前端網址
  'https://hiking-track-next.vercel.app', // 現在的正式前端網址
  'https://hiking-track-next-git-main-charliewuuus-projects.vercel.app', // 現在的正式前端網址
];

// Vercel 每次 push 都會產生一個新的 preview 網址，沒辦法一個個列進白名單。
// 只放行自己專案底下的 preview，不是所有 *.vercel.app。
// 兩個專案名（hiking-map 舊、hiking-track-next 現行）都要涵蓋
const VERCEL_PREVIEW_ORIGIN = /^https:\/\/(hiking-map|hiking-track-next)-[a-z0-9-]+-charliewuuus-projects\.vercel\.app$/;

const ALLOWED_ORIGINS = [...STATIC_ORIGINS, VERCEL_PREVIEW_ORIGIN];

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // 上傳 GPX 時整條軌跡會以 GeoJSON 放在 body 裡，動輒數百 KB
  // （一趟六千多個點約 256 KB），Express 預設的 100kb 會直接回 413
  app.useBodyParser('json', { limit: '10mb' });

  // 在此之前所有 DTO 都只是型別宣告，執行期擋不住任何東西。
  //
  // whitelist 會剝掉沒有宣告驗證裝飾器的欄位，所以每個 request DTO 都必須
  // 補齊裝飾器，否則該欄位會被靜靜丟掉——新增 DTO 欄位時記得一起加。
  // 這裡刻意不開 forbidNonWhitelisted：多送欄位就無視，不需要因此回 400。
  // 不開 enableImplicitConversion：它會在驗證「之前」強制轉型，
  // 於是 @IsString() 欄位收到 { a: 1 } 會先被轉成 "[object Object]" 再通過驗證，
  // 正好抵銷掉這裡想要的型別把關。需要字串轉數字的地方請在 DTO 上明確標註 @Type()。
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

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

  // 一定要綁 0.0.0.0：Nest 預設只聽 localhost，容器外部（例如 Render 的
  // 健康檢查）連不進來，會判定「no open ports detected」而讓部署失敗。
  await app.listen(port, '0.0.0.0');

  console.log(`📘 Swagger docs: http://localhost:${port}/api-docs`);
}
bootstrap();
