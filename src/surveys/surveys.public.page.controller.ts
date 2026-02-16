//
//  src/surveys/surveys.public.page.controller.ts
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

    const templateKey = (link.survey?.schema as any)?.template ?? 'small';
    const fileName =
      templateKey === 'medium' ? 'v1_medium.html' :
      templateKey === 'large' ? 'v1_large.html' :
      'v1_small.html';

    // ✅ ВАЖНО: __dirname вместо process.cwd()
    const filePath = path.join(__dirname, 'templates', fileName);

    // ✅ Временный дебаг (можно убрать после)
    console.log('[SURVEY PAGE] templateKey=', templateKey, 'fileName=', fileName);
    console.log('[SURVEY PAGE] __dirname=', __dirname);
    console.log('[SURVEY PAGE] filePath=', filePath);

    let html = await fs.readFile(filePath, 'utf-8');

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
