// src/seed-surveys.ts
import { PrismaClient, SurveyTemplateStatus } from '@prisma/client'
import { buildSurveySchemaV2 } from './surveys/survey-schema.builder'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@vedun.local' } })
  if (!admin) throw new Error('Admin user not found. Run main seed first.')

  // Собираем актуальную JSON-схему из src/surveys/v2 через builder
  const schema = buildSurveySchemaV2()

  // Какую "version" писать в БД для универсального шаблона:
  // - оставляю "v2", чтобы явно отличать от старых V1_SMALL/MEDIUM/LARGE
  const UNIVERSAL_VERSION = 'v2'
  const UNIVERSAL_TITLE = schema?.title ?? 'Опрос V2 (универсальный)'

  await prisma.$transaction(async (tx) => {
    // 1) upsert универсального шаблона (v2)
    await tx.surveyTemplate.upsert({
      where: { version: UNIVERSAL_VERSION },
      update: {
        title: UNIVERSAL_TITLE,
        schema: schema as any,
        status: SurveyTemplateStatus.ACTIVE,
      },
      create: {
        version: UNIVERSAL_VERSION,
        title: UNIVERSAL_TITLE,
        schema: schema as any,
        status: SurveyTemplateStatus.ACTIVE,
        createdById: admin.id,
      },
    })

    // 2) сделать ВСЕ остальные шаблоны неактивными
    await tx.surveyTemplate.updateMany({
      where: { version: { not: UNIVERSAL_VERSION } },
      data: { status: SurveyTemplateStatus.INACTIVE },
    })
  })

  // 3) выводим состояние (для проверки)
  const templates = await prisma.surveyTemplate.findMany({
    select: { version: true, title: true, status: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  console.log('✅ Survey templates after seed:')
  for (const t of templates) {
    console.log(`- ${t.version} | ${t.status} | ${t.title} | updatedAt=${t.updatedAt.toISOString()}`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
