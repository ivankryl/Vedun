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

type Segment = 'SMALL' | 'MEDIUM' | 'LARGE';

@Injectable()
export class InsuredService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.insuree.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForUser(createdById: string) {
    return this.prisma.insuree.findMany({
      where: { createdById },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getForUserById(createdById: string, id: string) {
    const item = await this.prisma.insuree.findFirst({
      where: { id, createdById },
    });

    if (!item) {
      throw new NotFoundException({
        code: 'INSUREE_NOT_FOUND',
        message: 'Insuree not found',
      });
    }

    return item;
  }

  private normalizeTaxId(taxId: string): string {
    return (taxId ?? '').replace(/\s+/g, '').trim();
  }

  private normalizeRegistrationId(registrationId?: string | null): string | null {
    const v = (registrationId ?? '').replace(/\s+/g, '').trim();
    return v ? v : null;
  }

  private parseHeadcount(raw?: number | string | null): number | null {
    if (raw === null || raw === undefined) return null;

    if (typeof raw === 'number') {
      return Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : null;
    }

    const digits = String(raw).replace(/[^\d]/g, '');
    if (!digits) return null;

    const n = Number(digits);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
  }

  private resolveSegmentFromCompanySize(size: CompanySize): Segment {
    const raw = (size ?? '').toString().trim().toUpperCase();
    if (raw === 'SMALL' || raw === 'MEDIUM' || raw === 'LARGE') return raw as Segment;
    throw new BadRequestException('Invalid companySize');
  }

  // “Список опросов для страхователя” = список ссылок + последний ответ
  async listSurveysForUserInsuree(createdById: string, insureeId: string) {
    const insuree = await this.prisma.insuree.findFirst({
      where: { id: insureeId, createdById },
      select: { id: true },
    });

    if (!insuree) {
      throw new NotFoundException({
        code: 'INSUREE_NOT_FOUND',
        message: 'Insuree not found',
      });
    }

    return this.prisma.surveyLink.findMany({
      where: { insureeId },
      orderBy: { createdAt: 'desc' },
      select: {
        uuid: true,
        token: true,
        status: true,
        expiresAt: true,
        openedAt: true,
        lastActionAt: true,
        completedAt: true,
        reminderSent: true,
        createdAt: true,
        updatedAt: true,
        survey: { select: { id: true, title: true, status: true } },
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

  // Создать “опрос” = создать ссылку SurveyLink на активный шаблон SurveyTemplate по сегменту
  async createSurveyForUserInsuree(
    createdById: string,
    insureeId: string,
  ) {
    const insuree = await this.prisma.insuree.findFirst({
      where: { id: insureeId, createdById },
      select: { id: true, companySize: true },
    });

    if (!insuree) {
      throw new NotFoundException({
        code: 'INSUREE_NOT_FOUND',
        message: 'Insuree not found',
      });
    }

    const segment = this.resolveSegmentFromCompanySize(insuree.companySize);

    const surveyTemplate = await this.prisma.surveyTemplate.findFirst({
      where: {
        status: 'ACTIVE',
        // title: segment, // если используете title как SMALL/MEDIUM/LARGE — раскомментируйте
      },
      select: { id: true, title: true, status: true },
    });

    if (!surveyTemplate) {
      throw new NotFoundException({
        code: 'SURVEY_TEMPLATE_NOT_FOUND',
        message: `Survey template not found for segment ${segment}`,
      });
    }

    return this.prisma.surveyLink.create({
      data: {
        token: randomUUID(),
        status: 'CREATED',
        insureeId: insuree.id,
        surveyId: surveyTemplate.id,
        createdById,
      },
      select: {
        uuid: true,
        token: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        survey: { select: { id: true, title: true, status: true } },
      },
    });
  }

  // Новый расширенный список ссылок с агрегированными полями lastSavedAt/completenessPercent/submittedAt/openedAt
  async listSurveyLinksForUserInsuree(createdById: string, insureeId: string) {
    const insuree = await this.prisma.insuree.findFirst({
      where: { id: insureeId, createdById },
      select: { id: true },
    });

    if (!insuree) {
      throw new NotFoundException({
        code: 'INSUREE_NOT_FOUND',
        message: 'Insuree not found',
      });
    }

    // 1) Получаем список ссылок
    const links = await this.prisma.surveyLink.findMany({
      where: { insureeId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        uuid: true,
        token: true,
        status: true,
        expiresAt: true,
        openedAt: true,
        lastActionAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        survey: { select: { id: true, title: true, status: true, version: true } as any },
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

    // 2) Для каждой ссылки достанем активный черновик и последнюю отправку
    const result = await Promise.all(
      links.map(async (link) => {
        const activeDraft = await this.prisma.surveyResponse.findFirst({
          where: { linkId: link.id, status: 'IN_PROGRESS' },
          orderBy: { attemptNo: 'desc' },
          select: {
            id: true,
            attemptNo: true,
            lastSavedAt: true,
            completenessPercent: true,
          },
        });

        const submittedAttempt = await this.prisma.surveyResponse.findFirst({
          where: { linkId: link.id, status: 'SUBMITTED' },
          orderBy: { attemptNo: 'desc' },
          select: {
            id: true,
            attemptNo: true,
            submittedAt: true,
          },
        });

        // Бэкап на случай, если submittedAttempt не найден, но в responses[0] есть submittedAt
        const fallbackSubmittedAt =
          link.responses?.[0]?.status === 'SUBMITTED' ? link.responses?.[0]?.submittedAt ?? null : null;

        return {
          uuid: link.uuid,
          token: link.token ?? link.uuid,
          status: link.status,
          expiresAt: link.expiresAt,
          openedAt: link.openedAt ?? null,
          lastActionAt: link.lastActionAt ?? null,
          completedAt: link.completedAt ?? null,
          createdAt: link.createdAt,
          updatedAt: link.updatedAt,
          survey: link.survey
            ? {
                id: link.survey.id,
                title: (link.survey as any).title ?? null,
                status: (link.survey as any).status ?? null,
                version: (link.survey as any).version ?? undefined,
              }
            : undefined,
          responses: link.responses?.map((r) => ({
            id: r.id,
            status: r.status,
            completenessPercent: r.completenessPercent ?? null,
            submittedAt: r.submittedAt ?? null,
            createdAt: r.createdAt,
          })) ?? [],
          // Новые агрегаты для фронта
          lastSavedAt: activeDraft?.lastSavedAt ?? null,
          completenessPercent:
            typeof activeDraft?.completenessPercent === 'number'
              ? Math.max(0, Math.min(100, Math.round(activeDraft!.completenessPercent)))
              : null,
          submittedAt: submittedAttempt?.submittedAt ?? fallbackSubmittedAt ?? null,
        };
      })
    );

    return result;
  }

  async createForUser(createdById: string, dto: CreateInsuredDto) {
    const name = (dto.name ?? '').trim();
    const taxId = this.normalizeTaxId(dto.taxId);
    const registrationId = this.normalizeRegistrationId(dto.registrationId);
    const headcount = this.parseHeadcount(dto.headcount);

    if (!name) {
      throw new BadRequestException({ code: 'NAME_REQUIRED', message: 'name is required' });
    }
    if (!taxId) {
      throw new BadRequestException({ code: 'TAX_ID_REQUIRED', message: 'taxId is required' });
    }
    if (!dto.countryCode?.trim()) {
      throw new BadRequestException({ code: 'COUNTRY_CODE_REQUIRED', message: 'countryCode is required' });
    }
    if (!dto.companySize) {
      throw new BadRequestException({ code: 'COMPANY_SIZE_REQUIRED', message: 'companySize is required' });
    }
    if (!dto.contactName?.trim()) {
      throw new BadRequestException({ code: 'CONTACT_NAME_REQUIRED', message: 'contactName is required' });
    }
    if (!dto.contactEmail?.trim()) {
      throw new BadRequestException({ code: 'CONTACT_EMAIL_REQUIRED', message: 'contactEmail is required' });
    }

    // “мягкая” проверка существования taxId у другого createdBy
    const existingAnywhere = await this.prisma.insuree.findFirst({
      where: { taxId },
      select: { id: true, name: true, taxId: true, createdById: true, createdAt: true },
    });

    if (existingAnywhere && existingAnywhere.createdById !== createdById) {
      throw new ConflictException({
        code: 'INSUREE_TAXID_EXISTS_FOR_ANOTHER_USER',
        message: 'Insuree with this taxId already exists (for another owner)',
        existing: existingAnywhere,
      });
    }

    try {
      return await this.prisma.insuree.create({
        data: {
          createdById,
          name,
          taxId,
          registrationId,
          countryCode: dto.countryCode.trim().toUpperCase(),
          companySize: dto.companySize,
          industry: dto.industry ?? undefined,
          headcount,
          contacts: dto.contacts ?? undefined,
          status: dto.status ?? 'ACTIVE',
          contactName: dto.contactName,
          contactEmail: dto.contactEmail,
          contactPosition: dto.contactPosition ?? undefined,
          phone: dto.phone ?? undefined,
          domainInfo: dto.domainInfo ?? undefined,
        },
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException({
          code: 'INSUREE_UNIQUE_CONSTRAINT',
          message: 'Insuree with these requisites already exists',
        });
      }
      throw e;
    }
  }
}
