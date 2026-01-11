//  src/public/public.controller.ts
import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Controller('public')
export class PublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('s/:token')
  async getSurveyByToken(@Param('token') token: string) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { token },
      select: {
        id: true,
        token: true,
        status: true,
        expiresAt: true,
        insuredId: true,
        surveyId: true,
        survey: { select: { id: true, version: true, title: true, schema: true, status: true } },
      },
    });

    if (!link) {
      throw new NotFoundException({ code: 'LINK_NOT_FOUND', message: 'Survey link not found' });
    }

    // MVP: без проверки expiresAt/status (можно добавить позже)
    return link;
  }

  @Post('s/:token/submit')
  async submitByToken(
    @Param('token') token: string,
    @Body() body: { answers: any; respondentMeta?: any }
  ) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { token },
      select: { id: true, insuredId: true, surveyId: true, status: true, expiresAt: true },
    });

    if (!link) {
      throw new NotFoundException({ code: 'LINK_NOT_FOUND', message: 'Survey link not found' });
    }

    const resp = await this.prisma.surveyResponse.create({
      data: {
        id: randomUUID(), // важно: SurveyResponse.id без @default
        surveyId: link.surveyId,
        insuredId: link.insuredId,
        linkId: link.id,
        respondentMeta: body.respondentMeta ?? null,
        answers: body.answers ?? {},
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      select: { id: true, status: true, submittedAt: true },
    });

    await this.prisma.surveyLink.update({
      where: { id: link.id },
      data: { status: 'COMPLETED' },
    });

    return resp;
  }
}
