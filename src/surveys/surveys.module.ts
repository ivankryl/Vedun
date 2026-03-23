// src/surveys/surveys.module.ts
import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { InsuranceAccessModule } from '../modules/insurance-access/insurance-access.module'

import { SurveysController } from './surveys.controller'
import { SurveysService } from './surveys.service'

import { SurveysPublicController } from './surveys.public.controller'
import { SurveysPublicService } from './surveys.public.service'
import { SurveysPublicPageController } from './surveys.public.page.controller'
import { SurveysDebugController } from './surveys.debug.controller'
import { SurveysLegacyController } from './surveys.legacy.controller';
import { SurveysSurveyRedirectController } from './surveys.survey-redirect.controller';

@Module({
  imports: [PrismaModule, InsuranceAccessModule],
  controllers: [
    SurveysController,
    SurveysPublicController,
    SurveysPublicPageController,
    SurveysDebugController,
    SurveysLegacyController,
    SurveysSurveyRedirectController,
  ],
  providers: [SurveysService, SurveysPublicService],
  exports: [SurveysService, SurveysPublicService],
})
export class SurveysModule {}
