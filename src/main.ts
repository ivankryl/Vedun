// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod, Logger } from '@nestjs/common';
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

    Logger.log(`[TEMPLATES DEBUG] OK  ${p}`);
    Logger.log(`[TEMPLATES DEBUG]     ${detailed.join(' | ') || '(empty)'}`);
  } catch (e: any) {
    Logger.warn(`[TEMPLATES DEBUG] ERR ${p} -> ${e?.code ?? e}`);
  }
}

async function templatesDebug() {
  Logger.log('[TEMPLATES DEBUG] cwd = ' + process.cwd());
  Logger.log('[TEMPLATES DEBUG] __dirname(main) = ' + __dirname);

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

async function logRegisteredRoutes(app: any) {
  const log = new Logger('Routes');
  try {
    const httpAdapter = app.getHttpAdapter();
    const server = httpAdapter.getHttpServer();
    const router = server?._events?.request?.router || server?._router;
    const stack = router?.stack || [];
    log.log(`Registered routes (${stack.length}):`);
    for (const layer of stack) {
      const route = layer.route;
      if (route) {
        const path = route?.path;
        const methods = Object.keys(route?.methods || {})
          .filter((m) => route.methods[m])
          .map((m) => m.toUpperCase())
          .join(',');
        log.log(`- ${methods} ${path}`);
      }
    }
  } catch (e) {
    log.warn(`Route logging failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

function getLogLevels(): ('log'|'error'|'warn'|'debug'|'verbose')[] {
  // Можно задавать ENV LOG_LEVELS=log,debug,warn,error  или LOG_LEVEL=debug
  if (process.env.LOG_LEVELS) {
    return process.env.LOG_LEVELS.split(',').map(s => s.trim() as any).filter(Boolean);
  }
  const single = (process.env.LOG_LEVEL || '').trim().toLowerCase();
  if (single) {
    const order = ['error','warn','log','debug','verbose'];
    const idx = order.indexOf(single);
    if (idx >= 0) {
      // Включаем все уровни «ниже по важности»
      return ['log','error','warn','debug','verbose'].filter(l => order.indexOf(l) <= idx) as any;
    }
  }
  // Дефолт: включаем debug в проде для диагностики; при желании сузить — поставь LOG_LEVELS
  return ['log', 'error', 'warn', 'debug'];
}

async function bootstrap() {
  const levels = getLogLevels();
  // Синхронизируем глобальный Nest Logger
  Logger.overrideLogger(levels);

  await templatesDebug();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: levels, // <- ключевое: включаем нужные уровни для всего приложения
  });

  // Не подменяем логгер кастомным экземпляром, чтобы не потерять уровни
  // app.useLogger(new Logger('NestApp'));

  app.enableCors({
    origin: ['http://localhost:5173', 'https://vedun-f.onrender.com'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Глобальный префикс 'api' + исключения для публичных маршрутов
  app.setGlobalPrefix('api', {
    exclude: [
      // HTML page (вариант A)
      { path: 's/:id', method: RequestMethod.GET },

      // Public survey JSON API (без /api)
      { path: 'survey/:token', method: RequestMethod.ALL },
      { path: 'survey/:token/ui', method: RequestMethod.ALL },
      { path: 'survey/:token/open', method: RequestMethod.ALL },
      { path: 'survey/:token/save', method: RequestMethod.ALL },
      { path: 'survey/:token/submit', method: RequestMethod.ALL },
      { path: 'survey/:token/current', method: RequestMethod.ALL },
      { path: 'survey/:token/results', method: RequestMethod.ALL },
      { path: 'survey/:token/draft', method: RequestMethod.ALL },

      // ВАЖНО: исключаем черновики под префиксом /public
      { path: 'public/s/:token/draft', method: RequestMethod.ALL },
    ],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = app.get(ConfigService);
  Logger.debug(`ConfigService loaded: ${!!config}`);

  await logRegisteredRoutes(app);

  const port = Number(process.env.PORT) || 3000;
  const host = '0.0.0.0';
  await app.listen(port, host);

  Logger.log(`API listening on ${host}:${port}`);
  Logger.debug(`NODE_ENV=${process.env.NODE_ENV ?? '(unset)'} APP_ENV=${process.env.APP_ENV ?? '(unset)'} LOG_LEVELS=${process.env.LOG_LEVELS ?? '(unset)'} LOG_LEVEL=${process.env.LOG_LEVEL ?? '(unset)'}`);

  process.on('unhandledRejection', (reason) => {
    Logger.error(`UNHANDLED REJECTION: ${String(reason)}`);
  });

  process.on('uncaughtException', (err) => {
    Logger.error(`UNCAUGHT EXCEPTION: ${err?.stack ?? err}`);
  });
}

bootstrap();
