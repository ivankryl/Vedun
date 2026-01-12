// src/insured/insured.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanySize, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { CreateInsuredDto } from './dto/create-insured.dto';

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

  async getForOrgById(orgId: string, id: string) {
    const item = await this.prisma.insured.findFirst({
      where: { id, orgId },
    });

    if (!item) {
      throw new NotFoundException({
        code: 'INSURED_NOT_FOUND',
        message: 'Insured not found',
      });
    }

    return item;
  }

  private normalizeInn(inn: string): string {
    return (inn ?? '').replace(/\s+/g, '').trim();
  }

  private normalizeOgrn(ogrn?: string | null): string | null {
    const v = (ogrn ?? '').replace(/\s+/g, '').trim();
    return v ? v : null;
  }

  private parseHeadcount(raw?: number | string | null): number | null {
    if (raw === null || raw === undefined) return null;

    if (typeof raw === 'number') {
      return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : null;
    }

    const digits = String(raw).replace(/[^\d]/g, '');
    if (!digits) return null;

    const n = Number(digits);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
  }

  private companySizeFromHeadcount(n: number | null): CompanySize | null {
    if (!n || n <= 0) return null;
    if (n <= 250) return 'SMALL';
    if (n <= 500) return 'MEDIUM';
    return 'LARGE';
  }

  private pickSurveyVersion(size: CompanySize | null | undefined): string {
    // дефолт для MVP
    if (!size) return 'V1_SMALL';

    if (size === 'SMALL') return 'V1_SMALL';
    if (size === 'MEDIUM') return 'V1_MEDIUM';
    return 'V1_LARGE';
  }

  // “Список опросов для страхователя” = список ссылок + последний ответ
  async listSurveysForOrgInsured(orgId: string, insuredId: string) {
    const insured = await this.prisma.insured.findFirst({
      where: { id: insuredId, orgId },
      select: { id: true },
    });

    if (!insured) {
      throw new NotFoundException({
        code: 'INSURED_NOT_FOUND',
        message: 'Insured not found',
      });
    }

    return this.prisma.surveyLink.findMany({
      where: { insuredId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        token: true,
        status: true,
        expiresAt: true,
        openedAt: true,
        lastActionAt: true,
        completedAt: true,
        reminderSent: true,
        createdAt: true,
        updatedAt: true,
        survey: { select: { id: true, version: true, title: true, status: true } },
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            completenessPercent: true,
            submittedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  // Создать “опрос” = создать ссылку SurveyLink на активный шаблон Survey нужной версии
  async createSurveyForOrgInsured(
    orgId: string,
    insuredId: string,
    createdByUserId?: string,
  ) {
    const insured = await this.prisma.insured.findFirst({
      where: { id: insuredId, orgId },
      select: { id: true, size: true },
    });

    if (!insured) {
      throw new NotFoundException({
        code: 'INSURED_NOT_FOUND',
        message: 'Insured not found',
      });
    }

    const surveyVersion = this.pickSurveyVersion(insured.size);

    const survey = await this.prisma.survey.findFirst({
      where: { version: surveyVersion, status: 'ACTIVE' },
      select: { id: true, version: true, title: true },
    });

    if (!survey) {
      throw new NotFoundException({
        code: 'SURVEY_TEMPLATE_NOT_FOUND',
        message: `Survey template ${surveyVersion} not found`,
      });
    }

    return this.prisma.surveyLink.create({
      data: {
        token: randomUUID(),
        status: 'CREATED',
        insuredId: insured.id,
        surveyId: survey.id,
        createdBy: createdByUserId ?? null,
      },
      select: {
        id: true,
        token: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        survey: { select: { id: true, version: true, title: true } },
      },
    });
  }

  async listSurveyLinksForOrgInsured(orgId: string, insuredId: string) {
    const insured = await this.prisma.insured.findFirst({
      where: { id: insuredId, orgId },
      select: { id: true },
    });

    if (!insured) {
      throw new NotFoundException({
        code: 'INSURED_NOT_FOUND',
        message: 'Insured not found',
      });
    }

    return this.prisma.surveyLink.findMany({
      where: { insuredId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        token: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        survey: { select: { id: true, version: true, title: true, status: true } },
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            completenessPercent: true,
            submittedAt: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async createForOrg(orgId: string, dto: CreateInsuredDto) {
    const name = (dto.name ?? '').trim();
    const inn = this.normalizeInn(dto.inn);
    const ogrn = this.normalizeOgrn(dto.ogrn);
      console.log('DTO IN SERVICE:', dto);
      console.log('DTO.NAME:', dto?.name);

    if (!name) {
      throw new BadRequestException({
        code: 'NAME_REQUIRED',
        message: 'name is required',
      });
    }

    if (!inn) {
      throw new BadRequestException({
        code: 'INN_REQUIRED',
        message: 'inn is required',
      });
    }

    // Определяем CompanySize:
    // 1) если пришёл dto.size (enum) — используем его
    // 2) иначе пробуем конвертировать headcount
    const headcount = this.parseHeadcount(dto.headcount);
    const inferredSize = this.companySizeFromHeadcount(headcount);
    const finalSize: CompanySize | null = dto.size ?? inferredSize ?? null;

    // “мягкая” проверка существования ИНН в другой org
    const existingAnywhere = await this.prisma.insured.findFirst({
      where: { inn },
      select: { id: true, name: true, inn: true, orgId: true, createdAt: true },
    });

    if (existingAnywhere && existingAnywhere.orgId !== orgId) {
      throw new ConflictException({
        code: 'INSURED_INN_EXISTS_IN_ANOTHER_ORG',
        message:
          'Страхователь с таким ИНН уже существует в базе (в другой организации)',
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

          ogrn,
          headcount: headcount ?? null,
          size: finalSize,
          
          contacts: dto.contacts ?? null,
          contactEmail: dto.contactEmail ?? null,
          contactName: dto.contactName ?? null,
          contactTitle: dto.contactTitle ?? null,

          status: dto.status ?? 'ACTIVE',
        },
      });
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const existingInThisOrg = await this.prisma.insured.findUnique({
          where: { orgId_inn: { orgId, inn } },
          select: {
            id: true,
            name: true,
            inn: true,
            orgId: true,
            createdAt: true,
          },
        });

        throw new ConflictException({
          code: 'INSURED_UNIQUE_CONSTRAINT',
          message: 'Страхователь с такими реквизитами уже существует',
          existing: existingInThisOrg ?? undefined,
        });
      }

      throw e;
    }
  }
}
