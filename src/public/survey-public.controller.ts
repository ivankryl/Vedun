// src/public/public.controller.ts
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('public')
export class PublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('s/:token')
  async getSurveyByToken(@Param('token') token: string) {
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
            schema: true, // ✅ в вашей модели это поле называется schema
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

  @Post('s/:token/submit')
  async submitByToken(
    @Param('token') token: string,
    @Body() body: { answers: any; respondentMeta?: any },
  ) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { token },
      select: {
        id: true, // ✅ нужен для linkId
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

    // attemptNo обязателен и уникален в рамках linkId
    const lastAttempt = await this.prisma.surveyResponse.aggregate({
      where: { linkId: link.id },
      _max: { attemptNo: true },
    });
    const attemptNo = (lastAttempt._max.attemptNo ?? 0) + 1;

    const resp = await this.prisma.surveyResponse.create({
      data: {
        surveyId: link.surveyId,
        insureeId: link.insureeId,
        linkId: link.id, // ✅ FK на SurveyLink.id

        attemptNo, // ✅ обязательно

        // Для Json? в Prisma v6 лучше не писать null — просто не передавать
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
