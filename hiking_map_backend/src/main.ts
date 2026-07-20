import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  app.enableCors({
    origin: [
      'http://localhost:3000', // 開發時本機
      'http://localhost:5173', // 開發時本機
      'https://hiking-map.vercel.app', // 正式部署後的前端網址
      'https://hiking-map-git-main-charliewuuus-projects.vercel.app', // 正式部署後的前端網址
    ],
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
