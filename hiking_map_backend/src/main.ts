import * as dotenv from 'dotenv';
import * as session from 'express-session';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  app.use(cookieParser()); // 解析 Cookie
  app.use(
    session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 10 * 1000,
        sameSite: 'lax',
        secure: false, // 如果在 localhost 測試，請設為 false
      },
    }),
  );
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
    .addCookieAuth('connect.sid')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`📘 Swagger docs: http://localhost:${port}/api-docs`);
}
bootstrap();
