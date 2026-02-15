// src/public/public.controller.ts
import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class PublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('s/:id')
  async getSurveyLinkPublic(@Param('id') id: string) {
    const link = await this.prisma.surveyLink.findFirst({
      where: {
        OR: [{ uuid: id }, { token: id }],
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
