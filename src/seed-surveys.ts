// src/seed-surveys.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function readTemplate(relPathFromRepoRoot: string): string {
  const abs = path.resolve(process.cwd(), relPathFromRepoRoot);
  return fs.readFileSync(abs, 'utf8');
}

async function upsertSurvey(version: string, title: string, html: string) {
  const existing = await prisma.survey.findFirst({ where: { version } });

  const schema = {
    kind: 'html-template',
    version,
    title,
    // Храним как строку, Prisma Json это позволяет
    html,
  };

  if (existing) {
    await prisma.survey.update({
      where: { id: existing.id },
      data: { title, schema: schema as any, status: 'ACTIVE' },
    });
  } else {
    await prisma.survey.create({
      data: { version, title, schema: schema as any, status: 'ACTIVE' },
    });
  }
}

async function main() {
  // IMPORTANT:
  // Пути ниже должны быть видны из backend репозитория.
  // Если у тебя монорепа (backend+frontend вместе) — это сработает.
  // Если фронт в другом репо — см. блок "Если frontend не рядом" ниже.

  const smallHtml = readTemplate('src/surveys/templates/v1_small.html');
  const mediumHtml = readTemplate('src/surveys/templates/v1_medium.html');
  const largeHtml = readTemplate('src/surveys/templates/v1_large.html');

  await upsertSurvey('V1_SMALL', 'Опрос V1 — Малый бизнес', smallHtml);
  await upsertSurvey('V1_MEDIUM', 'Опрос V1 — Средний бизнес', mediumHtml);
  await upsertSurvey('V1_LARGE', 'Опрос V1 — Крупный бизнес', largeHtml);

  console.log('✅ Seeded Survey templates: V1_SMALL, V1_MEDIUM, V1_LARGE');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
