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
import { SURVEY_TEMPLATE_V3 } from './v3/index';
import { buildComputeInputFromV3 } from './v3/logic/buildInput';
import { computeMaturity } from './v3/logic/computeMaturity';
import type { SurveyTemplate } from './v3/types';


@Injectable()
export class SurveysPublicService {
  private readonly logger = new Logger(SurveysPublicService.name);

  constructor(private readonly prisma: PrismaService) {}

    // --- helper: гарантирует, что для version='v3' наружу уйдет правильная v3-схема ---
      private normalizeSurveySchemaForPublic(survey: any) {
        if (!survey) return null;

        const version = String(survey.version ?? survey.schema?.version ?? '').toLowerCase();
        let schema = survey.schema ? JSON.parse(JSON.stringify(survey.schema)) : null;

        const isV3 = version === 'v3' || version === '3';
        const isSchemaV3 =
          schema && (String(schema.version).toLowerCase() === 'v3' || String(schema.version) === '3') &&
          Array.isArray(schema.sections) &&
          schema.sections.length > 0;

        if (isV3 && !isSchemaV3) {
          // Подменяем схему на актуальный v3-шаблон
          schema = JSON.parse(JSON.stringify(SURVEY_TEMPLATE_V3));
          this.logger.warn(
            `normalizeSurveySchemaForPublic: schema for surveyId=${survey.id} was not v3, replaced with SURVEY_TEMPLATE_V3`
          );
        }
    return { ...survey, schema };
  }
    // Универсальный расчёт v3 по схеме и answers
    private computeV3Results(schema: SurveyTemplate | null | undefined, answers: Record<string, any>) {
      const titleByKey = new Map<string, string>(
        (schema?.sections ?? []).map((s) => [s.key, s.title || s.key])
      );

      let maturity: any | null = null;

      // Логируем схему
      this.logger.debug(`computeV3Results: schema.sections.length = ${schema?.sections?.length}`);
      this.logger.debug(`computeV3Results: schema.sections = ${JSON.stringify(schema?.sections?.map(s => s.key))}`);

      try {
        if (schema && Array.isArray(schema.sections) && schema.sections.length > 0) {
          const input1 = buildComputeInputFromV3({ schema, answers });

          // Логируем входные данные для расчёта
          this.logger.debug(`computeV3Results: input1.sections.length = ${input1.sections.length}`);
          this.logger.debug(`computeV3Results: input1.sections = ${JSON.stringify(input1.sections)}`);

          const m1 = computeMaturity(input1);

          // Логируем результат первого расчёта
          this.logger.debug(`computeV3Results: maturity.sectionScores.length = ${m1.sectionScores?.length}`);
          this.logger.debug(`computeV3Results: maturity = ${JSON.stringify(m1)}`);

          // Если результат пустой, активируем эвристику
          if (m1?.sectionScores?.length > 0) {
            maturity = m1;
          } else {
            this.logger.warn(`computeV3Results: buildInputFromV3 produced 0 sections — falling back to heuristic`);
          }
        }
      } catch (e) {
        this.logger.warn(`computeV3Results: schema-based failed — ${e instanceof Error ? e.message : String(e)}; falling back to heuristic`);
      }

      // Эвристика
      if (!maturity) {
        const input2 = buildComputeInputFromV3Heuristic({ answers, hygieneMinLevel: 2 as any });

        // Логируем входные данные для эвристики
        this.logger.debug(`computeV3Results: heuristic input.sections.length = ${input2.sections.length}`);
        this.logger.debug(`computeV3Results: heuristic input.sections = ${JSON.stringify(input2.sections)}`);

        const m2 = computeMaturity(input2);

        // Логируем результат эвристического расчёта
        this.logger.debug(`computeV3Results: heuristic maturity.sectionScores.length = ${m2.sectionScores?.length}`);
        this.logger.debug(`computeV3Results: heuristic maturity = ${JSON.stringify(m2)}`);

        maturity = m2;
      }

      const radarDirections = (maturity.sectionScores || []).map((s: any, i: number) => {
        const U = Math.max(1, Number(s.hygieneWindowU) || 0);
        const sum = Number(s.sum) || 0;
        const responses = U > 0 ? (sum / U) * 5 : 0;
        return {
          key: s.sectionKey || `sec_${i + 1}`,
          title: titleByKey.get(s.sectionKey) || s.sectionKey || `Секция ${i + 1}`,
          sanitary: 2.0,
          target: s.targetLevel ?? 4.0,
          responses: Number(responses.toFixed(2)),
        };
      });

      this.logger.debug(
        `computeV3Results: sections=${maturity.sectionScores?.length ?? 0}, CS=${(maturity.CS ?? 0).toFixed?.(3) || '0.000'}`
      );

      return { maturity, radarDirections };
    }


    
    
    
    // Точная загрузка ссылки + survey (с версией)
      private async loadLinkWithSurvey(idOrUuidOrToken: string) {
        const link = await this.prisma.surveyLink.findFirst({
          where: { OR: [{ token: idOrUuidOrToken }, { uuid: idOrUuidOrToken }, { id: idOrUuidOrToken }] },
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
          this.logger.warn(`loadLinkWithSurvey: link not found lookup="${idOrUuidOrToken}"`);
          throw new NotFoundException('Survey link not found');
        }

        const ver = (link as any)?.survey?.version ?? (link as any)?.survey?.schema?.version ?? 'n/a';
        this.logger.debug(
          `PUBLIC_SERVICE[loadLinkWithSurvey]: lookup="${idOrUuidOrToken}" -> link.id=${link.id} uuid=${link.uuid} token=${link.token ?? 'null'} ` +
          `surveyId=${link.surveyId ?? 'null'} version=${ver} status=${link.status}`,
        );

        return link;
      }

    // Старый метод метаданных по uuid
     async getLinkByUuid(uuid: string) {
       const link = await this.loadLinkWithSurvey(uuid);

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
         // >>> НОРМАЛИЗУЕМ СХЕМУ ДЛЯ ПУБЛИЧНОГО ОТДАЧИ
         survey: link.survey ? this.normalizeSurveySchemaForPublic(link.survey) : null,
         currentResponse: current ?? null,
       };
     }

