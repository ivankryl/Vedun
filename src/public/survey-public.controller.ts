// src/public/survey-public.controller.ts
import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

@Controller()
export class SurveyPublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('survey/:token')
  async renderSurvey(@Param('token') token: string, @Res() res: Response) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { token },
      select: { id: true, survey: { select: { version: true } } },
    });

    if (!link) throw new NotFoundException('Survey link not found');

    const version = link.survey.version; // ожидаем: V1_SMALL | V1_MEDIUM | V1_LARGE

    const file =
        version === 'V1_SMALL' ? 'v1_small.html' :
        version === 'V1_MEDIUM' ? 'v1_medium.html' :
        version === 'V1_LARGE' ? 'v1_large.html' :
        null;

      if (!file) throw new NotFoundException(`Unknown survey version: ${version}`);


    const path = join(process.cwd(), 'dist', 'templates', file);
    let html = await readFile(path, 'utf-8');

    // Простейший способ “передать токен” в шаблон:
    html = html.replace(
      '</head>',
      `<script>window.SURVEY_TOKEN=${JSON.stringify(token)};</script></head>`,
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }
}
