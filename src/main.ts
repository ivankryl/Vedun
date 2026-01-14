// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

async function listDir(p: string) {
  try {
    const items = await readdir(p);
    const detailed = await Promise.all(
      items.map(async (name) => {
        const full = join(p, name);
        try {
          const s = await stat(full);
          return `${s.isDirectory() ? 'DIR ' : 'FILE'} ${name}`;
        } catch {
          return `???  ${name}`;
        }
      }),
    );

    console.log(`[TEMPLATES DEBUG] OK  ${p}`);
    console.log(`[TEMPLATES DEBUG]     ${detailed.join(' | ') || '(empty)'}`);
  } catch (e: any) {
    console.log(`[TEMPLATES DEBUG] ERR ${p} -> ${e?.code ?? e}`);
  }
}

async function templatesDebug() {
  console.log('[TEMPLATES DEBUG] cwd =', process.cwd());
  console.log('[TEMPLATES DEBUG] __dirname(main) =', __dirname);

  // Проверяем несколько “подозреваемых” мест, куда assets часто попадают
  const candidates = [
    join(process.cwd(), 'dist'),
    join(process.cwd(), 'dist', 'templates'),
    join(process.cwd(), 'dist', 'dist'),
    join(process.cwd(), 'dist', 'dist', 'templates'),
    join(process.cwd(), 'dist', 'templates', 'templates'),
    join(process.cwd(), 'dist', 'surveys'),
    join(process.cwd(), 'dist', 'surveys', 'templates'),
  ];

  for (const p of candidates) {
    // eslint-disable-next-line no-await-in-loop
    await listDir(p);
  }
}

async function bootstrap() {
  // ВАЖНО: запускаем до NestFactory.create, чтобы лог был даже если приложение падает рано
  await templatesDebug();

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
