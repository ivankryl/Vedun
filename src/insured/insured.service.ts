import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type CreateInsuredDto = {
  name: string;
  inn: string;
  industry?: string;
  size?: string;
  contacts?: any;
  status?: 'ACTIVE' | 'INACTIVE' | 'TEST';
};

@Injectable()
export class InsuredService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.insured.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForOrg(orgId: string) {
    return this.prisma.insured.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private normalizeInn(inn: string): string {
    return (inn ?? '').replace(/\s+/g, '').trim();
  }

  async createForOrg(orgId: string, dto: CreateInsuredDto) {
    const name = (dto.name ?? '').trim();
    const inn = this.normalizeInn(dto.inn);

    if (!name) {
      throw new BadRequestException({ code: 'NAME_REQUIRED', message: 'name is required' });
    }

    if (!inn) {
      throw new BadRequestException({ code: 'INN_REQUIRED', message: 'inn is required' });
    }

    // (Опционально) “мягкая” проверка: существует ли такой ИНН в другой org.
    // Это не гарантия (из-за гонок), но полезно как уведомление.
    const existingAnywhere = await this.prisma.insured.findFirst({
      where: { inn },
      select: { id: true, name: true, inn: true, orgId: true, createdAt: true },
    });

    if (existingAnywhere && existingAnywhere.orgId !== orgId) {
      throw new ConflictException({
        code: 'INSURED_INN_EXISTS_IN_ANOTHER_ORG',
        message: 'Страхователь с таким ИНН уже существует в базе (в другой организации)',
        existing: existingAnywhere,
      });
    }

    try {
      return await this.prisma.insured.create({
        data: {
          orgId,
          name,
          inn,
          industry: dto.industry ?? null,
          size: dto.size ?? null,
          contacts: dto.contacts ?? null,
          status: dto.status ?? 'ACTIVE',
        },
      });
    } catch (e: any) {
      // Жёсткая гарантия уникальности: @@unique([orgId, inn])
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        // Если нужно различать “уже есть в этой org” — достанем существующую запись
        const existingInThisOrg = await this.prisma.insured.findUnique({
          where: { orgId_inn: { orgId, inn } }, // работает при наличии @@unique([orgId, inn])
          select: { id: true, name: true, inn: true, orgId: true, createdAt: true },
        });

        throw new ConflictException({
          code: 'INSURED_INN_EXISTS_IN_THIS_ORG',
          message: 'Страхователь с таким ИНН уже существует в вашей организации',
          existing: existingInThisOrg ?? undefined,
        });
      }

      throw e;
    }
  }
}
