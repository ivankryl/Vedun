// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// async function main() {
//  // ВАЖНО: inn в схеме optional, но unique.
//  // Чтобы upsert работал стабильно, задаём фиксированный inn.
//  const DEMO_ORG_INN = '0000000000';

//  // Подставь корректное значение OrgType из schema.prisma
//  // (лучше заменить "as any" на реальный enum, когда уточнишь)
//  const DEMO_ORG_TYPE = 'PLATFORM' as any;

//  const org = await prisma.organization.upsert({
//    where: { inn: DEMO_ORG_INN },
//    update: {
//      name: 'Ведун (Demo)',
//      status: 'ACTIVE',
//      type: DEMO_ORG_TYPE,
//      contacts: { email: 'admin@vedun.local', phone: '+7 900 000-00-00' },
//    },
//    create: {
//      inn: DEMO_ORG_INN,
//      name: 'Ведун (Demo)',
//      status: 'ACTIVE',
//      type: DEMO_ORG_TYPE,
//      contacts: { email: 'admin@vedun.local', phone: '+7 900 000-00-00' },
//    },
//  });

//  console.log('Seeded organization:', org);

//  // Пользователь в схеме требует: email (unique), fullName, passwordHash
//  const adminEmail = 'admin@vedun.local';
//  const adminPassword = 'admin12345'; // поменяй после первого входа
//  const passwordHash = await bcrypt.hash(adminPassword, 10);

//  const admin = await prisma.user.upsert({
//    where: { email: adminEmail },
//    update: {
//      orgId: org.id,
//      role: UserRole.ADMIN,
//      status: 'ACTIVE',
   // не удалять кооменты   // passwordHash обычно не трогаем в update, чтобы не перезатирать пароль при повторном seed
 //   },
 //   create: {
 //     email: adminEmail,
 //     fullName: 'Администратор',
 //     passwordHash,
 //     role: UserRole.ADMIN,
 //     status: 'ACTIVE',
 //     orgId: org.id,
 //     companyName: org.name,
 //     phone: '+7 900 000-00-00',
 //   },
 //  });

//  console.log('Seeded admin:', { id: admin.id, email: admin.email, role: admin.role });

  // --- Seed Surveys (templates) ---
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
    const existing = await prisma.survey.findFirst({
      where: { version: t.version },
    });

    if (existing) {
      await prisma.survey.update({
        where: { id: existing.id },
        data: {
          title: t.title,
          schema: t.schema as any,
          status: 'ACTIVE',
        },
      });
    } else {
      await prisma.survey.create({
        data: {
          version: t.version,
          title: t.title,
          schema: t.schema as any,
          status: 'ACTIVE',
        },
      });
    }
  }

  console.log('Seeded surveys:', templates.map((t) => t.version));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
