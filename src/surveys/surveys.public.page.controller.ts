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

  @Get('s/:token')
  async page(@Param('token') token: string, @Res() res: Response) {
    const link = await this.publicService.getLinkForRender(token);

    const templateKey = (link.survey?.schema as any)?.template ?? 'small';
    const fileName =
      templateKey === 'medium' ? 'v1_medium.html' :
      templateKey === 'large' ? 'v1_large.html' :
      'v1_small.html';

    const filePath = path.join(process.cwd(), 'dist', 'surveys', 'templates', fileName);
    let html = await fs.readFile(filePath, 'utf-8');

    const apiBase = (process.env.PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

    html = html
      .replaceAll('__TOKEN__', token)
      .replaceAll('__API_BASE__', apiBase)
      .replaceAll('__SURVEY_TITLE__', link.survey?.title ?? 'Опрос');

    res.type('html');
    return res.send(html);
  }
}
