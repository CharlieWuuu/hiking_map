import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Swagger 設定
  const config = new DocumentBuilder()
    .setTitle('Hiking Map API')
    .setDescription('登山地圖後端 API 文件')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Hiking Map API is running at: http://localhost:${port}`);
  console.log(`📘 Swagger docs: http://localhost:${port}/api-docs`);
}
bootstrap();
