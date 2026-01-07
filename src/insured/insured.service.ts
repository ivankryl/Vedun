import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateInsuredDto = {
  name?: string;
  inn?: string;
  contactName?: string;
  // пока фиксируем отрасль и размер, потом можно сделать выбор
  industryCode?: string; // 2 цифры
  sizeCode?: string;     // 1 цифра
};

@Injectable()
export class InsuredService {
  constructor(private readonly prisma: PrismaService) {}

    async findAll() {
      return this.prisma.insured.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

  async listForOrg(_orgId: string) {
    return this.prisma.insured.findMany({
      // where: { orgId }, // если у тебя у страхователя есть связь с org
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateCode(
    industryCode: string,
    sizeCode: string,
  ): Promise<string> {
    // найдём максимальный serial среди существующих
    const last = await this.prisma.insured.findFirst({
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    let lastSerial = 1203; // на 1 меньше стартового (1204)
    if (last?.code && last.code.length === 12) {
      const serialPart = last.code.slice(3); // с 4 по 12
      const parsed = parseInt(serialPart, 10);
      if (!Number.isNaN(parsed)) {
        lastSerial = parsed;
      }
    }

    const nextSerial = lastSerial + 1;
    const serialStr = nextSerial.toString().padStart(9, '0');

    return `${industryCode}${sizeCode}${serialStr}`;
  }

  async createForOrg(_orgId: string, dto: CreateInsuredDto) {
    const industry = dto.industryCode ?? '01';
    const size = dto.sizeCode ?? '1';

    const code = await this.generateCode(industry, size);

    return this.prisma.insured.create({
        data: {
            code,
            name: dto.name ?? null,
            inn: dto.inn ?? null,
            contactName: dto.contactName ?? null,
            // раз поля есть в модели — логично сохранить
            industry,
            size,
        },
    });
  }
}
