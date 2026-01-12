// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'https://vedun-f.onrender.com'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ✅ Один-единственный setGlobalPrefix, с exclude для публичного survey
  app.setGlobalPrefix('api', {
    exclude: [
      { path: '', method: RequestMethod.ALL },
      { path: 'survey/:token', method: RequestMethod.GET },
    ],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // (Можно оставить, даже если пока не используете напрямую)
  app.get(ConfigService);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on port ${port}`);

  process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
  });
}

bootstrap();
