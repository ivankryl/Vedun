// src/surveys/surveys.public.page.controller.ts
import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SurveysPublicService } from './surveys.public.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Controller()
export class SurveysPublicPageController {
  constructor(private readonly publicService: SurveysPublicService) {}

  @Get('s/:id')
  async page(@Param('id') id: string, @Res() res: Response) {
    const link = await this.publicService.getLinkForRender(id);

    const schema: any = link.survey?.schema ?? {};
    const surveyVersion: string | undefined =
      (link.survey as any)?.version ?? schema?.version;

    // ✅ v2: редиректим на фронт (SPA), никаких v1 html
    if (surveyVersion === 'v2') {
      const frontendBase = (process.env.PUBLIC_FRONTEND_URL || '').replace(/\/$/, '');
      if (!frontendBase) {
        return res.status(500).send('PUBLIC_FRONTEND_URL is not set');
      }

      // предполагаем, что фронт умеет открывать по /s/:uuid
      return res.redirect(302, `${frontendBase}/s/${encodeURIComponent(id)}`);
    }

    // ✅ v1: старая логика html templates
    const templateKey = schema?.template ?? 'small';
    const fileName =
      templateKey === 'medium'
        ? 'v1_medium.html'
        : templateKey === 'large'
          ? 'v1_large.html'
          : 'v1_small.html';

    const filePath = path.join(__dirname, 'templates', fileName);
    let html = await fs.readFile(filePath, 'utf-8');

    // ВАЖНО: твой PublicController исключён из /api, значит base должен быть без /api
    const apiBase = (process.env.PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
    const replaceAll = (s: string, search: string, value: string) =>
      s.split(search).join(value);

    html = replaceAll(html, '__TOKEN__', link.token);
    html = replaceAll(html, '__API_BASE__', apiBase);
    html = replaceAll(html, '__SURVEY_TITLE__', link.survey?.title ?? 'Опрос');

    res.type('html');
    return res.send(html);
  }
}