    // Доступ для UI: допускаем uuid или token
     async getLinkForUi(id: string) {
       const link = await this.loadLinkWithSurvey(id);

       if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
         this.logger.warn(
           `getLinkForUi: link expired linkId=${link.id} token=${link.token} expiresAt=${link.expiresAt.toISOString()}`,
         );
       }
       if (link.status === LinkStatus.DEACTIVATED) {
         this.logger.warn(`getLinkForUi: link deactivated linkId=${link.id} token=${link.token}`);
       }
       if (!link.survey) {
         this.logger.error(`getLinkForUi: missing survey for linkId=${link.id} surveyId=${link.surveyId}`);
         throw new NotFoundException('Survey template not found for link');
       }

       const current = await this.prisma.surveyResponse.findFirst({
         where: {
           linkId: link.id,
           status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
         },
         orderBy: { attemptNo: 'desc' },
         select: { id: true, status: true, answers: true, respondentMeta: true, lastSavedAt: true },
       });

       const ver = (link as any)?.survey?.version ?? (link as any)?.survey?.schema?.version ?? 'n/a';
       this.logger.debug(
         `PUBLIC_SERVICE[getLinkForUi]: linkId=${link.id} uuid=${link.uuid} token=${link.token ?? 'null'} surveyId=${link.surveyId} version=${ver} status=${link.status}`,
       );

