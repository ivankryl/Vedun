// src/public/survey-public.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('public')
export class PublicController {
  constructor(private readonly prisma: PrismaService) {}

  // --- helpers ---
  private async getLinkOr404(token: string) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { token },
      select: {
        id: true,
        uuid: true,
        token: true,
        status: true,
        expiresAt: true,
        insureeId: true,
        surveyId: true,
        survey: {
          select: {
            id: true,
            version: true,
            title: true,
            status: true,
            schema: true,
          },
        },
      },
    });
    if (!link) {
      throw new NotFoundException({
        code: 'LINK_NOT_FOUND',
        message: 'Survey link not found',
      });
    }
    return link;
  }

  private async getOrCreateInProgressAttempt(link: any) {
    let current = await this.prisma.surveyResponse.findFirst({
      where: { linkId: link.id, submittedAt: null, status: 'IN_PROGRESS' },
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
          insureeId: link.insureeId,
          attemptNo: nextAttempt,
          answers: {} as any,
          status: 'IN_PROGRESS',
        },
        select: { id: true, attemptNo: true },
      });
    }
    return current;
  }

  // --- existing (метаданные ссылки) ---
  @Get('s/:token')
  async getSurveyByToken_prefixed(@Param('token') token: string) {
    return this.getLinkOr404(token);
  }

  // Зеркало пути без префикса: GET /survey/:token
  @Get('/survey/:token')
  async getSurveyByToken(@Param('token') token: string) {
    return this.getLinkOr404(token);
  }

  // --- SUBMIT (финальная отправка) ---
  @Post('s/:token/submit')
  async submitByToken_prefixed(
    @Param('token') token: string,
    @Body() body: { answers: any; respondentMeta?: any },
  ) {
    return this.submitImpl(token, body);
  }

  @Post('/survey/:token/submit')
  async submitByToken(
    @Param('token') token: string,
    @Body() body: { answers: any; respondentMeta?: any },
  ) {
    return this.submitImpl(token, body);
  }

  private async submitImpl(
    token: string,
    body: { answers: any; respondentMeta?: any },
  ) {
    const link = await this.getLinkOr404(token);

    const lastAttempt = await this.prisma.surveyResponse.aggregate({
      where: { linkId: link.id },
      _max: { attemptNo: true },
    });
    const attemptNo = (lastAttempt._max.attemptNo ?? 0) + 1;

    const resp = await this.prisma.surveyResponse.create({
      data: {
        surveyId: link.surveyId,
        insureeId: link.insureeId,
        linkId: link.id,
        attemptNo,
        respondentMeta: body.respondentMeta ?? undefined,
        answers: body.answers ?? {},
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      select: { id: true, status: true, submittedAt: true, attemptNo: true },
    });

    await this.prisma.surveyLink.update({
      where: { id: link.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    return resp;
  }

  // --- DRAFT: GET current ---
  @Get('s/:token/draft')
  async getDraft_prefixed(@Param('token') token: string) {
    return this.getDraftImpl(token);
  }

  @Get('/survey/:token/draft')
  async getDraft(@Param('token') token: string) {
    return this.getDraftImpl(token);
  }

  private async getDraftImpl(token: string) {
    const link = await this.getLinkOr404(token);
    const current = await this.prisma.surveyResponse.findFirst({
      where: { linkId: link.id, submittedAt: null, status: 'IN_PROGRESS' },
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

  // --- DRAFT: POST save ---
  @Post('s/:token/draft')
  @HttpCode(200)
  async saveDraft_prefixed(
    @Param('token') token: string,
    @Body() body: { answers?: any; respondentMeta?: any },
  ) {
    return this.saveDraftImpl(token, body);
  }

  @Post('/survey/:token/draft')
  @HttpCode(200)
  async saveDraft(
    @Param('token') token: string,
    @Body() body: { answers?: any; respondentMeta?: any },
  ) {
    return this.saveDraftImpl(token, body);
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
        completenessPercent: new Prisma.Decimal(isFinite(progress) ? progress : 0),
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

    return {
      ok: true,
      id: updated.id,
      attemptNo: updated.attemptNo,
      completenessPercent: updated.completenessPercent,
      lastSavedAt: updated.lastSavedAt,
    };
  }

  // --- OPEN (optional, для логирования посещения) ---
  @Post('s/:token/open')
  @HttpCode(200)
  async open_prefixed(@Param('token') token: string) {
    await this.getLinkOr404(token);
    return { ok: true };
  }

  @Post('/survey/:token/open')
  @HttpCode(200)
  async open(@Param('token') token: string) {
    await this.getLinkOr404(token);
    return { ok: true };
  }
}
