// src/insured/insured.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

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

  private pickSurveyVersionBySize(sizeRaw?: string | null): string {
    const n = Number(String(sizeRaw ?? '').replace(/[^\d]/g, ''));
    if (!Number.isFinite(n) || n <= 0) return 'V1_SMALL'; // дефолт для MVP

    if (n <= 250) return 'V1_SMALL';
    if (n <= 500) return 'V1_MEDIUM';
    return 'V1_LARGE';
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

  async createSurveyLinkForOrgInsured(orgId: string, insuredId: string) {
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

    const surveyVersion = this.pickSurveyVersionBySize(insured.size);

    const survey = await this.prisma.survey.findFirst({
      where: { version: surveyVersion, status: 'ACTIVE' },
      select: { id: true, version: true, title: true },
    });

    if (!survey) {
      throw new NotFoundException({
        code: 'SURVEY_TEMPLATE_NOT_FOUND',
        message: `Survey template not found for version ${surveyVersion}`,
      });
    }

    const token = randomUUID();

    return this.prisma.surveyLink.create({
      data: {
        id: randomUUID(), // важно: в Prisma у SurveyLink.id нет @default
        surveyId: survey.id,
        insuredId,
        token,
        status: 'ISSUED',
        // createdBy: req.user.id (если нужно — добавим позже в контроллере)
        expiresAt: null,
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

  async createForOrg(orgId: string, dto: CreateInsuredDto) {
    const name = (dto.name ?? '').trim();
    const inn = this.normalizeInn(dto.inn);

    if (!name) {
      throw new BadRequestException({ code: 'NAME_REQUIRED', message: 'name is required' });
    }

    if (!inn) {
      throw new BadRequestException({ code: 'INN_REQUIRED', message: 'inn is required' });
    }

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
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const existingInThisOrg = await this.prisma.insured.findUnique({
          where: { orgId_inn: { orgId, inn } },
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
