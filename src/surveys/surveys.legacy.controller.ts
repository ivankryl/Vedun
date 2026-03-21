// src/surveys/surveys.legacy.controller.ts
import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { SurveysPublicService } from './surveys.public.service';
import {
  SaveSurveyResponseDto,
  SubmitSurveyResponseDto,
} from './dto/public-response.dto';

@Controller('s')
export class SurveysLegacyController {
  private readonly logger = new Logger(SurveysLegacyController.name);

  constructor(private readonly publicService: SurveysPublicService) {}

  @Get(':uuid')
  async getLink(@Param('uuid') uuid: string) {
    const link = await this.publicService.getLinkByUuid(uuid);
    if (!link) throw new NotFoundException('Link not found');
    this.logger.debug(`GET /s/${uuid} -> token=${link.token} version=${link?.survey?.version}`);
    return link;
  }

  @Get(':uuid/ui')
  async getUi(@Param('uuid') uuid: string) {
    const token = await this.publicService.resolveTokenByUuid(uuid);
    // Переиспользуем уже готовую логику выборки UI по версии
    // Эквивалент GET /survey/:token/ui
    return await (async () => {
      // Мягкий режим, как в SurveysPublicController
      const link = await this.publicService.getLinkForUi(token);
      const version = link?.survey?.version ?? null;

      // Импорты оставляем в контроллере surveys.public.controller.ts
      // Чтобы не дублировать, можно вынести сборку payload в сервис-хелпер,
      // но для краткости — скопируйте ту же логику сюда или вызовите приватный метод.
      const { INSURER_SURVEY_UI_V2 } = await import('./v2/insurer_ui'); // если у вас commonjs/esModule — подстройте
      const { SURVEY_V2_PRESENTATION } = await import('./v2/presentation');
      const INSURER_SURVEY_UI_V3 = (await import('./v3/insurer_ui')).default;
      const { SURVEY_V3_PRESENTATION } = await import('./v3/presentation');

      if (version === 'v2') {
        return {
          version: 'v2' as const,
          ui: INSURER_SURVEY_UI_V2,
          presentation: SURVEY_V2_PRESENTATION,
        };
      }
      if (version === 'v3') {
        return {
          version: 'v3' as const,
          ui: INSURER_SURVEY_UI_V3,
          presentation: SURVEY_V3_PRESENTATION,
        };
      }
      return { version, ui: null, presentation: null };
    })();
  }

  @Post(':uuid/open')
  async open(@Param('uuid') uuid: string) {
    const token = await this.publicService.resolveTokenByUuid(uuid);
    return this.publicService.open(token);
  }

  @Post(':uuid/save')
  async save(@Param('uuid') uuid: string, @Body() dto: SaveSurveyResponseDto) {
    const token = await this.publicService.resolveTokenByUuid(uuid);
    return this.publicService.save(token, dto);
  }

  @Post(':uuid/submit')
  async submit(@Param('uuid') uuid: string, @Body() dto: SubmitSurveyResponseDto) {
    const token = await this.publicService.resolveTokenByUuid(uuid);
    return this.publicService.submit(token, dto);
  }

  @Get(':uuid/current')
  async current(@Param('uuid') uuid: string) {
    const token = await this.publicService.resolveTokenByUuid(uuid);
    return this.publicService.getCurrent(token);
  }

  @Get(':uuid/results')
  async results(@Param('uuid') uuid: string) {
    const token = await this.publicService.resolveTokenByUuid(uuid);
    return this.publicService.getSubmitted(token);
  }
}
