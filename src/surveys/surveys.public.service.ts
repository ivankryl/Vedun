// src/surveys/surveys.public.service.ts
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { LinkStatus, Prisma, ResponseStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SaveSurveyResponseDto, SubmitSurveyResponseDto } from './dto/public-response.dto';
import { RatingCalculator } from './rating/rating.calculator';

@Injectable()
export class SurveysPublicService {
  private readonly logger = new Logger(SurveysPublicService.name);

  constructor(private readonly prisma: PrismaService) {}

  // "Мягкий" доступ для UI: не падаем на EXPIRED/DEACTIVATED, но логируем.
  async getLinkForUi(id: string) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { OR: [{ token: id }, { uuid: id }] },
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
        surveyId: true,
        insureeId: true,
        survey: {
          select: {
            id: true,
            title: true,
            version: true,
            schema: true,
          },
        },
      },
    });

    if (!link) {
      this.logger.warn(`getLinkForUi: link not found for id=${id}`);
      throw new NotFoundException('Survey link not found');
    }

    if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
      this.logger.warn(
        `getLinkForUi: link expired linkId=${link.id} token=${link.token} expiresAt=${link.expiresAt.toISOString()}`,
      );
    }
    if (link.status === LinkStatus.DEACTIVATED) {
      this.logger.warn(`getLinkForUi: link deactivated linkId=${link.id} token=${link.token}`);
    }

    if (!link.survey) {
      this.logger.error(
        `getLinkForUi: missing survey for linkId=${link.id} surveyId=${link.surveyId}`,
      );
      throw new NotFoundException('Survey template not found for link');
    }

    // Подтянем текущий черновик, чтобы фронт мог восстановить прогресс (wizardPageIndex) и ответы
    const current = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: link.id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
      select: { id: true, status: true, answers: true, respondentMeta: true, lastSavedAt: true },
    });

    return {
      ...link,
      // нормализуем schema в чистый JSON (если это Prisma.JsonValue)
      survey: link.survey
        ? {
            ...link.survey,
            schema: link.survey.schema ? JSON.parse(JSON.stringify(link.survey.schema)) : null,
          }
        : null,
      currentResponse: current ?? null,
    };
  }

  // "Жёсткий" доступ для операций, которые изменяют состояние
  async getLinkForRender(id: string) {
    return this.getLinkOrThrow(id);
  }

  private async getLinkOrThrow(id: string) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { OR: [{ token: id }, { uuid: id }] },
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
        surveyId: true,
        insureeId: true,
        survey: {
          select: {
            id: true,
            title: true,
            version: true,
            schema: true,
          },
        },
      },
    });

    if (!link) {
      this.logger.warn(`getLinkOrThrow: link not found for id=${id}`);
      throw new NotFoundException('Survey link not found');
    }

    if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
      this.logger.warn(
        `getLinkOrThrow: expired linkId=${link.id} token=${link.token} expiresAt=${link.expiresAt.toISOString()}`,
      );
      if (link.status !== LinkStatus.EXPIRED && link.status !== LinkStatus.COMPLETED) {
        await this.prisma.surveyLink.update({
          where: { id: link.id },
          data: { status: LinkStatus.EXPIRED, lastActionAt: new Date() },
        });
      }
      throw new BadRequestException('Survey link expired');
    }

    if (link.status === LinkStatus.DEACTIVATED) {
      this.logger.warn(`getLinkOrThrow: deactivated linkId=${link.id} token=${link.token}`);
      throw new BadRequestException('Survey link deactivated');
    }

    if (!link.survey) {
      this.logger.error(
        `getLinkOrThrow: missing survey for linkId=${link.id} surveyId=${link.surveyId}`,
      );
      throw new NotFoundException('Survey template not found for link');
    }

    // Нормализуем schema
    return {
      ...link,
      survey: {
        ...link.survey,
        schema: link.survey.schema ? JSON.parse(JSON.stringify(link.survey.schema)) : null,
      },
    };
  }

  async getLinkByToken(token: string) {
    const link = await this.getLinkOrThrow(token);
    this.logger.debug(
      `getLinkByToken: linkId=${link.id} status=${link.status} surveyVersion=${link.survey?.version}`,
    );

    const current = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: link.id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
      select: {
        id: true,
        status: true,
        answers: true,
        respondentMeta: true,
        completenessPercent: true,
        lastSavedAt: true,
      },
    });

    // Никогда не возвращаем token наружу
    return {
      uuid: link.uuid,
      status: link.status,
      expiresAt: link.expiresAt,
      openedAt: link.openedAt,
      completedAt: link.completedAt,
      createdAt: link.createdAt,
      lastActionAt: link.lastActionAt,
      surveyId: link.surveyId,
      insureeId: link.insureeId,
      survey: link.survey,
      currentResponse: current ?? null,
    };
  }

  async open(token: string) {
    const link = await this.getLinkOrThrow(token);

    if (link.status === LinkStatus.COMPLETED) {
      return { status: link.status, openedAt: link.openedAt, completedAt: link.completedAt };
    }

    const updated = await this.prisma.surveyLink.update({
      where: { id: link.id },
      data: {
        status: link.status === LinkStatus.CREATED ? LinkStatus.OPENED : link.status,
        openedAt: link.openedAt ?? new Date(),
        lastActionAt: new Date(),
      },
      select: { status: true, openedAt: true, lastActionAt: true },
    });

    // Создадим IN_PROGRESS попытку, если её ещё нет — это помогает фронту сразу иметь currentResponse
    const existing = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: link.id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
      select: { id: true },
    });

    if (!existing) {
      await this.prisma.surveyResponse.create({
        data: {
          surveyId: link.surveyId,
          insureeId: link.insureeId,
          linkId: link.id,
          attemptNo: 1,
          answers: {},
          respondentMeta: {},
          status: ResponseStatus.IN_PROGRESS,
          lastSavedAt: new Date(),
        },
      });
    }

    this.logger.debug(
      `open: linkId=${link.id} newStatus=${updated.status} openedAt=${updated.openedAt?.toISOString()}`,
    );

    return updated;
  }

  async getCurrent(token: string) {
    const link = await this.getLinkOrThrow(token);

    const resp = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: link.id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
    });

    this.logger.debug(`getCurrent: linkId=${link.id} found=${!!resp} status=${resp?.status}`);

    return resp;
  }

  async getSubmitted(token: string) {
    const link = await this.getLinkOrThrow(token);

    const resp = await this.prisma.surveyResponse.findFirst({
      where: { linkId: link.id, status: ResponseStatus.SUBMITTED },
      orderBy: { submittedAt: 'desc' },
    });

    this.logger.debug(
      `getSubmitted: linkId=${link.id} found=${!!resp} submittedAt=${resp?.submittedAt?.toISOString()}`,
    );

    return resp;
  }

  async save(token: string, dto: SaveSurveyResponseDto) {
    const link = await this.getLinkOrThrow(token);

    if (link.status === LinkStatus.COMPLETED) {
      this.logger.warn(`save: linkId=${link.id} already completed`);
      throw new BadRequestException('Survey already completed');
    }

    const completeness =
      dto.completenessPercent == null ? undefined : new Prisma.Decimal(dto.completenessPercent);

    const existing = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: link.id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
    });

    const response = existing
      ? await this.prisma.surveyResponse.update({
          where: { id: existing.id },
          data: {
            answers: dto.answers,
            respondentMeta: dto.respondentMeta,
            completenessPercent: completeness,
            lastSavedAt: new Date(),
            status: ResponseStatus.SAVED,
          },
        })
      : await this.prisma.surveyResponse.create({
          data: {
            surveyId: link.surveyId,
            insureeId: link.insureeId,
            linkId: link.id,
            attemptNo: 1,
            answers: dto.answers,
            respondentMeta: dto.respondentMeta,
            completenessPercent: completeness,
            lastSavedAt: new Date(),
            status: ResponseStatus.SAVED,
          },
        });

    await this.prisma.surveyLink.update({
      where: { id: link.id },
      data: { status: LinkStatus.SAVED, lastActionAt: new Date() },
    });

    this.logger.debug(
      `save: linkId=${link.id} responseId=${response.id} status=${response.status} completeness=${response.completenessPercent?.toString()}`,
    );

    return response;
  }

  async submit(token: string, dto: SubmitSurveyResponseDto) {
    const link = await this.getLinkOrThrow(token);

    if (link.status === LinkStatus.COMPLETED) {
      this.logger.warn(`submit: linkId=${link.id} already completed`);
      throw new BadRequestException('Survey already completed');
    }

    // Считаем результаты по schema (template = source of truth)
    const calc = RatingCalculator.calculateBySections(link.survey.schema as any, dto.answers);

    const respondentMeta: Prisma.InputJsonValue = {
      ...(dto.respondentMeta as any ?? {}),
      results: {
        sectionRatings: JSON.parse(JSON.stringify(calc.sectionRatings)),
      },
    };

    const existing = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: link.id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
    });

    const response = existing
      ? await this.prisma.surveyResponse.update({
          where: { id: existing.id },
          data: {
            answers: dto.answers,
            respondentMeta,
            completenessPercent: new Prisma.Decimal(100),
            lastSavedAt: new Date(),
            submittedAt: new Date(),
            status: ResponseStatus.SUBMITTED,
          },
        })
      : await this.prisma.surveyResponse.create({
          data: {
            surveyId: link.surveyId,
            insureeId: link.insureeId,
            linkId: link.id,
            attemptNo: 1,
            answers: dto.answers,
            respondentMeta,
            completenessPercent: new Prisma.Decimal(100),
            lastSavedAt: new Date(),
            submittedAt: new Date(),
            status: ResponseStatus.SUBMITTED,
          },
        });

    await this.prisma.surveyLink.update({
      where: { id: link.id },
      data: {
        status: LinkStatus.COMPLETED,
        completedAt: new Date(),
        lastActionAt: new Date(),
      },
    });

    this.logger.debug(
      `submit: linkId=${link.id} responseId=${response.id} status=${response.status} submittedAt=${response.submittedAt?.toISOString()}`,
    );

    return response;
  }
}
