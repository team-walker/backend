import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // NestJS 내장 로거 인스턴스 생성
  const logger = new Logger('Bootstrap');

  // ✅ CORS 허용 (Next 3000 → Nest 3001)
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: 'docs/json',
  });

  const port = process.env.PORT ?? 3001;

  await app.listen(port);

  // console.log 대신 logger.log 사용
  logger.log(`Server running on http://localhost:${port}`);
}

void bootstrap();
