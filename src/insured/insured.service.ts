import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateInsuredDto = {
  name?: string;
  inn?: string;
  contactName?: string;
  // пока фиксируем отрасль и размер, потом можно сделать выбор
  industryCode?: string; // 2 цифры
  sizeCode?: string; // 1 цифра
};

@Injectable()
export class InsuredService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const insuredList = await this.prisma.insured.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return insuredList.map((i) => ({
      ...i,
      industry: i.industry ?? '',
      size: i.size ?? '',
    }));
  }

  async listForOrg(orgId: string) {
    return this.prisma.insured.findMany({
      where: { orgId }, // если у тебя у страхователя есть связь с org
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateCode(industryCode: string, sizeCode: string): Promise<string> {
    const prefix = `${industryCode}${sizeCode}`; // 2 + 1 символ = 3
    const last = await this.prisma.insured.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });
    let lastSerial = 1203; // на 1 меньше стартового (1204)
    if (last?.code && last.code.length === 12) {
      const serialPart = last.code.slice(3); // последние 9 символов
      const parsed = parseInt(serialPart, 10);
      if (!Number.isNaN(parsed)) lastSerial = parsed;
    }
    const nextSerial = lastSerial + 1;
    const serialStr = nextSerial.toString().padStart(9, '0');
    return `${prefix}${serialStr}`; // итого 12 символов
  }

  async createForOrg(orgId: string, dto: CreateInsuredDto) {
    const industry = dto.industryCode ?? '01';
    const size = dto.sizeCode ?? '1';
    const code = await this.generateCode(industry, size);
    return this.prisma.insured.create({
      data: {
        orgId,
        code,
        name: dto.name ?? null,
        inn: dto.inn ?? null,
        contactName: dto.contactName ?? null,
        industry,
        size,
      },
    });
  }
}
