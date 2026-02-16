// src/public/public.controller.ts
import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class PublicController {
  constructor(private readonly prisma: PrismaService) {}

    @Get('debug/last-links')
    async lastLinks() {
      return this.prisma.surveyLink.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, uuid: true, token: true, createdAt: true, insureeId: true, surveyId: true },
      });
    }

  @Get('s/:id')
  async getSurveyLinkPublic(@Param('id') id: string) {
      console.log('[public /s] id param =', id);
      const link = await this.prisma.surveyLink.findFirst({
      where: {
          OR: [{ id }, { uuid: id }, { token: id }],
      },
      select: {
        id: true,
        uuid: true,
        token: true,
        status: true,
        expiresAt: true,
        insureeId: true,
        surveyId: true,
        survey: {
          select: { id: true, version: true, title: true, status: true, schema: true },
        },
      },
    });
    
    console.log('[public /s] found =', !!link, link?.id, link?.uuid, link?.token);
    
    if (!link) {
      throw new NotFoundException({
        code: 'LINK_NOT_FOUND',
        message: 'Survey link not found',
      });
    }

    return link;
  }

  @Post('s/:token/submit')
  async submitByToken(
    @Param('token') token: string,
    @Body() body: { answers: any; respondentMeta?: any },
  ) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { token },
      select: {
        id: true,
        insureeId: true,
        surveyId: true,
        status: true,
        expiresAt: true,
      },
    });

    if (!link) {
      throw new NotFoundException({
        code: 'LINK_NOT_FOUND',
        message: 'Survey link not found',
      });
    }

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
}
