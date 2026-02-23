// src/surveys/surveys.public.controller.ts
import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';

import { SurveysPublicService } from './surveys.public.service';
import { SaveSurveyResponseDto, SubmitSurveyResponseDto } from './dto/public-response.dto';

import { INSURER_SURVEY_UI_V2 } from './v2/insurer_ui';
import { SURVEY_V2_PRESENTATION } from './v2/presentation';

@Controller('survey')
export class SurveysPublicController {
  private readonly logger = new Logger(SurveysPublicController.name);

  constructor(private readonly publicService: SurveysPublicService) {}

  @Get(':token')
  async getLink(@Param('token') token: string) {
    const link = await this.publicService.getLinkByToken(token);
    this.logger.debug(`GET /survey/${token} -> status=${link.status} surveyId=${link.surveyId}`);
    return link;
  }

  @Get(':token/ui')
  async getUi(@Param('token') token: string) {
    // Берем "мягкую" версию получения ссылки для UI: не валим по EXPIRED/DEACTIVATED
    const link = await this.publicService.getLinkForUi(token);

    const version = link.survey?.version;
    const status = link.status;
    this.logger.debug(
      `GET /survey/${token}/ui -> linkId=${link.id} status=${status} surveyVersion=${version}`,
    );

    if (!version) {
      this.logger.warn(`UI: survey.version is missing for linkId=${link.id}`);
      return { version: null, ui: null, presentation: null };
    }

    if (version !== 'v2') {
      this.logger.warn(
        `UI: version mismatch for linkId=${link.id}. Expected v2, got ${version}`,
      );
      return { version, ui: null, presentation: null };
    }

    // Для v2 отдаем UI/presentation из кодовой базы
    const payload = {
      version: 'v2' as const,
      ui: INSURER_SURVEY_UI_V2,
      presentation: SURVEY_V2_PRESENTATION,
    };

    this.logger.debug(
      `UI: returning v2 ui & presentation for linkId=${link.id} pages=${INSURER_SURVEY_UI_V2.pages.length} presSections=${SURVEY_V2_PRESENTATION.sections.length}`,
    );

    return payload;
  }

  @Post(':token/open')
  open(@Param('token') token: string) {
    return this.publicService.open(token);
  }

  @Post(':token/save')
  save(@Param('token') token: string, @Body() dto: SaveSurveyResponseDto) {
    return this.publicService.save(token, dto);
  }

  @Post(':token/submit')
  submit(@Param('token') token: string, @Body() dto: SubmitSurveyResponseDto) {
    return this.publicService.submit(token, dto);
  }

  @Get(':token/current')
  current(@Param('token') token: string) {
    return this.publicService.getCurrent(token);
  }

  @Get(':token/results')
  results(@Param('token') token: string) {
    return this.publicService.getSubmitted(token);
  }
}