       return {
         ...link,
         // >>> НОРМАЛИЗУЕМ СХЕМУ
         survey: link.survey ? this.normalizeSurveySchemaForPublic(link.survey) : null,
         currentResponse: current ?? null,
       };
     }
    
    // Жёсткий доступ: бросает ошибки на EXPIRED/DEACTIVATED
      async getLinkForRender(id: string) {
        const link = await this.loadLinkWithSurvey(id);

        if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
          this.logger.warn(
            `getLinkForRender: expired linkId=${link.id} token=${link.token} expiresAt=${link.expiresAt.toISOString()}`,
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
          this.logger.warn(`getLinkForRender: deactivated linkId=${link.id} token=${link.token}`);
          throw new BadRequestException('Survey link deactivated');
        }

        if (!link.survey) {
          this.logger.error(`getLinkForRender: missing survey for linkId=${link.id} surveyId=${link.surveyId}`);
          throw new NotFoundException('Survey template not found for link');
        }

        const ver = (link as any)?.survey?.version ?? (link as any)?.survey?.schema?.version ?? 'n/a';
        this.logger.debug(
          `PUBLIC_SERVICE[getLinkForRender]: linkId=${link.id} uuid=${link.uuid} token=${link.token ?? 'null'} surveyId=${link.surveyId} version=${ver} status=${link.status}`,
        );

        return {
          ...link,
          // >>> НОРМАЛИЗУЕМ СХЕМУ
          survey: link.survey ? this.normalizeSurveySchemaForPublic(link.survey) : null,
        };
      }

  // Метаданные для старого фронта по id/token (наружу token НЕ отдаём)
  async getLinkByToken(id: string) {
    const link = await this.getLinkForRender(id);

    const current = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: (link as any).id,
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

    this.logger.debug(
      `getLinkByToken: linkId=${(link as any).id} status=${(link as any).status} surveyVersion=${(link as any)?.survey?.version}`,
    );

    return {
      uuid: (link as any).uuid,
      status: (link as any).status,
      expiresAt: (link as any).expiresAt,
      openedAt: (link as any).openedAt,
      completedAt: (link as any).completedAt,
      createdAt: (link as any).createdAt,
      lastActionAt: (link as any).lastActionAt,
      surveyId: (link as any).surveyId,
      insureeId: (link as any).insureeId,
      survey: (link as any).survey,
      currentResponse: current ?? null,
    };
  }

  async open(id: string) {
    const link = await this.getLinkForRender(id);

    if ((link as any).status === LinkStatus.COMPLETED) {
      return { status: (link as any).status, openedAt: (link as any).openedAt, completedAt: (link as any).completedAt };
    }

    const updated = await this.prisma.surveyLink.update({
      where: { id: (link as any).id },
      data: {
        status: (link as any).status === LinkStatus.CREATED ? LinkStatus.OPENED : (link as any).status,
        openedAt: (link as any).openedAt ?? new Date(),
        lastActionAt: new Date(),
      },
      select: { status: true, openedAt: true, lastActionAt: true },
    });

    const existing = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: (link as any).id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
      select: { id: true },
    });

    if (!existing) {
      await this.prisma.surveyResponse.create({
        data: {
          surveyId: (link as any).surveyId,
          insureeId: (link as any).insureeId,
          linkId: (link as any).id,
          attemptNo: 1,
          answers: {},
          respondentMeta: {},
          status: ResponseStatus.IN_PROGRESS,
          lastSavedAt: new Date(),
        },
      });
    }

    this.logger.debug(
      `open: linkId=${(link as any).id} newStatus=${updated.status} openedAt=${updated.openedAt?.toISOString()}`,
    );

    return updated;
  }

  async getCurrent(id: string) {
    const link = await this.getLinkForRender(id);

    const resp = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: (link as any).id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
    });

    this.logger.debug(`getCurrent: linkId=${(link as any).id} found=${!!resp} status=${resp?.status}`);
    return resp;
  }

    async getSubmitted(id: string) {
      const link = await this.getLinkForRender(id);

      const resp = await this.prisma.surveyResponse.findFirst({
        where: { linkId: (link as any).id, status: ResponseStatus.SUBMITTED },
        orderBy: { submittedAt: 'desc' },
      });

      this.logger.debug(
        `getSubmitted: linkId=${(link as any).id} found=${!!resp} submittedAt=${resp?.submittedAt?.toISOString()}`
      );

      if (!resp) return resp; // null

      // Нормализованная схема уже подставлена в getLinkForRender()
      const schemaAny = (link as any)?.survey?.schema;
      const ver = String((link as any)?.survey?.version ?? schemaAny?.version ?? '').toLowerCase();

      // Собираем DTO: всегда возвращаем answers, а results — только если v3
      const base = {
        id: (resp as any).id,
        surveyId: (resp as any).surveyId,
        insureeId: (resp as any).insureeId,
        linkId: (resp as any).linkId,
        attemptNo: (resp as any).attemptNo,
        respondentMeta: (resp as any).respondentMeta,
        answers: (resp as any).answers || {},
        completenessPercent: (resp as any).completenessPercent,
        lastSavedAt: (resp as any).lastSavedAt,
        submittedAt: (resp as any).submittedAt,
        status: (resp as any).status,
        createdAt: (resp as any).createdAt,
        updatedAt: (resp as any).updatedAt,
      };

      if (ver === 'v3' || ver === '3') {
        // На всякий случай: если по какой-то причине схема не подставилась — используем шаблон
        const schemaV3: SurveyTemplate =
          schemaAny && Array.isArray(schemaAny.sections) && schemaAny.sections.length > 0
            ? (schemaAny as SurveyTemplate)
            : SURVEY_TEMPLATE_V3;

        const { maturity, radarDirections } = this.computeV3Results(schemaV3, base.answers as any);

        return {
          ...base,
          results: {
            maturity,
            radarDirections,
          },
        };
      }

      // Для v2 — поведение без изменений
      return base;
    }


  async save(id: string, dto: SaveSurveyResponseDto) {
    const link = await this.getLinkForRender(id);

    if ((link as any).status === LinkStatus.COMPLETED) {
      this.logger.warn(`save: linkId=${(link as any).id} already completed`);
      throw new BadRequestException('Survey already completed');
    }

    const completeness =
      dto.completenessPercent == null ? undefined : new Prisma.Decimal(dto.completenessPercent);

    const existing = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: (link as any).id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
    });

    const response = existing
      ? await this.prisma.surveyResponse.update({
          where: { id: (existing as any).id },
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
            surveyId: (link as any).surveyId,
            insureeId: (link as any).insureeId,
            linkId: (link as any).id,
            attemptNo: 1,
            answers: dto.answers,
            respondentMeta: dto.respondentMeta,
            completenessPercent: completeness,
            lastSavedAt: new Date(),
            status: ResponseStatus.SAVED,
          },
        });

    await this.prisma.surveyLink.update({
      where: { id: (link as any).id },
      data: { status: LinkStatus.SAVED, lastActionAt: new Date() },
    });

    this.logger.debug(
      `save: linkId=${(link as any).id} responseId=${(response as any).id} status=${(response as any).status} completeness=${(response as any).completenessPercent?.toString?.()}`,
    );

    return response;
  }

  async submit(id: string, dto: SubmitSurveyResponseDto) {
    const link = await this.getLinkForRender(id);

    if ((link as any).status === LinkStatus.COMPLETED) {
      this.logger.warn(`submit: linkId=${(link as any).id} already completed`);
      throw new BadRequestException('Survey already completed');
    }

    const calc = RatingCalculator.calculateBySections((link as any).survey.schema as any, dto.answers);

      // Если это v3 — дополнительно посчитаем v3 зрелость
      let v3pack: any = null;
      try {
        const surveySchemaAny = (link as any)?.survey?.schema;
        const schemaV3: SurveyTemplate =
          surveySchemaAny && Array.isArray(surveySchemaAny.sections) && surveySchemaAny.sections.length > 0
            ? (surveySchemaAny as SurveyTemplate)
            : SURVEY_TEMPLATE_V3;

        const ver = String((link as any)?.survey?.version ?? surveySchemaAny?.version ?? '').toLowerCase();
        if (ver === 'v3' || ver === '3') {
          v3pack = this.computeV3Results(schemaV3, dto.answers);
        }
      } catch (e) {
        this.logger.warn(`submit[v3]: compute failed: ${e instanceof Error ? e.message : String(e)}`);
      }

      
      const respondentMeta: Prisma.InputJsonValue = {
        ...((dto.respondentMeta as any) ?? {}),
        results: {
          sectionRatings: JSON.parse(JSON.stringify(calc.sectionRatings)),
          ...(v3pack ? { v3: { maturity: v3pack.maturity, radarDirections: v3pack.radarDirections } } : {}),
        },
      };


    const existing = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: (link as any).id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
    });

    const response = existing
      ? await this.prisma.surveyResponse.update({
          where: { id: (existing as any).id },
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
            surveyId: (link as any).surveyId,
            insureeId: (link as any).insureeId,
            linkId: (link as any).id,
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
      where: { id: (link as any).id },
      data: {
        status: LinkStatus.COMPLETED,
        completedAt: new Date(),
        lastActionAt: new Date(),
      },
    });

    this.logger.debug(
      `submit: linkId=${(link as any).id} responseId=${(response as any).id} status=${(response as any).status} submittedAt=${(response as any).submittedAt?.toISOString?.()}`,
    );

    return response;
  }
}
