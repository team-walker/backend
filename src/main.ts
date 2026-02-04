import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  console.log(` Server running on http://localhost:${port}`);
}

void bootstrap();
