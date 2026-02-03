// src/seed.ts
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // --- Seed admin (broker user) ---
  const adminEmail = 'admin@vedun.local';
  const adminPassword = 'admin12345'; // поменяй после первого входа
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: UserRole.ADMIN,
      status: 'ACTIVE' as any,
      fullName: 'Администратор',
      // не удалять кооменты   // passwordHash обычно не трогаем в update, чтобы не перезатирать пароль при повторном seed
      companyName: 'Vedun',
      phone: '+7 900 000-00-00',
    },
    create: {
      email: adminEmail,
      fullName: 'Администратор',
      passwordHash,
      role: UserRole.ADMIN,
      status: 'ACTIVE' as any,
      companyName: 'Vedun',
      phone: '+7 900 000-00-00',
    },
  });

  console.log('Seeded admin:', { id: admin.id, email: admin.email, role: admin.role });

  // --- Seed InsuranceCompany (demo insurer) ---
  const demoInsuranceCompany = await prisma.insuranceCompany.upsert({
    where: { email: 'insurer-demo@vedun.local' },
    update: {
      name: 'Страховая компания (Demo)',
      phone: '+7 900 111-11-11',
      taxId: '7700000000',
      registrationId: '1027700000000',
      createdById: admin.id, // можно перекидывать на админа
    },
    create: {
      name: 'Страховая компания (Demo)',
      email: 'insurer-demo@vedun.local',
      phone: '+7 900 111-11-11',
      taxId: '7700000000',
      registrationId: '1027700000000',
      createdById: admin.id,
    },
  });

  console.log('Seeded insurance company:', {
    id: demoInsuranceCompany.id,
    email: demoInsuranceCompany.email,
    name: demoInsuranceCompany.name,
  });

  // Привязка админа к "тестовой страховой" (по твоему комменту в схеме)
  await prisma.user.update({
    where: { id: admin.id },
    data: {
      insuranceCompanyId: demoInsuranceCompany.id,
    },
  });

  // --- Seed Insuree (demo client company) ---
  const demoInsuree = await prisma.insuree.upsert({
    where: { taxId: '7800000000' },
    update: {
      name: 'Компания-страхователь (Demo)',
      registrationId: '1027800000000',
      countryCode: 'RU',
      industry: 'IT',
      headcount: 120,
      contacts: {
        email: 'security@insuree-demo.local',
        phone: '+7 900 222-22-22',
      } as any,
      status: 'ACTIVE' as any,
      companySize: 'MEDIUM' as any,
      contactName: 'Иван Петров',
      contactEmail: 'security@insuree-demo.local',
      contactPosition: 'CISO',
      phone: '+7 900 222-22-22',
      createdById: admin.id,
    },
    create: {
      name: 'Компания-страхователь (Demo)',
      taxId: '7800000000',
      registrationId: '1027800000000',
      countryCode: 'RU',
      industry: 'IT',
      headcount: 120,
      contacts: {
        email: 'security@insuree-demo.local',
        phone: '+7 900 222-22-22',
      } as any,
      status: 'ACTIVE' as any,
      companySize: 'MEDIUM' as any,
      contactName: 'Иван Петров',
      contactEmail: 'security@insuree-demo.local',
      contactPosition: 'CISO',
      phone: '+7 900 222-22-22',
      createdById: admin.id,
    },
  });

  console.log('Seeded insuree:', { id: demoInsuree.id, taxId: demoInsuree.taxId, name: demoInsuree.name });

  // --- Seed InsuranceAccess (grant demo insurer access to demo insuree) ---
  // @@unique([insureeId, insuranceCompanyId]) -> Prisma обычно генерит where: { insureeId_insuranceCompanyId: {...} }
  const access = await prisma.insuranceAccess.upsert({
    where: {
      insureeId_insuranceCompanyId: {
        insureeId: demoInsuree.id,
        insuranceCompanyId: demoInsuranceCompany.id,
      },
    },
    update: {
      revokedAt: null,
      grantedById: admin.id,
    },
    create: {
      insureeId: demoInsuree.id,
      insuranceCompanyId: demoInsuranceCompany.id,
      grantedById: admin.id,
      // grantedAt сам проставится
    },
  });

  console.log('Seeded insurance access:', {
    id: access.id,
    insureeId: access.insureeId,
    insuranceCompanyId: access.insuranceCompanyId,
  });

  // --- Seed Survey Templates ---
  const templates = [
    {
      version: 'V1_SMALL',
      title: 'Оценка зрелости процессов ИБ — Малый бизнес',
      schema: { template: 'small' }, // позже сюда положим реальные вопросы
    },
    {
      version: 'V1_MEDIUM',
      title: 'Оценка зрелости процессов ИБ — Средний бизнес',
      schema: { template: 'medium' },
    },
    {
      version: 'V1_LARGE',
      title: 'Оценка зрелости процессов ИБ — Крупный бизнес',
      schema: { template: 'large' },
    },
  ] as const;

  for (const t of templates) {
    const existing = await prisma.surveyTemplate.findFirst({
      where: { version: t.version },
    });

    if (existing) {
      await prisma.surveyTemplate.update({
        where: { id: existing.id },
        data: {
          title: t.title,
          schema: t.schema as any,
          status: 'ACTIVE' as any,
          createdById: admin.id,
        },
      });
    } else {
      await prisma.surveyTemplate.create({
        data: {
          version: t.version,
          title: t.title,
          schema: t.schema as any,
          status: 'ACTIVE' as any,
          createdById: admin.id,
        },
      });
    }
  }

  console.log('Seeded survey templates:', templates.map((t) => t.version));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
