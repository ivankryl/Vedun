// src/surveys/surveys.public.controller.ts
import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';

import { SurveysPublicService } from './surveys.public.service';
import {
  SaveSurveyResponseDto,
  SubmitSurveyResponseDto,
} from './dto/public-response.dto';

import { INSURER_SURVEY_UI_V2 } from './v2/insurer_ui';
import { SURVEY_V2_PRESENTATION } from './v2/presentation';

import INSURER_SURVEY_UI_V3 from './v3/insurer_ui';
import { SURVEY_V3_PRESENTATION } from './v3/presentation';

type UiV2OkPayload = {
  version: 'v2';
  ui: typeof INSURER_SURVEY_UI_V2;
  presentation: typeof SURVEY_V2_PRESENTATION;
};

type UiV3OkPayload = {
  version: 'v3';
  ui: typeof INSURER_SURVEY_UI_V3;
  presentation: typeof SURVEY_V3_PRESENTATION;
};

type UiFailPayload = {
  version: string | null;
  ui: null;
  presentation: null;
};

type UiPayload = UiV2OkPayload | UiV3OkPayload | UiFailPayload;

@Controller('survey')
export class SurveysPublicController {
  private readonly logger = new Logger(SurveysPublicController.name);

  constructor(private readonly publicService: SurveysPublicService) {}

  @Get(':token')
  async getLink(@Param('token') token: string) {
    const link = await this.publicService.getLinkByToken(token);
    this.logger.debug(
      `GET /survey/${token} -> status=${link.status} surveyId=${link.surveyId}`,
    );
    return link;
  }

  @Get(':token/ui')
  async getUi(@Param('token') token: string): Promise<UiPayload> {
    const link = await this.publicService.getLinkForUi(token);

    const linkId = link?.id ?? 'unknown';
    const status = link?.status ?? 'unknown';
    const version = link?.survey?.version ?? null;

    this.logger.debug(
      `GET /survey/${token}/ui -> linkId=${linkId} status=${status} surveyVersion=${version}`,
    );

    if (version === 'v2') {
      const payload: UiV2OkPayload = {
        version: 'v2',
        ui: INSURER_SURVEY_UI_V2,
        presentation: SURVEY_V2_PRESENTATION,
      };
      this.logger.debug(
        `UI[v2]: linkId=${linkId} pages=${INSURER_SURVEY_UI_V2.pages.length} presSections=${SURVEY_V2_PRESENTATION.sections.length}`,
      );
      return payload;
    }

    if (version === 'v3') {
      const payload: UiV3OkPayload = {
        version: 'v3',
        ui: INSURER_SURVEY_UI_V3,
        presentation: SURVEY_V3_PRESENTATION,
      };
      this.logger.debug(
        `UI[v3]: linkId=${linkId} pages=${INSURER_SURVEY_UI_V3.pages.length} presSections=${SURVEY_V3_PRESENTATION.sections.length}`,
      );
      return payload;
    }

    if (!version) {
      this.logger.warn(`UI: survey.version is missing for linkId=${linkId}`);
    } else {
      this.logger.warn(`UI: unsupported version for linkId=${linkId}: ${version}`);
    }

    const payload: UiFailPayload = { version, ui: null, presentation: null };
    return payload;
  }

  @Post(':token/open')
  async open(@Param('token') token: string) {
    const res = await this.publicService.open(token);
    this.logger.debug(`POST /survey/${token}/open -> ok`);
    return res;
  }

  // Совместимость: старый фронт дергает /save, новый — /draft.
  // Оба идут в один и тот же сервисный метод save().
  @Post(':token/save')
  async save(
    @Param('token') token: string,
    @Body() dto: SaveSurveyResponseDto,
  ) {
    const res = await this.publicService.save(token, dto);
    this.logger.debug(`POST /survey/${token}/save -> ok`);
    return res;
  }

  @Post(':token/draft')
  async saveDraft(
    @Param('token') token: string,
    @Body() dto: SaveSurveyResponseDto,
  ) {
    const res = await this.publicService.save(token, dto);
    this.logger.debug(`POST /survey/${token}/draft -> ok`);
    return res;
  }

  @Post(':token/submit')
  async submit(
    @Param('token') token: string,
    @Body() dto: SubmitSurveyResponseDto,
  ) {
    const res = await this.publicService.submit(token, dto);
    this.logger.debug(`POST /survey/${token}/submit -> ok`);
    return res;
  }

  @Get(':token/current')
  async current(@Param('token') token: string) {
    const res = await this.publicService.getCurrent(token);
    this.logger.debug(`GET /survey/${token}/current -> ok`);
    return res;
  }

  @Get(':token/results')
  async results(@Param('token') token: string) {
    const res = await this.publicService.getSubmitted(token);
    this.logger.debug(`GET /survey/${token}/results -> ok`);
    return res;
  }
    // Alias для совместимости с новым фронтом: загрузка черновика
    @Get(':token/draft')
    async draft(@Param('token') token: string) {
      const res = await this.publicService.getCurrent(token);
      this.logger.debug(`GET /survey/${token}/draft -> ok`);
      return res;
    }
}
