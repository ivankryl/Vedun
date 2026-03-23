// src/surveys/surveys.survey-redirect.controller.ts
import { Controller, Get, Logger, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SurveysPublicService } from './surveys.public.service';

@Controller()
export class SurveysSurveyRedirectController {
  private readonly logger = new Logger(SurveysSurveyRedirectController.name);

  constructor(private readonly publicService: SurveysPublicService) {}

  // Редиректит старые ссылки /survey/:id на фронт по /s/:uuid
  @Get('survey/:id')
  async redirect(@Param('id') id: string, @Res() res: Response) {
    const link = await this.publicService.getLinkForUi(id); // принимает uuid или token
    const frontendBase = (process.env.PUBLIC_FRONTEND_URL || '').replace(/\/$/, '');
    if (!frontendBase) {
      this.logger.error('PUBLIC_FRONTEND_URL is not set');
      return res.status(500).send('PUBLIC_FRONTEND_URL is not set');
    }
    const target = `${frontendBase}/s/${encodeURIComponent(link.uuid)}`;
    this.logger.debug(`SURVEY_REDIRECT: id=${id} -> uuid=${link.uuid} -> ${target}`);
    return res.redirect(302, target);
  }
}
