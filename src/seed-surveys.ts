// src/seed-surveys.ts
import { PrismaClient, SurveyTemplateStatus } from '@prisma/client'
import { buildSurveySchemaV1 } from './surveys/survey-schema.builder'

const prisma = new PrismaClient()

async function upsertSurveyTemplate(adminId: string, version: string, title: string, schema: any) {
  await prisma.surveyTemplate.upsert({
    where: { version },
    update: { title, schema: schema as any, status: SurveyTemplateStatus.ACTIVE },
    create: { version, title, schema: schema as any, status: SurveyTemplateStatus.ACTIVE, createdById: adminId },
  })
}

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@vedun.local' } })
  if (!admin) throw new Error('Admin user not found. Run main seed first.')

  const schemaV1 = buildSurveySchemaV1()

  // на старте можно засеять одним и тем же schema все 3 версии,
  // потом разведёшь SMALL/MEDIUM/LARGE разными списками вопросов
  await upsertSurveyTemplate(admin.id, 'V1_SMALL', 'Опрос V1 — Малый бизнес', schemaV1)
  await upsertSurveyTemplate(admin.id, 'V1_MEDIUM', 'Опрос V1 — Средний бизнес', schemaV1)
  await upsertSurveyTemplate(admin.id, 'V1_LARGE', 'Опрос V1 — Крупный бизнес', schemaV1)

  console.log('✅ Seeded Survey templates: V1_SMALL, V1_MEDIUM, V1_LARGE (JSON schema)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
