// src/surveys/surveys.debug.controller.ts
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('debug/survey')
export class SurveysDebugController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':token/raw-template')
  async rawTemplate(@Param('token') token: string) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { OR: [{ token }, { uuid: token }] },
      select: { surveyId: true },
    });
    if (!link) throw new NotFoundException('Link not found');

    const template = await this.prisma.surveyTemplate.findUnique({
      where: { id: link.surveyId },
      select: { id: true, version: true, title: true, schema: true },
    });
    if (!template) throw new NotFoundException('Template not found');

    return {
      ...template,
      schema: template.schema ? JSON.parse(JSON.stringify(template.schema)) : null,
    };
  }
}
