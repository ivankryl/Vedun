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
import { SaveSurveyResponseDto, SubmitSurveyResponseDto } from './dto/public-response.dto';

@Controller('s')
export class SurveysLegacyController {
  private readonly logger = new Logger(SurveysLegacyController.name);

  constructor(private readonly publicService: SurveysPublicService) {}

  // Метаданные ссылки (старый фронт ожидал /s/:uuid)
  @Get(':uuid')
  async getLink(@Param('uuid') uuid: string) {
    const link = await this.publicService.getLinkByUuid(uuid);
    // Не логируем token, так как мы его принципиально не возвращаем и не используем в публичном контуре
    this.logger.debug(`GET /s/${uuid} -> version=${link?.survey?.version ?? 'n/a'}`);
    return link;
  }

  // UI + presentation. Выбор версии по link.survey.version
  @Get(':uuid/ui')
  async getUi(@Param('uuid') uuid: string) {
    const link = await this.publicService.getLinkForUi(uuid);
    const version = link?.survey?.version ?? null;

    // Импорты UI и презентаций
    // Приведите пути к вашим реальным файлам
    // Для v2
    const { INSURER_SURVEY_UI_V2 } = await import('./v2/insurer_ui');
    const { SURVEY_V2_PRESENTATION } = await import('./v2/presentation');
    // Для v3
    const INSURER_SURVEY_UI_V3 = (await import('./v3/insurer_ui')).default;
    const { SURVEY_V3_PRESENTATION } = await import('./v3/presentation');

    if (version === 'v2') {
      this.logger.debug(`UI[v2]: uuid=${uuid}`);
      return {
        version: 'v2' as const,
        ui: INSURER_SURVEY_UI_V2,
        presentation: SURVEY_V2_PRESENTATION,
      };
    }
    if (version === 'v3') {
      this.logger.debug(`UI[v3]: uuid=${uuid}`);
      return {
        version: 'v3' as const,
        ui: INSURER_SURVEY_UI_V3,
        presentation: SURVEY_V3_PRESENTATION,
      };
    }

    this.logger.warn(`UI[unknown]: uuid=${uuid} version=${version}`);
    throw new NotFoundException('Unknown survey version');
  }

  @Post(':uuid/open')
  async open(@Param('uuid') uuid: string) {
    // сервис принимает uuid или token — uuid достаточно
    return this.publicService.open(uuid);
  }

  @Post(':uuid/save')
  async save(@Param('uuid') uuid: string, @Body() dto: SaveSurveyResponseDto) {
    return this.publicService.save(uuid, dto);
  }

  @Post(':uuid/submit')
  async submit(@Param('uuid') uuid: string, @Body() dto: SubmitSurveyResponseDto) {
    return this.publicService.submit(uuid, dto);
  }

  @Get(':uuid/current')
  async current(@Param('uuid') uuid: string) {
    return this.publicService.getCurrent(uuid);
  }

  @Get(':uuid/results')
  async results(@Param('uuid') uuid: string) {
    return this.publicService.getSubmitted(uuid);
  }
}
