import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateInsuredDto = {
  name: string;
  inn: string;
  // коды/строки — как у тебя в схеме: industry String?, size String?
  industry?: string;
  size?: string;
  contacts?: any; // Json? (можешь типизировать точнее)
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
    const inn = this.normalizeInn(dto.inn);
    const name = (dto.name ?? '').trim();

    if (!name) {
      // Можно заменить на BadRequestException, если используешь валидацию DTO — тогда это лишнее
      throw new ConflictException({ code: 'NAME_REQUIRED', message: 'name is required' });
    }

    if (!inn) {
      throw new ConflictException({ code: 'INN_REQUIRED', message: 'inn is required' });
    }

    // 1) Проверка "существует ли уже где-нибудь в системе" — для уведомления
    const existingAnywhere = await this.prisma.insured.findFirst({
      where: { inn },
      select: { id: true, name: true, inn: true, orgId: true, createdAt: true },
    });

    // Если такой ИНН уже есть, но в ДРУГОЙ org — возвращаем 409 как "уведомление"
    if (existingAnywhere && existingAnywhere.orgId !== orgId) {
      throw new ConflictException({
        code: 'INSURED_INN_EXISTS_IN_ANOTHER_ORG',
        message: 'Страхователь с таким ИНН уже существует в базе (в другой организации)',
        existing: existingAnywhere,
      });
    }

    // Если в ЭТОЙ же org уже есть — тоже 409, но с другим кодом (удобно для фронта)
    if (existingAnywhere && existingAnywhere.orgId === orgId) {
      throw new ConflictException({
        code: 'INSURED_INN_EXISTS_IN_THIS_ORG',
        message: 'Страхователь с таким ИНН уже существует в вашей организации',
        existing: existingAnywhere,
      });
    }

    // 2) Создание
    // Важно: тут используются ТОЛЬКО поля, которые реально есть в schema.prisma
    return this.prisma.insured.create({
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
  }
}
