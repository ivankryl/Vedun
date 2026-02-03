// src/seed-surveys.ts
import { PrismaClient, SurveyTemplateStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function readTemplate(relPathFromRepoRoot: string): string {
  const abs = path.resolve(__dirname, '..', relPathFromRepoRoot); // из dist -> в корень
  return fs.readFileSync(abs, 'utf8');
}

async function upsertSurveyTemplate(adminId: string, version: string, title: string, html: string) {
  const schema = { kind: 'html-template', version, title, html };

  await prisma.surveyTemplate.upsert({
    where: { version },
    update: { title, schema: schema as any, status: SurveyTemplateStatus.ACTIVE },
    create: { version, title, schema: schema as any, status: SurveyTemplateStatus.ACTIVE, createdById: adminId },
  });
}

async function main() {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@vedun.local' } });
    if (!admin) throw new Error('Admin user not found. Run main seed first.');
    
    const smallHtml = readTemplate('src/surveys/templates/v1_small.html');
    const mediumHtml = readTemplate('src/surveys/templates/v1_medium.html');
    const largeHtml = readTemplate('src/surveys/templates/v1_large.html');
    
    await upsertSurveyTemplate(admin.id, 'V1_SMALL', 'Опрос V1 — Малый бизнес', smallHtml);
    await upsertSurveyTemplate(admin.id, 'V1_MEDIUM', 'Опрос V1 — Средний бизнес', mediumHtml);
    await upsertSurveyTemplate(admin.id, 'V1_LARGE', 'Опрос V1 — Крупный бизнес', largeHtml);
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
