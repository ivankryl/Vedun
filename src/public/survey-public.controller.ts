// src/public/survey-public.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('public')
export class PublicController {
  private readonly log = new Logger('SurveysPublicController');

  constructor(private readonly prisma: PrismaService) {}

  // ---------- Helpers ----------

  private async getLinkOr404(token: string) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { token },
      select: {
        id: true,
        token: true,
        surveyId: true,
        insureeId: true, // в схеме обязателен (String, not null)
        status: true,
        openedAt: true,
        createdAt: true,
      },
    });
    if (!link) {
      // Можно заменить на NotFoundException, если нужно 404
      throw new Error('LINK_NOT_FOUND');
    }
    return link;
  }

  private async getOrCreateInProgressAttempt(link: {
    id: string;
    surveyId: string;
    insureeId: string; // обязателен по схеме
  }) {
    let current = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: link.id,
        submittedAt: null,
        status: 'IN_PROGRESS',
      },
      orderBy: { attemptNo: 'desc' },
      select: { id: true, attemptNo: true },
    });

    if (!current) {
      const last = await this.prisma.surveyResponse.aggregate({
        where: { linkId: link.id },
        _max: { attemptNo: true },
      });
      const nextAttempt = (last._max.attemptNo ?? 0) + 1;
      current = await this.prisma.surveyResponse.create({
        data: {
          linkId: link.id,
          surveyId: link.surveyId,
          insureeId: link.insureeId, // обязательно string
          attemptNo: nextAttempt,
          answers: {} as any,
          status: 'IN_PROGRESS',
        },
        select: { id: true, attemptNo: true },
      });
    }
    return current;
  }

  // ---------- Core GETs ----------

  @Get('/survey/:token')
  async getSurveyByToken(@Param('token') token: string) {
    const link = await this.getLinkOr404(token);
    this.log.debug(
      `GET /survey/${token} -> status=${link.status} surveyId=${link.surveyId}`,
    );
    return {
      survey: {
        id: link.surveyId,
        version: 'v2',
      },
    };
  }

  @Get('/survey/:token/ui')
  async getSurveyUi(@Param('token') token: string) {
    const link = await this.getLinkOr404(token);
    this.log.debug(
      `GET /survey/${token}/ui -> linkId=${link.id} status=${link.status}`,
    );
    return {
      ui: { pages: [] },
      presentation: { sections: [] },
    };
  }

  // ---------- Open ----------

  @Post('/survey/:token/open')
  @HttpCode(200)
  async openSurvey(@Param('token') token: string) {
    const link = await this.getLinkOr404(token);
    if (link.status !== 'OPENED') {
      await this.prisma.surveyLink.update({
        where: { id: link.id },
        data: { status: 'OPENED', openedAt: new Date() },
      });
    }
    this.log.debug(`open: linkId=${link.id} newStatus=OPENED`);
    return { ok: true, status: 'OPENED' };
  }

  // ---------- Submit ----------

  @Post('/survey/:token/submit')
  @HttpCode(200)
  async submitSurvey(
    @Param('token') token: string,
    @Body()
    body: { answers?: any; respondentMeta?: any },
  ) {
    const { answers, respondentMeta } = body || {};
    const link = await this.getLinkOr404(token);
    const current = await this.getOrCreateInProgressAttempt(link);

    const updated = await this.prisma.surveyResponse.update({
      where: { id: current.id },
      data: {
        answers: (answers ?? {}) as any,
        respondentMeta: (respondentMeta ?? {}) as any,
        completenessPercent: new Prisma.Decimal(
          Number(respondentMeta?.progress ?? 0) || 0,
        ),
        lastSavedAt: new Date(),
        submittedAt: new Date(),
        status: 'SUBMITTED',
      },
      select: {
        id: true,
        attemptNo: true,
        completenessPercent: true,
        submittedAt: true,
      },
    });

    this.log.debug(
      `submit: linkId=${link.id} attempt=${updated.attemptNo} submittedAt=${updated.submittedAt?.toISOString()}`,
    );

    return {
      ok: true,
      id: updated.id,
      attemptNo: updated.attemptNo,
      completenessPercent: updated.completenessPercent,
      submittedAt: updated.submittedAt,
    };
  }

  // ---------- Draft (core impl) ----------

  private async getDraftImpl(token: string) {
    const link = await this.getLinkOr404(token);
    const current = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: link.id,
        submittedAt: null,
        status: 'IN_PROGRESS',
      },
      orderBy: { attemptNo: 'desc' },
      select: {
        id: true,
        attemptNo: true,
        answers: true,
        respondentMeta: true,
        completenessPercent: true,
        lastSavedAt: true,
        status: true,
      },
    });
    return current ?? null;
  }

  private async saveDraftImpl(
    token: string,
    body: { answers?: any; respondentMeta?: any },
  ) {
    const { answers, respondentMeta } = body || {};
    const link = await this.getLinkOr404(token);
    const current = await this.getOrCreateInProgressAttempt(link);
    const progress = Number(respondentMeta?.progress ?? 0);

    const updated = await this.prisma.surveyResponse.update({
      where: { id: current.id },
      data: {
        answers: (answers ?? {}) as any,
        respondentMeta: (respondentMeta ?? {}) as any,
        completenessPercent: new Prisma.Decimal(
          isFinite(progress) ? progress : 0,
        ),
        lastSavedAt: new Date(),
        status: 'IN_PROGRESS',
      },
      select: {
        id: true,
        attemptNo: true,
        completenessPercent: true,
        lastSavedAt: true,
      },
    });

    this.log.debug(
      `draft.save: linkId=${link.id} attempt=${updated.attemptNo} completeness=${updated.completenessPercent}`,
    );

    return {
      ok: true,
      id: updated.id,
      attemptNo: updated.attemptNo,
      completenessPercent: updated.completenessPercent,
      lastSavedAt: updated.lastSavedAt,
    };
  }

  // ---------- Draft routes (без префикса /api) ----------

  @Get('/survey/:token/draft')
  async getDraft(@Param('token') token: string) {
    return this.getDraftImpl(token);
  }

  @Post('/survey/:token/draft')
  @HttpCode(200)
  async saveDraft(
    @Param('token') token: string,
    @Body() body: { answers?: any; respondentMeta?: any },
  ) {
    return this.saveDraftImpl(token, body);
  }

  // ---------- Алиасы под префиксом /public/s/:token/draft ----------
  @Get('s/:token/draft')
  async getDraft_prefixed(@Param('token') token: string) {
    return this.getDraftImpl(token);
  }

  @Post('s/:token/draft')
  @HttpCode(200)
  async saveDraft_prefixed(
    @Param('token') token: string,
    @Body() body: { answers?: any; respondentMeta?: any },
  ) {
    return this.saveDraftImpl(token, body);
  }
}
