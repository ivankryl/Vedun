// src/surveys/surveys.public.page.controller.ts
import { Controller, Get, Logger, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SurveysPublicService } from './surveys.public.service';

@Controller()
export class SurveysPublicPageController {
  private readonly logger = new Logger(SurveysPublicPageController.name);

  constructor(private readonly publicService: SurveysPublicService) {}

  // Единая публичная страница: перенаправляем на SPA по UUID для всех версий (v2, v3)
  @Get('s/:id')
  async page(@Param('id') id: string, @Res() res: Response) {
    // Жёсткая проверка валидности ссылки (EXPIRED/DEACTIVATED выбрасывают 400)
    const link = await this.publicService.getLinkForRender(id);

    const surveyVersion: string | undefined =
      (link.survey as any)?.version ?? (link.survey?.schema as any)?.version;

    const frontendBase = (process.env.PUBLIC_FRONTEND_URL || '').replace(/\/$/, '');
    if (!frontendBase) {
      this.logger.error('PUBLIC_FRONTEND_URL is not set');
      return res.status(500).send('PUBLIC_FRONTEND_URL is not set');
    }

    // Унификация: всегда редиректим на SPA по UUID
    const target = `${frontendBase}/s/${encodeURIComponent(link.uuid)}`;
    this.logger.debug(
      `PAGE_REDIRECT: incomingId=${id} -> uuid=${link.uuid} version=${surveyVersion ?? 'n/a'} -> ${target}`,
    );

    return res.redirect(302, target);
  }
}
