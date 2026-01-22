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
        uuid: true,
        token: true,
        status: true,
        expiresAt: true,
        insureeId: true,
        surveyId: true,
        survey: {
          select: {
            id: true,
            title: true,
            status: true,
            questions: true,
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
        uuid: true,
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

    const resp = await this.prisma.surveyResponse.create({
      data: {
        // вместо несуществующего surveyLinkId — подключаем relation через connect
        survey: { connect: { id: link.surveyId } },
        insuree: { connect: { id: link.insureeId } },
        surveyLink: { connect: { uuid: link.uuid } },

        respondentMeta: body.respondentMeta ?? undefined, // ✅ не null
        answers: body.answers ?? {},
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      select: { id: true, status: true, submittedAt: true },
    });

    await this.prisma.surveyLink.update({
      where: { uuid: link.uuid },
      data: { status: 'COMPLETED' },
    });

    return resp;
  }
}
