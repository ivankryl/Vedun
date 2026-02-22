// src/surveys/surveys.public.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { SurveysPublicService } from './surveys.public.service'
import { SaveSurveyResponseDto, SubmitSurveyResponseDto } from './dto/public-response.dto'

import { INSURER_SURVEY_UI_V2 } from './v2/insurer_ui'
import { SURVEY_V2_PRESENTATION } from './v2/presentation'

@Controller('survey')
export class SurveysPublicController {
  constructor(private readonly publicService: SurveysPublicService) {}

  @Get(':token')
  getLink(@Param('token') token: string) {
    return this.publicService.getLinkByToken(token)
  }

  @Get(':token/ui')
  async getUi(@Param('token') token: string) {
    // ВАЖНО: у тебя getLinkOrThrow = private, поэтому берём публичный метод,
    // который его вызывает и возвращает link вместе с survey.schema/version.
    const link = await this.publicService.getLinkForRender(token)

    const schema: any = link.survey?.schema ?? {}
    const version = (link.survey as any)?.version ?? schema?.version

    if (version !== 'v2') {
      return { version, ui: null, presentation: null }
    }

    return {
      version: 'v2',
      ui: INSURER_SURVEY_UI_V2,
      presentation: SURVEY_V2_PRESENTATION,
    }
  }

  @Post(':token/open')
  open(@Param('token') token: string) {
    return this.publicService.open(token)
  }

  @Post(':token/save')
  save(@Param('token') token: string, @Body() dto: SaveSurveyResponseDto) {
    return this.publicService.save(token, dto)
  }

  @Post(':token/submit')
  submit(@Param('token') token: string, @Body() dto: SubmitSurveyResponseDto) {
    return this.publicService.submit(token, dto)
  }

  @Get(':token/current')
  current(@Param('token') token: string) {
    return this.publicService.getCurrent(token)
  }

  @Get(':token/results')
  results(@Param('token') token: string) {
    return this.publicService.getSubmitted(token)
  }
}
