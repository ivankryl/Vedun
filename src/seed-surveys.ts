// src/seed-surveys.ts
import { PrismaClient, SurveyTemplateStatus } from '@prisma/client'
import { buildSurveySchemaV2 } from './surveys/survey-schema.builder'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@vedun.local' } })
  if (!admin) throw new Error('Admin user not found. Run main seed first.')

  // Строим v2 и временно используем её как v3 (до появления настоящего билдера v3)
  const schemaV2 = buildSurveySchemaV2()
  const schemaV3 = { ...(schemaV2 as any), version: 'v3', title: (schemaV2 as any)?.title ?? 'Опрос V3' }

  await prisma.$transaction(async (tx) => {
    // v2 ACTIVE
    await tx.surveyTemplate.upsert({
      where: { version: 'v2' },
      update: {
        title: schemaV2?.title ?? 'Опрос V2 (универсальный)',
        schema: schemaV2 as any,
        status: SurveyTemplateStatus.ACTIVE,
      },
      create: {
        version: 'v2',
        title: schemaV2?.title ?? 'Опрос V2 (универсальный)',
        schema: schemaV2 as any,
        status: SurveyTemplateStatus.ACTIVE,
        createdById: admin.id,
      },
    })

    // v3 ACTIVE (пока копия v2)
    await tx.surveyTemplate.upsert({
      where: { version: 'v3' },
      update: {
        title: (schemaV3 as any)?.title ?? 'Опрос V3',
        schema: schemaV3 as any,
        status: SurveyTemplateStatus.ACTIVE,
      },
      create: {
        version: 'v3',
        title: (schemaV3 as any)?.title ?? 'Опрос V3',
        schema: schemaV3 as any,
        status: SurveyTemplateStatus.ACTIVE,
        createdById: admin.id,
      },
    })

    // Деактивируем только легаси v1
    await tx.surveyTemplate.updateMany({
      where: { version: { in: ['v1_small', 'v1_medium', 'v1_large'] } },
      data: { status: SurveyTemplateStatus.INACTIVE },
    })
  })

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
